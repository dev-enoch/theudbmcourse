const mongoose = require('mongoose');

const uri = "mongodb+srv://arhyelphilip024:JCBwSXjCP3vpRHZU@myworks.yl0en.mongodb.net/automated-gains-blueprint?retryWrites=true&w=majority&appName=myworks";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const users = db.collection("users");

    const totalUsers = await users.countDocuments({ role: "user" });
    const explicitFalse = await users.countDocuments({ role: "user", active: false });
    const explicitTrue = await users.countDocuments({ role: "user", active: true });
    const missingActive = await users.countDocuments({ role: "user", active: { $exists: false } });

    console.log(`Total users: ${totalUsers}`);
    console.log(`Explicit active=false: ${explicitFalse}`);
    console.log(`Explicit active=true: ${explicitTrue}`);
    console.log(`Missing active field: ${missingActive}`);

    // Let's also check the aggregation logic output
    const agg = await users.aggregate([
      { $match: { role: "user" } },
      { $group: {
          _id: {
            active: "$active",
            hasRevoked: { $gt: [{ $size: { $ifNull: ["$revokedCourses", []] } }, 0] }
          },
          count: { $sum: 1 }
      }}
    ]).toArray();
    console.log("Aggregation output:");
    console.dir(agg, {depth: null});

  } finally {
    await mongoose.disconnect();
  }
}

run().catch(console.error);
