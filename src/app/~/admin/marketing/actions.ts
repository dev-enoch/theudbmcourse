"use server";

import { getAuthSession } from "@/lib/auth/getAuthSession";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import AutomationRule from "@/models/AutomationRule";
import EmailLog from "@/models/EmailLog";
import { sendEmail, getEmailHtml } from "@/lib/email";
import { executeCampaignWorkflow } from "@/app/workflows";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session || session.role !== "admin") {
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
    await executeCampaignWorkflow(campaign._id.toString());
  }

  return { success: true, id: campaign._id.toString() };
}

export async function sendCampaignNow(campaignId: string) {
  await requireAdmin();
  await connectDB();

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
// ANALYTICS (NEW)
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

export async function getMarketingStats() {
  await requireAdmin();
  await connectDB();

  const totalStudents = await User.countDocuments({ role: "user" });
  
  // Calculate conversion rate (users with progress > 0 / total students)
  const activeStudents = await User.countDocuments({ role: "user", "progress.0": { $exists: true } });
  const conversionRate = totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : "0.0";

  const emailsDelivered = await EmailLog.countDocuments({ status: "sent" });

  const activeCampaigns = await Campaign.countDocuments({ status: "sent" });
  const activeRules = await AutomationRule.countDocuments({ isActive: true });
  const totalActiveMarketing = activeCampaigns + activeRules;

  return {
    totalStudents,
    conversionRate: Number(conversionRate),
    emailsDelivered,
    activeCampaigns: totalActiveMarketing
  };
}

export async function getEnrollmentChartData() {
  await requireAdmin();
  await connectDB();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const users = await User.find({ role: "user", createdAt: { $gte: twelveMonthsAgo } }).lean();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dataMap = new Map<string, any>();

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = monthNames[d.getMonth()];
    const key = `${d.getFullYear()}-${m}`;
    dataMap.set(key, { name: m, Organic: 0, Paid: 0, Email: 0, Direct: 0 });
  }

  users.forEach((u) => {
    const d = new Date(u.createdAt as any);
    const m = monthNames[d.getMonth()];
    const key = `${d.getFullYear()}-${m}`;
    
    if (dataMap.has(key)) {
      const entry = dataMap.get(key);
      const source = (u.utmSource || "Direct").toLowerCase();
      if (source.includes("organic")) entry.Organic++;
      else if (source.includes("paid") || source.includes("ads")) entry.Paid++;
      else if (source.includes("email")) entry.Email++;
      else entry.Direct++;
    }
  });

  return Array.from(dataMap.values());
}

export async function getAudienceSegmentsData() {
  await requireAdmin();
  await connectDB();

  const users = await User.find({ role: "user" }, { utmSource: 1 }).lean();
  
  let organic = 0;
  let paid = 0;
  let email = 0;
  let direct = 0;

  users.forEach(u => {
    const source = (u.utmSource || "Direct").toLowerCase();
    if (source.includes("organic")) organic++;
    else if (source.includes("paid") || source.includes("ads")) paid++;
    else if (source.includes("email")) email++;
    else direct++;
  });

  return [
    { name: "Organic", value: organic, fill: "#4F46E5" },
    { name: "Paid", value: paid, fill: "#F97316" },
    { name: "Email", value: email, fill: "#10B981" },
    { name: "Direct", value: direct, fill: "#8B5CF6" },
  ];
}
