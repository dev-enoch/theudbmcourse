"use server";

import User from "@/models/User";
import ClaimedOrder from "@/models/ClaimedOrder";
import { connectDB } from "./mongoose";
import { hashPassword } from "./auth/password";
import path from "path";
import { Course } from "./types";
import fs from "fs/promises";
import Settings from "@/models/Settings";
import { sendEmail, getEmailHtml, resend } from "@/lib/email";

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
    revokedCourses: [],
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
// USER PROGRESS & PROFILE
// -------------------------------
export async function getUserProfile(userId: string) {
  await connectDB();
  const user = await User.findById(userId).lean() as any;
  if (!user) return null;

  const normalizedEmail = user.email.trim().toLowerCase();
  const allOrders = await ClaimedOrder.find({ email: new RegExp(`^${normalizedEmail}$`, "i") }).sort({ updatedAt: -1 }).lean() as any[];
  
  // Find the active order if it exists, otherwise use the most recent one
  const activeOrder = allOrders.find(
    (o) => !["reset-by-admin", "reset-by-logout", "webhook-auto-enroll"].includes(o.deviceKey)
  );
  const order = activeOrder || (allOrders.length > 0 ? allOrders[0] : null);

  return {
    ...user,
    id: user._id.toString(),
    _id: user._id.toString(),
    claimedOrder: order ? {
      ...order,
      id: order._id.toString(),
      _id: order._id.toString()
    } : null
  };
}

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
    const settings = await Settings.findOne().lean();

    // Send lesson completion email
    if (settings?.lessonCompletionEmailsEnabled) {
      const htmlBody = `
        <p>Great job, ${user.name || 'Student'}!</p>
        <p>You have successfully completed a lesson.</p>
        <p>Keep up the great work and continue your learning journey!</p>
        <a href="${process.env.APP_URL}" class="button">Continue Course</a>
      `;
      await sendEmail(user.email, "Lesson Completed! 🎉", getEmailHtml("Lesson Completed!", htmlBody)).catch(console.error);
    }

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
      
      if (isCourseCompleted && settings?.courseCompletionEmailsEnabled) {
        const htmlBody = `
          <p>Congratulations, ${user.name || 'Student'}!</p>
          <p>You have successfully completed the entire course: <strong>${courseOfTopic.title}</strong>.</p>
          <p>Don't forget to join the exclusive group to connect with other students!</p>
          <a href="${process.env.APP_URL}" class="button" style="background-color: #16a34a;">Go to Dashboard</a>
        `;
        await sendEmail(user.email, "Course Completed! 🏆", getEmailHtml("Course Completed!", htmlBody)).catch(console.error);
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
  const result = await ClaimedOrder.deleteMany({ email });
  if (result.deletedCount === 0) throw new Error("No device lock found for this email.");
  return { success: true, message: "Device lock reset successfully." };
}

// -------------------------------
// COURSES
// -------------------------------
const coursesFilePath = path.join(process.cwd(), "src", "lib", "courses.json");

