"use server";

import User from "@/models/User";
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
export async function getUsers() {
  await connectDB();
  const users = await User.find().lean();

  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name ?? "",
    email: u.email,
    role: u.role,
    active: u.active ?? true,
    createdAt: u.createdAt,
  }));
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

  const bannerPath = path.join(process.cwd(), "src", "lib", "mail.png");
  const bannerData = await fs.readFile(bannerPath);
  const bannerBase64 = bannerData.toString("base64");

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: input.email,
    subject: "Your Login Credentials",
    html: `
      <div style="text-align:center; margin-bottom:20px;">
        <img src="cid:banner-image" alt="Banner" style="width:100%; max-width:600px; height:auto;" />
      </div>
      <p>Hello <strong>${input.name}</strong>,</p>
      <p>Your account has been created.</p>
      <p><b>Email:</b> ${input.email}</p>
      <p><b>Password:</b> ${defaultPassword}</p>
      <p>Please log in and change your password.</p>
    `,
    attachments: [
      {
        filename: "mail.png",
        content: bannerBase64,
        contentId: "banner-image",
      },
    ],
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

  const bannerPath = path.join(process.cwd(), "src", "lib", "mail.png");
  const bannerData = await fs.readFile(bannerPath);
  const bannerBase64 = bannerData.toString("base64");

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: user.email,
    subject: "Your Login Details (Resent)",
    html: `
      <div style="text-align:center; margin-bottom:20px;">
        <img src="cid:banner-image" alt="Banner" style="width:100%; max-width:600px; height:auto;" />
      </div>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your login details have been resent as requested.</p>
      <p><b>Email:</b> ${user.email}</p>
      <p><b>New Password:</b> ${defaultPassword}</p>
      <p>Please log in and change your password.</p>
    `,
    attachments: [
      {
        filename: "mail.png",
        content: bannerBase64,
        contentId: "banner-image",
      },
    ],
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
// USER PROGRESS FUNCTIONS
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

  if (existing) existing.completed = completed;
  else user.progress.push({ topicId, completed });

  await user.save();
  return getUserProgress(userId);
}

// -------------------------------
// COURSES JSON FILE UTILITIES
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
