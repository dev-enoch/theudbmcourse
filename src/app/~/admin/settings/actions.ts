"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { revalidatePath } from "next/cache";
import { updateGroupLinks } from "@/lib/settings";

export async function updateSettingsOnServer(groupLinks: any[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Permission denied." };
  }

  try {
    const updatedSettings = await updateGroupLinks(groupLinks);
    revalidatePath("/~/admin/settings");
    revalidatePath("/courses");

    return { success: true, settings: updatedSettings };
  } catch (err: any) {
    return { error: err.message || "Failed to update settings." };
  }
}
