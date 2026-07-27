"use server";



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
