"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import AutomationRule from "@/models/AutomationRule";
import EmailLog from "@/models/EmailLog";
import { sendEmail, getEmailHtml } from "@/lib/email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
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

import { executeCampaignWorkflow } from "@/app/workflows";

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

  if (scheduledAt) {
    // Fire the workflow immediately; it will sleep until the scheduled date
    await executeCampaignWorkflow(campaign._id.toString());
  }

  return { success: true, id: campaign._id.toString() };
}

export async function sendCampaignNow(campaignId: string) {
  await requireAdmin();
  await connectDB();

  // Fire the workflow! No cron required.
  await executeCampaignWorkflow(campaignId);

  return { success: true };
}

// -------------------------------
// AUTOMATION RULES
// -------------------------------
export async function getAutomationRules() {
  await requireAdmin();
  await connectDB();
  const rules = await AutomationRule.find().sort({ createdAt: -1 }).lean();
  return rules.map(r => ({
    ...r,
    _id: r._id.toString(),
    id: r._id.toString()
  }));
}

export async function createAutomationRule({ name, trigger, subject, htmlBody, isActive }: { name: string, trigger: string, subject: string, htmlBody: string, isActive: boolean }) {
  await requireAdmin();
  await connectDB();

  await AutomationRule.create({
    name,
    trigger,
    subject,
    htmlBody,
    isActive
  });

  return { success: true };
}

export async function toggleAutomationRule(ruleId: string, isActive: boolean) {
  await requireAdmin();
  await connectDB();

  await AutomationRule.findByIdAndUpdate(ruleId, { isActive });
  return { success: true };
}

export async function deleteAutomationRule(ruleId: string) {
  await requireAdmin();
  await connectDB();

  await AutomationRule.findByIdAndDelete(ruleId);
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
