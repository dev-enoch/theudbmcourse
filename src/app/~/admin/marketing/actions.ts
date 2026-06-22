"use server";

import { Resend } from "resend";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMarketingEmail(subject: string, htmlContent: string) {
  try {
    await connectDB();
    
    // Fetch all active users
    const users = await User.find({ active: true, email: { $exists: true } }).select('email name').lean();
    
    if (!users || users.length === 0) {
      return { success: false, error: "No active users found to send emails." };
    }

    const BATCH_SIZE = 50; // Resend allows batch sending
    const fromEmail = process.env.EMAIL_FROM || "hello@example.com";
    
    let sentCount = 0;
    
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const emailsToSend = batch.map((user: any) => ({
        from: fromEmail,
        to: user.email,
        subject: subject,
        html: htmlContent.replace(/{{name}}/g, user.name || "Student"),
      }));
      
      // Resend batch API
      await resend.batch.send(emailsToSend);
      sentCount += batch.length;
    }

    return { success: true, count: sentCount };
  } catch (error: any) {
    console.error("Error sending marketing emails:", error);
    return { success: false, error: error.message };
  }
}
