"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Settings from "@/models/Settings";
import { sendEmail, getEmailHtml } from "@/lib/email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function saveAutomatedTriggers(lessonTrigger: boolean, courseTrigger: boolean) {
  await requireAdmin();
  await connectDB();

  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
  }

  settings.lessonCompletionEmailsEnabled = lessonTrigger;
  settings.courseCompletionEmailsEnabled = courseTrigger;
  await settings.save();

  return { success: true };
}

export async function getMarketingSettings() {
  await requireAdmin();
  await connectDB();
  const settings = await Settings.findOne().lean();
  return {
    lessonTrigger: !!settings?.lessonCompletionEmailsEnabled,
    courseTrigger: !!settings?.courseCompletionEmailsEnabled
  };
}

export async function sendDailyPing({ subject, body, audience }: { subject: string, body: string, audience: string }) {
  await requireAdmin();
  await connectDB();

  let query: any = { role: "user" };
  if (audience === "active") {
    query.active = true;
  } else if (audience === "inactive") {
    // For simplicity, inactive means no recent updates in progress
    // In a real scenario, you'd check a lastLogin date. 
    // Here we'll just send it to those who haven't completed any lessons
    query = { role: "user", "progress.0": { $exists: false } };
  }

  const users = await User.find(query, { email: 1 }).lean();
  const emails = users.map(u => u.email).filter(Boolean);

  if (emails.length === 0) {
    throw new Error("No users found matching this audience.");
  }

  // Convert plain text body to simple HTML paragraphs
  const htmlBody = body.split('\n').map(p => `<p>${p}</p>`).join('');
  const emailHtml = getEmailHtml(subject, htmlBody);

  // In production with Resend, you can batch send up to 100 emails at a time.
  // We'll pass the array directly to sendEmail
  await sendEmail(emails, subject, emailHtml);

  return { success: true, count: emails.length };
}

export async function sendRetentionEmails() {
  await requireAdmin();
  await connectDB();

  // Find users who have some progress but haven't been active (simplified logic: just a demo blast)
  const users = await User.find({ role: "user", active: true }, { email: 1, name: 1 }).limit(50).lean();
  const emails = users.map(u => u.email).filter(Boolean);

  if (emails.length === 0) {
    throw new Error("No inactive users found.");
  }

  const subject = "We miss you at BAG! Let's get back to building 🚀";
  const htmlBody = `
    <p>Hi there,</p>
    <p>We noticed you haven't completed a lesson recently. Consistency is the key to unlocking your automated gains!</p>
    <p>Log back in today to pick up right where you left off.</p>
    <a href="https://yourdomain.com/login" class="button">Resume Course</a>
  `;
  const emailHtml = getEmailHtml("We Miss You!", htmlBody);

  await sendEmail(emails, subject, emailHtml);

  return { success: true, count: emails.length };
}
