import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import ClaimedOrder from "@/models/ClaimedOrder";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const users = await User.find().lean();
  const orders = await ClaimedOrder.find().lean();

  return NextResponse.json({
    users: users.map(u => ({ email: u.email, languagePreference: u.languagePreference, _id: u._id.toString() })),
    orders: orders.map(o => ({ email: o.email, _id: o._id.toString() }))
  });
}
