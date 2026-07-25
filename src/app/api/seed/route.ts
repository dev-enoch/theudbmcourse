import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { AppConfig } from "@/app.config";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  const hashed = await hashPassword("Admin123!");

  await User.create({
    name: "Jukid",
    email: AppConfig.adminEmailPlaceholder,
    password: hashed,
    role: "admin",
  });

  return NextResponse.json({ ok: true });
}
