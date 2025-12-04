"use server";

import User from "@/models/User";
import { connectDB } from "./mongoose";
import { hashPassword } from "./auth/password";
import nodemailer from "nodemailer";
import path from "path";
import { Course, UserProgress } from "./types";
import fs from "fs/promises";

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

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedUser) {
    throw new Error("User not found.");
  }

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
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

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

  // EMAIL TRANSPORTER (uses NextAuth EMAIL_SERVER standard)
  const transporter = nodemailer.createTransport(
    JSON.parse(process.env.EMAIL_SERVER!)
  );

  // EMAIL BODY (includes name)
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: input.email,
    subject: "Your Login Credentials",
    text: `Hello ${input.name},

Your account has been created.

Email: ${input.email}
Password: ${defaultPassword}

Please log in and change your password.`,
    html: `
      <p>Hello <strong>${input.name}</strong>,</p>
      <p>Your account has been created.</p>
      <p><b>Email:</b> ${input.email}</p>
      <p><b>Password:</b> ${defaultPassword}</p>
      <p>Please log in and change your password.</p>
    `,
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
// USER PROGRESS FUNCTIONS
// -------------------------------

export async function getUserProgress(userId: string) {
  await connectDB();

  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found.");

  // Format progress as simple object map like Firestore structure
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

  if (existing) {
    existing.completed = completed;
  } else {
    user.progress.push({ topicId, completed });
  }

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
