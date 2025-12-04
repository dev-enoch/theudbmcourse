import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  // bcryptjs returns promise when using async
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}
