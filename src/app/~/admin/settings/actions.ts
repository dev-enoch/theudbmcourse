"use server";

import { getAuthSession } from "@/lib/auth/getAuthSession";
import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/settings";

import { ISettings } from "@/models/Settings";

export async function updateSettingsOnServer(updates: Partial<ISettings>) {
  const session = await getAuthSession();
  if (!session || session.role !== "admin") {
    return { error: "Permission denied." };
  }

  try {
    const updatedSettings = await updateSettings(updates);
    revalidatePath("/~/admin/settings");
    revalidatePath("/courses");
    revalidatePath("/unauthorized");

    return { success: true, settings: updatedSettings };
  } catch (err: any) {
    return { error: err.message || "Failed to update settings." };
  }
}
