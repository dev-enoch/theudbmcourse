"use server";

import User from "@/models/User";
import ClaimedOrder from "@/models/ClaimedOrder";
import { connectDB } from "@/lib/mongoose";
import { hashPassword } from "@/lib/auth/password";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
import crypto from "crypto";
import React from "react";
import { render } from "@react-email/render";
import { PasswordResetEmail } from "@/emails/templates/PasswordResetEmail";
import { DirectEmail } from "@/emails/templates/DirectEmail";
export async function updateUserAdminDetails(userId: string, data: any) {
  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true }).lean() as any;
    if (!user) throw new Error("User not found");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleUserSuspension(userId: string, suspendedUntil: Date | null, reason: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (suspendedUntil) {
      user.active = false;
      user.suspendedUntil = suspendedUntil;
      user.suspensionReason = reason;
    } else {
      user.active = true;
      user.suspendedUntil = undefined;
      user.suspensionReason = "";
    }

    await user.save();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function forcePasswordReset(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const defaultPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await hashPassword(defaultPassword);

    user.password = hashedPassword;
    await user.save();

    const html = await render(
      React.createElement(PasswordResetEmail, {
        email: user.email,
        password: defaultPassword,
        loginUrl: `${process.env.APP_URL}/login`,
        isForced: true,
      })
    );

    const textContent = await render(
      React.createElement(PasswordResetEmail, {
        email: user.email,
        password: defaultPassword,
        loginUrl: `${process.env.APP_URL}/login`,
        isForced: true,
      }),
      { plainText: true }
    );

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "mail@smtp.theubdmcourse.online",
      to: user.email,
      subject: "Security Alert: Password Reset by Admin",
      html: html,
      text: textContent
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminNotes(userId: string, notes: string) {
  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { adminNotes: notes });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendDirectUserEmail(userId: string, subject: string, htmlContent: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const finalHtmlContent = htmlContent.replace(/{{name}}/g, user.name || "Student");
    const html = await render(
      React.createElement(DirectEmail, {
        htmlContent: finalHtmlContent,
      })
    );

    const textContent = await render(
      React.createElement(DirectEmail, {
        htmlContent: finalHtmlContent,
      }),
      { plainText: true }
    );

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "mail@smtp.theubdmcourse.online",
      to: user.email,
      subject,
      html: html,
      text: textContent,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function toggleLessonProgress(userId: string, topicId: string, completed: boolean) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const existing = user.progress.find((p: any) => p.topicId === topicId);
    if (existing) {
      existing.completed = completed;
    } else {
      user.progress.push({ topicId, completed });
    }

    await user.save();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
