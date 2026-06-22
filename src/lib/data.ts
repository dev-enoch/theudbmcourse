"use server";

import User from "@/models/User";
import ClaimedOrder from "@/models/ClaimedOrder";
import { connectDB } from "./mongoose";
import { hashPassword } from "./auth/password";
import path from "path";
import { Course } from "./types";
import fs from "fs/promises";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// -------------------------------
// USER FETCH
// -------------------------------
type GetUsersOptions = {
  page?: number; // current page, default 1
  limit?: number; // items per page, default 10
};

export async function getUsers({ page = 1, limit = 10 }: GetUsersOptions = {}) {
  await connectDB();

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);

  return {
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name ?? "",
      email: u.email,
      role: u.role,
      active: u.active ?? true,
      createdAt: u.createdAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// -------------------------------
// USER UPDATE
// -------------------------------
type UpdateUserInput = Partial<{
  role: "user" | "admin";
  active: boolean;
  name: string;
  email: string;
}>;

export async function updateUser(userId: string, updates: UpdateUserInput) {
  await connectDB();

  if (updates.role && updates.role !== "admin") {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error("User not found.");

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        throw new Error(
          "Cannot change role: there must be at least one admin."
        );
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedUser) throw new Error("User not found.");

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    active: updatedUser.active,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
}

// -------------------------------
// ADD USER + SEND LOGIN EMAIL
// -------------------------------
type AddUserInput = {
  name: string;
  email: string;
  role: "user" | "admin";
};

export async function addUser(input: AddUserInput) {
  await connectDB();

  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) throw new Error("User with this email already exists.");

  const defaultPassword = "123456";
  const hashedPassword = await hashPassword(defaultPassword);

  const newUser = await User.create({
    name: input.name,
    email: input.email,
    role: input.role,
    password: hashedPassword,
    active: true,
    progress: [],
  });

  // --- SEND ACTIVATION EMAIL USING TEMPLATE ---
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: input.email,
    subject: "Your Account Has Been Successfully Activated",
    template: {
      id: process.env.RESEND_ACTIVATION_TEMPLATE_ID!,
      variables: {
        name: input.name,
        email: input.email,
        password: defaultPassword,
        login_url: `${process.env.APP_URL}/login`,
      },
    },
  });

  return {
    id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    active: newUser.active,
    createdAt: newUser.createdAt,
  };
}

// -------------------------------
// RESEND LOGIN DETAILS
// -------------------------------
export async function resendLoginDetails(userId: string) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  const defaultPassword = "123456";
  const hashedPassword = await hashPassword(defaultPassword);

  user.password = hashedPassword;
  await user.save();

  // --- SEND RESEND LOGIN EMAIL USING TEMPLATE ---
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: user.email,
    subject: "Your Login Details Have Been Reset",
    template: {
      id: process.env.RESEND_RESEND_TEMPLATE_ID!,
      variables: {
        name: user.name,
        email: user.email,
        password: defaultPassword,
        login_url: `${process.env.APP_URL}`,
      },
    },
  });

  return {
    success: true,
    message: "Login details resent and password reset.",
  };
}

// -------------------------------
// DELETE USER
// -------------------------------
export async function deleteUser(userId: string) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw new Error("Cannot delete the last admin user.");
    }
  }

  await User.findByIdAndDelete(userId);

  return {
    success: true,
    message: `User ${user.email} deleted successfully.`,
  };
}

// -------------------------------
// USER PROGRESS
// -------------------------------
export async function getUserProgress(userId: string) {
  await connectDB();

  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found.");

  const progress: Record<string, boolean> = {};
  user.progress.forEach((p: any) => {
    progress[p.topicId] = p.completed;
  });

  return progress;
}

export async function updateUserProgress(
  userId: string,
  topicId: string,
  completed: boolean
) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  const existing = user.progress.find((p: any) => p.topicId === topicId);
  const isNewlyCompleted = (!existing || !existing.completed) && completed;

  if (existing) existing.completed = completed;
  else user.progress.push({ topicId, completed });

  await user.save();

  if (isNewlyCompleted) {
    // Send lesson completion email
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "hello@example.com",
      to: user.email,
      subject: "Lesson Completed! 🎉",
      html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2>Great job, ${user.name || 'Student'}!</h2>
        <p>You have successfully completed a lesson.</p>
        <p>Keep up the great work and continue your learning journey!</p>
        <a href="${process.env.APP_URL}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Continue Course</a>
      </div>`,
    }).catch(console.error);

    // Check if course is completed
    const courses = await readCoursesFile();
    let courseOfTopic = null;
    let allTopicIds: string[] = [];

    for (const course of courses) {
      allTopicIds = course.modules.flatMap(m => m.topics.map(t => t.id));
      if (allTopicIds.includes(topicId)) {
        courseOfTopic = course;
        break;
      }
    }

    if (courseOfTopic) {
      const completedTopicIds = user.progress.filter((p: any) => p.completed).map((p: any) => p.topicId);
      const isCourseCompleted = allTopicIds.every(id => completedTopicIds.includes(id));
      
      if (isCourseCompleted) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "hello@example.com",
          to: user.email,
          subject: "Course Completed! 🏆",
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Congratulations, ${user.name || 'Student'}!</h2>
            <p>You have successfully completed the entire course: <strong>${courseOfTopic.title}</strong>.</p>
            <p>Don't forget to join the exclusive group to connect with other students!</p>
            <a href="${process.env.APP_URL}" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          </div>`,
        }).catch(console.error);
      }
    }
  }

  return getUserProgress(userId);
}

export async function resetUserProgress(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");
  user.progress = [];
  await user.save();
  return { success: true, message: "Progress reset successfully." };
}

export async function resetDeviceLock(email: string) {
  await connectDB();
  const result = await ClaimedOrder.findOneAndDelete({ email });
  if (!result) throw new Error("No device lock found for this email.");
  return { success: true, message: "Device lock reset successfully." };
}

// -------------------------------
// COURSES
// -------------------------------
const coursesFilePath = path.join(process.cwd(), "src", "lib", "courses.json");

async function readCoursesFile(): Promise<Course[]> {
  try {
    const fileContent = await fs.readFile(coursesFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading courses.json:", error);
    return [];
  }
}

export async function getCourses(): Promise<Course[]> {
  const courses = await readCoursesFile();
  return courses.map(({ id, title, description }) => ({
    id,
    title,
    description,
    modules: [],
  }));
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  const courses = await readCoursesFile();
  return courses.find((course) => course.id === id);
}

// -------------------------------
// ADMIN ANALYTICS
// -------------------------------
export async function getAdminAnalytics() {
  await connectDB();

  const [totalUsers, totalAdmins, courses] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "admin" }),
    readCoursesFile(),
  ]);

  // To calculate total completed lessons, we aggregate across all users
  const result = await User.aggregate([
    { $unwind: "$progress" },
    { $match: { "progress.completed": true } },
    { $count: "totalCompletedLessons" }
  ]);
  
  const totalCompletedLessons = result.length > 0 ? result[0].totalCompletedLessons : 0;

  return {
    totalUsers,
    totalAdmins,
    totalCourses: courses.length,
    totalCompletedLessons,
  };
}
