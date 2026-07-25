import { connectDB } from "./src/lib/mongoose";
import User from "./src/models/User";
import { hashPassword } from "./src/lib/auth/password";
import { AppConfig } from "./src/app.config";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await connectDB();
  console.log("Connected to DB");

  await User.deleteMany({ role: "admin" });
  console.log("Deleted old admins");

  const hashed = await hashPassword("123456");

  await User.create({
    name: "Aisha",
    email: AppConfig.adminEmailPlaceholder,
    password: hashed,
    role: "admin",
  });

  console.log("Created new admin Aisha with password 123456");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
