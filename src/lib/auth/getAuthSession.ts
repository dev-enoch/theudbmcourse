import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";

export interface UnifiedSession {
  userId: string;
  email: string;
  role: "admin" | "user";
}

export async function getAuthSession(): Promise<UnifiedSession | null> {
  await connectDB();

  // 1. Try checking NextAuth Session (e.g. for Admins)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      email: session.user.email!,
      role: session.user.role as "admin" | "user",
    };
  }

  // 2. Try checking Payonaire Cookie (for buyers)
  const cookieStore = await cookies();
  const payonaireToken = cookieStore.get("payonaire_access_token")?.value;

  if (payonaireToken) {
    try {
      const decoded = jwt.verify(payonaireToken, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        deviceKey: string;
      };

      // Verify the user exists in DB
      const user = await User.findById(decoded.userId).lean();
      if (user) {
        return {
          userId: user._id.toString(),
          email: user.email,
          role: user.role as "admin" | "user",
        };
      }
    } catch (err) {
      console.error("Payonaire Token verification failed:", err);
    }
  }

  return null;
}
