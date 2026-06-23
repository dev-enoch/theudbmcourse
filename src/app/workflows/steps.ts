import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import AutomationRule from "@/models/AutomationRule";
import { sendEmail, getEmailHtml } from "@/lib/email";
import EmailLog from "@/models/EmailLog";

export async function getCampaignStep(campaignId: string) {
  "use step";
  await connectDB();
  const campaign = await Campaign.findById(campaignId).lean();
  return campaign ? JSON.parse(JSON.stringify(campaign)) : null;
}

export async function markCampaignFailedStep(campaignId: string) {
  "use step";
  await connectDB();
  await Campaign.findByIdAndUpdate(campaignId, { status: "failed" });
}

export async function fetchCampaignEmailsStep(audience: string) {
  "use step";
  await connectDB();
  let query: any = { role: "user" };
  if (audience === "active") {
    query.active = true;
  } else if (audience === "inactive") {
    query = { role: "user", "progress.0": { $exists: false } };
  }

  const users = await User.find(query, { email: 1 }).lean();
  return users.map((u: any) => u.email).filter(Boolean);
}

export async function sendCampaignEmailsStep(emails: string[], campaign: any) {
  "use step";
  await connectDB();
  const htmlBody = campaign.body.split('\n').map((p: string) => `<p>${p}</p>`).join('');
  const emailHtml = getEmailHtml(campaign.subject, htmlBody);

  await sendEmail(emails, campaign.subject, emailHtml);
  
  await Campaign.findByIdAndUpdate(campaign._id, {
    status: "sent",
    sentAt: new Date(),
    sentCount: emails.length
  });

  const logs = emails.map(email => ({
    campaignId: campaign._id,
    type: "campaign",
    recipientEmail: email,
    subject: campaign.subject,
    status: "sent"
  }));
  await EmailLog.insertMany(logs);
}

export async function getUserStep(userId: string) {
  "use step";
  await connectDB();
  const user = await User.findById(userId).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function checkUserInactiveStep(userId: string) {
  "use step";
  await connectDB();
  // Assume inactive logic
  return true;
}

export async function processAutomationRulesStep(triggerType: string, user: any) {
  "use step";
  await connectDB();
  const rules = await AutomationRule.find({ trigger: triggerType, isActive: true }).lean();
  for (const rule of rules) {
    const emailHtml = getEmailHtml(rule.subject, rule.htmlBody);
    await sendEmail(user.email, rule.subject, emailHtml);
    
    await EmailLog.create({
      type: "automation",
      recipientEmail: user.email,
      subject: rule.subject,
      status: "sent"
    });
  }
}
