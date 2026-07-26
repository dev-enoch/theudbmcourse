import { connectDB } from "./src/lib/mongoose";
import User from "./src/models/User";

async function test() {
  await connectDB();
  
  // Set to 'en'
  const admin = await User.findOne({ email: "admin@theubdmcourse.online" });
  await User.findByIdAndUpdate(admin._id, { languagePreference: "en" });
  console.log("Set to EN");
  
  // Wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));
  
  // Read back
  const updated = await User.findById(admin._id).lean();
  console.log("Read back directly:", updated.languagePreference);
  
  process.exit(0);
}
test();
