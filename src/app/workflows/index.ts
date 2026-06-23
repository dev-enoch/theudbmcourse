import { sleep } from "workflow";
import {
  getCampaignStep,
  markCampaignFailedStep,
  fetchCampaignEmailsStep,
  sendCampaignEmailsStep,
  getUserStep,
  checkUserInactiveStep,
  processAutomationRulesStep
} from "./steps";

export async function executeCampaignWorkflow(campaignId: string) {
  "use workflow";
  
  const campaign = await getCampaignStep(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  if (campaign.status === "sent") return { status: "already_sent" };

  if (campaign.scheduledAt) {
    const delay = new Date(campaign.scheduledAt).getTime() - Date.now();
    if (delay > 0) {
      const delaySeconds = Math.ceil(delay / 1000);
      await sleep(`${delaySeconds}s`);
    }
  }

  const emails = await fetchCampaignEmailsStep(campaign.audience);

  if (emails.length === 0) {
    await markCampaignFailedStep(campaignId);
    return { status: "failed", reason: "no users" };
  }

  try {
    await sendCampaignEmailsStep(emails, campaign);
    return { status: "sent", count: emails.length };
  } catch (error: any) {
    await markCampaignFailedStep(campaignId);
    throw error;
  }
}

export async function triggerAutomationWorkflow(userId: string, eventType: string) {
  "use workflow";

  const user = await getUserStep(userId);
  if (!user) return { status: "user_not_found" };

  if (eventType === "inactive_14_days") {
    await sleep("14d");

    const stillInactive = await checkUserInactiveStep(userId);
    if (stillInactive) {
      await processAutomationRulesStep("inactive_14_days", user);
    }
  }

  if (eventType === "lesson_completed") {
    await processAutomationRulesStep("lesson_completed", user);
  }

  return { status: "completed" };
}
