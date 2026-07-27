import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export interface UnifiedSession {
  userId: string;
  email: string;
  role: "admin" | "user";
}

export async function getAuthSession(): Promise<UnifiedSession | null> {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    return {
      userId: session.user.id,
      email: session.user.email!,
      role: session.user.role as "admin" | "user",
    };
  }

  return null;
}
