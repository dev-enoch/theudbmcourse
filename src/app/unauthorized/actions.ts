"use server";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";

export async function sendMagicLink(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, "i") }).lean();

    if (!user) {
      return {
        error: "This email is not registered in our database. If you purchased recently, please check the email address used or contact support.",
      };
    }

    // Generate a unique recovery order ID
    const recoveryOrderId = `recovery-${crypto.randomBytes(8).toString("hex")}`;
    
    // Construct the direct local welcome redirect URL
    const welcomeUrl = `/welcome?order_id=${recoveryOrderId}&email=${encodeURIComponent(normalizedEmail)}&name=${encodeURIComponent(user.name || "")}`;

    return {
      success: "Account verified! Redirecting to course dashboard...",
      redirectUrl: welcomeUrl,
    };
  } catch (err: any) {
    console.error("Magic link validation error:", err);
    return { error: err.message || "An unexpected error occurred while validating the account." };
  }
}
