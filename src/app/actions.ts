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
