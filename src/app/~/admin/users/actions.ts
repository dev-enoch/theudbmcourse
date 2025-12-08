"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { revalidatePath } from "next/cache";

import {
  addUser as dbAddUser,
  updateUser as dbUpdateUser,
  deleteUser as dbDeleteUser,
  resendLoginDetails,
} from "@/lib/data";

type AddUserInput = {
  name: string;
  email: string;
  role: "user" | "admin";
};

/**
 * Server action to add a new user and send login email.
 */
export async function addUserOnServer(input: AddUserInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Permission denied." };
  }

  try {
    const newUser = await dbAddUser(input);
    revalidatePath("/~/admin/users");

    return { success: true, user: newUser };
  } catch (err: any) {
    return { error: err.message || "Failed to add user." };
  }
}

/**
 * Server action to update a user in the database.
 */
export async function updateUserOnServer(
  userId: string,
  updates: Partial<{ role: "user" | "admin"; active: boolean }>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Permission denied." };
  }

  try {
    const updatedUser = await dbUpdateUser(userId, updates);
    revalidatePath("/~/admin/users");

    return { success: true, user: updatedUser };
  } catch (err: any) {
    return { error: err.message || "An unknown error occurred." };
  }
}

/**
 * Server action to delete a user from the database.
 */
export async function deleteUserOnServer(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Permission denied." };
  }

  try {
    const deleted = await dbDeleteUser(userId);
    revalidatePath("/~/admin/users");

    return { success: true, deleted };
  } catch (err: any) {
    return { error: err.message || "Failed to delete user." };
  }
}

/**
 * Server action to resend the login details email to a user.
 */
export async function resendLoginDetailsOnServer(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Permission denied." };
  }

  try {
    const result = await resendLoginDetails(userId);
    return { success: true, message: result.message };
  } catch (err: any) {
    return { error: err.message || "Failed to resend login email." };
  }
}
