"use server";

import { cookies } from "next/headers";

export async function clearPayonaireCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("payonaire_access_token");
}
