"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Settings from "@/models/Settings";
import Campaign from "@/models/Campaign";
import PromoCode from "@/models/PromoCode";
import EmailLog from "@/models/EmailLog";
import { sendEmail, getEmailHtml } from "@/lib/email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

// -------------------------------
// SETTINGS
// -------------------------------
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

// -------------------------------
// CAMPAIGNS
// -------------------------------
export async function getCampaigns() {
  await requireAdmin();
  await connectDB();
  const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
  return campaigns.map(c => ({
    ...c,
    _id: c._id.toString(),
    id: c._id.toString()
  }));
}

export async function createCampaign({ subject, body, audience, scheduledAt }: { subject: string, body: string, audience: "all" | "active" | "inactive", scheduledAt?: string }) {
  await requireAdmin();
  await connectDB();

  const campaign = await Campaign.create({
    subject,
    body,
    audience,
    status: scheduledAt ? "scheduled" : "draft",
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
  });

  return { success: true, id: campaign._id.toString() };
}

export async function sendCampaignNow(campaignId: string) {
  await requireAdmin();
  await connectDB();

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  let query: any = { role: "user" };
  if (campaign.audience === "active") {
    query.active = true;
  } else if (campaign.audience === "inactive") {
    query = { role: "user", "progress.0": { $exists: false } };
  }

  const users = await User.find(query, { email: 1 }).lean();
  const emails = users.map(u => u.email).filter(Boolean);

  if (emails.length === 0) {
    campaign.status = "failed";
    await campaign.save();
    throw new Error("No users found matching this audience.");
  }

  const htmlBody = campaign.body.split('\n').map((p: string) => `<p>${p}</p>`).join('');
  const emailHtml = getEmailHtml(campaign.subject, htmlBody);

  try {
    await sendEmail(emails, campaign.subject, emailHtml);
    
    campaign.status = "sent";
    campaign.sentAt = new Date();
    campaign.sentCount = emails.length;
    await campaign.save();

    // Log the emails
    const logs = emails.map(email => ({
      campaignId: campaign._id,
      type: "campaign",
      recipientEmail: email,
      subject: campaign.subject,
      status: "sent"
    }));
    await EmailLog.insertMany(logs);

    return { success: true, count: emails.length };
  } catch (error: any) {
    campaign.status = "failed";
    await campaign.save();
    throw new Error("Failed to send campaign: " + error.message);
  }
}

// -------------------------------
// RETENTION
// -------------------------------
export async function getRetentionUsers() {
  await requireAdmin();
  await connectDB();
  // Find users who have some progress but maybe stopped
  const users = await User.find({ role: "user", active: true }, { email: 1, name: 1, progress: 1 }).limit(50).lean();
  return users.map(u => ({ ...u, _id: u._id.toString() }));
}

export async function sendReengagementEmail(email: string, name?: string) {
  await requireAdmin();
  await connectDB();

  const subject = "We miss you at BAG! Let's get back to building 🚀";
  const htmlBody = `
    <p>Hi ${name || 'there'},</p>
    <p>We noticed you haven't completed a lesson recently. Consistency is the key to unlocking your automated gains!</p>
    <p>Log back in today to pick up right where you left off.</p>
    <a href="${process.env.APP_URL}/login" class="button">Resume Course</a>
  `;
  const emailHtml = getEmailHtml("We Miss You!", htmlBody);

  await sendEmail(email, subject, emailHtml);

  await EmailLog.create({
    type: "reengagement",
    recipientEmail: email,
    subject: subject,
    status: "sent"
  });

  return { success: true };
}

// -------------------------------
// PROMO CODES
// -------------------------------
export async function getPromoCodes() {
  await requireAdmin();
  await connectDB();
  const codes = await PromoCode.find().sort({ createdAt: -1 }).lean();
  return codes.map(c => ({
    ...c,
    _id: c._id.toString(),
    id: c._id.toString()
  }));
}

export async function createPromoCode({ code, discountPercentage, maxUses }: { code: string, discountPercentage: number, maxUses: number }) {
  await requireAdmin();
  await connectDB();

  const existing = await PromoCode.findOne({ code: code.toUpperCase() });
  if (existing) throw new Error("Promo code already exists");

  await PromoCode.create({
    code: code.toUpperCase(),
    discountPercentage,
    maxUses
  });

  return { success: true };
}

// -------------------------------
// ANALYTICS
// -------------------------------
export async function getEmailLogs() {
  await requireAdmin();
  await connectDB();
  const logs = await EmailLog.find().sort({ sentAt: -1 }).limit(100).lean();
  return logs.map(l => ({
    ...l,
    _id: l._id.toString(),
    id: l._id.toString()
  }));
}
