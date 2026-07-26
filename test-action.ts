"use server";
import { connectDB } from "./src/lib/mongoose";
import User from "./src/models/User";

async function test() {
  await connectDB();
  const admin = await User.findOne({ email: "admin@theubdmcourse.online" });
  console.log("Admin before:", admin.languagePreference);
  
  await User.findByIdAndUpdate(admin._id, { languagePreference: "en" });
  
  const updated = await User.findOne({ email: "admin@theubdmcourse.online" });
  console.log("Admin after:", updated.languagePreference);
  process.exit(0);
}
test();
