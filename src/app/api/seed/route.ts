import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { AppConfig } from "@/app.config";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  await User.deleteMany({ role: "admin" });

  const hashed = await hashPassword("123456");

  await User.create({
    name: "Aisha",
    email: AppConfig.adminEmailPlaceholder,
    password: hashed,
    role: "admin",
  });

  return NextResponse.json({ ok: true });
}