export async function readCoursesFile(): Promise<Course[]> {
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

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1); // Start of the month 12 months ago

  const [
    totalUsers,
    totalAdmins,
    suspendedUsersCount,
    deviceLocksCount,
    courses,
    signupsResult,
    monthlyUsersResult,
    topLessonsResult,
    accountHealthResult,
    deviceClaimsResult,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user", active: false }),
    ClaimedOrder.countDocuments(),
    readCoursesFile(),
    // Old 7-day signups
    User.aggregate([
      { $match: { role: "user", createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    // 1. Monthly Users & Revenue (last 12 months)
    User.aggregate([
      { $match: { role: "user", createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, 
          count: { $sum: 1 } 
      } },
      { $sort: { _id: 1 } }
    ]),
    // 2. Top 5 Most Engaging Lessons
    User.aggregate([
      { $unwind: "$progress" },
      { $match: { "progress.completed": true, role: "user" } },
      { $group: { _id: "$progress.topicId", completions: { $sum: 1 } } },
      { $sort: { completions: -1 } },
      { $limit: 5 }
    ]),
    // 3. Account Health
    User.aggregate([
      { $match: { role: "user" } },
      { $group: {
          _id: {
            active: { $ifNull: ["$active", true] },
            hasRevoked: { $gt: [{ $size: { $ifNull: ["$revokedCourses", []] } }, 0] }
          },
          count: { $sum: 1 }
      }}
    ]),
    // 4. Device Claims Over Time (30 days)
    ClaimedOrder.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  // To calculate total completed lessons, we aggregate across all users
  const result = await User.aggregate([
    { $unwind: "$progress" },
    { $match: { "progress.completed": true } },
    { $count: "totalCompletedLessons" }
  ]);
  const totalCompletedLessons = result.length > 0 ? result[0].totalCompletedLessons : 0;

  // Format signups for 7-day chart
  const signupsOverTime = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = signupsResult.find((s: any) => s._id === dateStr);
    signupsOverTime.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      signups: found ? found.count : 0
    });
  }

  // Format Monthly Revenue & Users
  const monthlyRevenue = [];
  const REVENUE_PER_USER = 15000;
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const found = monthlyUsersResult.find((s: any) => s._id === monthStr);
    const usersCount = found ? found.count : 0;
    monthlyRevenue.push({
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      users: usersCount,
      revenue: usersCount * REVENUE_PER_USER
    });
  }

  // Map Top Lessons to Titles
  const topLessons = topLessonsResult.map((t: any) => {
    let title = t._id;
    for (const course of courses) {
      for (const module of course.modules) {
        const topic = module.topics.find((tp: any) => tp.id === t._id);
        if (topic) title = topic.title;
      }
    }
    return { name: title.substring(0, 20) + (title.length > 20 ? "..." : ""), completions: t.completions };
  });

  // Calculate Account Health
  let activeStatusCount = 0;
  let suspendedCount = 0;
  let revokedCount = 0;
  
  accountHealthResult.forEach((group: any) => {
    if (group._id.active && !group._id.hasRevoked) activeStatusCount += group.count;
    else if (!group._id.active) suspendedCount += group.count;
    else if (group._id.hasRevoked) revokedCount += group.count;
  });

  const accountHealth = [
    { name: "Active", value: activeStatusCount, fill: "#22c55e" },
    { name: "Suspended", value: suspendedCount, fill: "#f59e0b" },
    { name: "Revoked", value: revokedCount, fill: "#ef4444" },
  ];

  // Course Completion Breakdown
  // (We need to pull all users progress to check if they finished entire courses)
  const allUsersProgress = await User.find({ role: "user" }, { progress: 1 }).lean();
  const courseCompletions = courses.map(course => {
    const allTopicIds = course.modules.flatMap(m => m.topics.map(t => t.id));
    if (allTopicIds.length === 0) return { course: course.title, completionRate: 0 };
    
    let fullyCompletedCount = 0;
    allUsersProgress.forEach((u: any) => {
      const userCompletedTopicIds = u.progress?.filter((p: any) => p.completed).map((p: any) => p.topicId) || [];
      const hasCompletedAll = allTopicIds.every(id => userCompletedTopicIds.includes(id));
      if (hasCompletedAll) fullyCompletedCount++;
    });

    return {
      course: course.title.substring(0, 15) + (course.title.length > 15 ? "..." : ""),
      completionRate: allUsersProgress.length > 0 ? Math.round((fullyCompletedCount / allUsersProgress.length) * 100) : 0
    };
  });

  // Format Device Claims (Piracy Activity)
  const deviceClaims30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = deviceClaimsResult.find((s: any) => s._id === dateStr);
    deviceClaims30Days.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      claims: found ? found.count : 0
    });
  }

  return {
    totalUsers,
    totalAdmins,
    suspendedUsers: suspendedUsersCount,
    deviceLocksCount,
    totalCourses: courses.length,
    totalCompletedLessons,
    signupsOverTime,
    monthlyRevenue,
    topLessons,
    accountHealth,
    courseCompletions,
    deviceClaims30Days
  };
}
