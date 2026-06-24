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

  let user = await User.findOne({ email }).lean() as any;
  if (!user) {
    const defaultPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await hashPassword(defaultPassword);
    
    user = await User.create({
      name: name || email.split("@")[0],
      email: email,
      role: "user",
      password: hashedPassword,
      progress: [],
    });
  }

  const newDeviceKey = crypto.randomUUID();

  await ClaimedOrder.findOneAndUpdate(
    { orderId },
    {
      orderId,
      email,
      deviceKey: newDeviceKey,
    },
    { upsert: true }
  );

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      orderId,
      deviceKey: newDeviceKey,
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
