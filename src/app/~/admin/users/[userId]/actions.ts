"use server";

import User from "@/models/User";
import ClaimedOrder from "@/models/ClaimedOrder";
import { connectDB } from "@/lib/mongoose";
import { hashPassword } from "@/lib/auth/password";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const defaultPassword = "123456";
    const hashedPassword = await hashPassword(defaultPassword);
    
    user.password = hashedPassword;
    await user.save();

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "hello@example.com",
      to: user.email,
      subject: "Security Alert: Password Reset by Admin",
      html: `<div>
        <h2>Hi ${user.name || "Student"},</h2>
        <p>An administrator has reset your password.</p>
        <p>Your new temporary password is: <strong>${defaultPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
      </div>`
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

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "hello@example.com",
      to: user.email,
      subject,
      html: htmlContent.replace(/{{name}}/g, user.name || "Student"),
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clearUserDeviceLock(email: string) {
  try {
    await connectDB();
    const order = await ClaimedOrder.findOne({ email });
    if (!order) throw new Error("No claimed order found for this user");

    // Add to reset history
    order.resetHistory.push({
      timestamp: new Date(),
      previousDeviceKey: order.deviceKey
    });
    
    order.deviceKey = "reset-by-admin";
    await order.save();
    
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
