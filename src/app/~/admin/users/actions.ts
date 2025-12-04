"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { updateUser as dbUpdateUser } from "@/lib/data";
import { revalidatePath } from "next/cache";

/**
 * Server action to update a user in the database.
 */
export async function updateUserOnServer(
  userId: string,
  updates: Partial<{ role: "user" | "admin"; active: boolean }>
) {
  // Get current session
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return { error: "Permission denied." };
  }

  try {
    const updatedUser = await dbUpdateUser(userId, updates);
    // Revalidate the admin users page so SSR reflects the changes
    revalidatePath("/~/admin/users");

    return { success: true, user: updatedUser };
  } catch (err: any) {
    return { error: err.message || "An unknown error occurred." };
  }
}
