import { NextResponse } from "next/server";
import { addUser, resendLoginDetails } from "@/lib/data";
import ClaimedOrder from "@/models/ClaimedOrder";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";

// POST /api/webhooks/payonaire
// Expected Payload: { email: string, name: string, orderId: string, secret?: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, orderId, secret } = body;

    // Basic validation
    if (!email || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields (email, orderId)." },
        { status: 400 }
      );
    }

    // Optional: Secret validation to ensure the webhook is from Payonaire
    // if (process.env.PAYONAIRE_WEBHOOK_SECRET && secret !== process.env.PAYONAIRE_WEBHOOK_SECRET) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if the order was already processed
    const existingOrder = await ClaimedOrder.findOne({ orderId });
    if (existingOrder) {
      return NextResponse.json(
        { message: "Order already processed." },
        { status: 200 }
      );
    }

    // 2. Log the claimed order or update existing one to preserve device lock if exists
    await ClaimedOrder.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: { orderId, email: normalizedEmail }
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    // 3. Create or update the user
    let user = await User.findOne({ email });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      // User doesn't exist, create them
      // addUser already sends the "Your Account Has Been Successfully Activated" email!
      await addUser({
        name: name || "Student",
        email: email,
        role: "user",
      });
    } else {
      // User exists, just ensure they are active
      user.active = true;
      await user.save();
      await resendLoginDetails(user._id.toString());
    }

    // --- SEND ORDER RECEIPT EMAIL ---
    try {
      const { render } = require("@react-email/render");
      const { OrderReceiptEmail } = require("@/emails/templates/OrderReceiptEmail");
      const { resend } = require("@/lib/email");
      const React = require("react");
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://theubdmcourse.online";

      const html = await render(
        React.createElement(OrderReceiptEmail, {
          name: name || user?.name || "Student",
          orderId: orderId,
          loginUrl: `${baseUrl}/login`,
        })
      );

      const textContent = await render(
        React.createElement(OrderReceiptEmail, {
          name: name || user?.name || "Student",
          orderId: orderId,
          loginUrl: `${baseUrl}/login`,
        }),
        { plainText: true }
      );

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "support@theubdmcourse.online",
        to: email,
        subject: "Receipt for The UBDM Course",
        html: html,
        text: textContent,
      });
    } catch (receiptError) {
      console.error("Failed to send order receipt:", receiptError);
    }

    return NextResponse.json(
      { success: true, message: "Webhook processed successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payonaire Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
