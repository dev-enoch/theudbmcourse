"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { clearUserDeviceLock } from "@/app/~/admin/users/[userId]/actions";

export async function clearPayonaireCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("payonaire_access_token")?.value;
  
  if (token) {
    try {
      const decoded = jwt.decode(token) as { email?: string };
      if (decoded && decoded.email) {
        await clearUserDeviceLock(decoded.email, "reset-by-logout");
      }
    } catch (e) {
      console.error("Failed to decode token during logout", e);
    }
  }

  cookieStore.delete("payonaire_access_token");
}

export async function saveLanguagePreference(language: "ha" | "en") {
  const { connectDB } = await import("@/lib/mongoose");
  const User = (await import("@/models/User")).default;
  const { getAuthSession } = await import("@/lib/auth/getAuthSession");
  const { revalidatePath } = await import("next/cache");

  try {
    const session = await getAuthSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDB();

    await User.findByIdAndUpdate(session.userId, { languagePreference: language });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error saving language preference:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
