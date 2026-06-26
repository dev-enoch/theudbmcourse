"use server";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import ClaimedOrder from "@/models/ClaimedOrder";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function processActivation(orderId: string, email: string, name?: string) {
  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();

  let user = await User.findOne({ email: new RegExp(`^${normalizedEmail}$`, "i") }).lean() as any;
  if (!user) {
    const defaultPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await hashPassword(defaultPassword);
    
    user = await User.create({
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      role: "user",
      password: hashedPassword,
      progress: [],
    });
  }

  // Determine which deviceKey to use
  let deviceKeyToUse = crypto.randomUUID();
  const existingOrders = await ClaimedOrder.find({ email: new RegExp(`^${normalizedEmail}$`, "i") }).lean();
  const activeOrder = existingOrders.find((o: any) => o.deviceKey !== "reset-by-admin" && o.deviceKey !== "reset-by-logout");
  
  if (activeOrder) {
    // If an active lock exists, verify the caller is actually on the locked device!
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get("payonaire_access_token")?.value;
    
    let currentDeviceKey = null;
    if (existingCookie) {
      try {
        const decoded = jwt.verify(existingCookie, process.env.JWT_SECRET!) as { deviceKey: string };
        currentDeviceKey = decoded.deviceKey;
      } catch (e) {
        // Ignored
      }
    }

    if (currentDeviceKey !== activeOrder.deviceKey) {
      throw new Error("Unauthorized: Account is locked to another device.");
    }

    // Caller is on the correct device. Re-use the existing active device lock.
    deviceKeyToUse = activeOrder.deviceKey;
  }

  await ClaimedOrder.findOneAndUpdate(
    { orderId },
    {
      orderId,
      email: normalizedEmail,
      deviceKey: deviceKeyToUse,
    },
    { upsert: true }
  );

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: normalizedEmail,
      orderId,
      deviceKey: deviceKeyToUse,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "365d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("payonaire_access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/");
}
