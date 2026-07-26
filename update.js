const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const UserSchema = new mongoose.Schema({
  languagePreference: {
      type: String,
      enum: ["ha", "en"],
  },
}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const ClaimedOrderSchema = new mongoose.Schema({}, { strict: false });
const ClaimedOrder = mongoose.models.ClaimedOrder || mongoose.model("ClaimedOrder", ClaimedOrderSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const users = await User.find({}).lean();
  console.log("--- USERS ---", users.length);
  users.forEach(u => console.log(u.email, "->", u.languagePreference));

  const orders = await ClaimedOrder.find({}).lean();
  console.log("\n--- ORDERS ---", orders.length);

  mongoose.disconnect();
}
check();
