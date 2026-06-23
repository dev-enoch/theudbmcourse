import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { sendEmail, getEmailHtml } from "@/lib/email";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import EmailLog from "@/models/EmailLog";

// Secure the cron route using a secret key
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectDB();
    
    // Find all campaigns that are scheduled to be sent now or in the past
    const campaignsToRun = await Campaign.find({
      status: "scheduled",
      scheduledAt: { $lte: new Date() }
    });

    let totalSent = 0;

    for (const campaign of campaignsToRun) {
      try {
        let query: any = { role: "user" };
        if (campaign.audience === "active") {
          query.active = true;
        } else if (campaign.audience === "inactive") {
          query = { role: "user", "progress.0": { $exists: false } };
        }

        const users = await User.find(query, { email: 1 }).lean();
        const emails = users.map((u: any) => u.email).filter(Boolean);

        if (emails.length > 0) {
          const htmlBody = campaign.body.split('\n').map((p: string) => `<p>${p}</p>`).join('');
          const emailHtml = getEmailHtml(campaign.subject, htmlBody);

          await sendEmail(emails, campaign.subject, emailHtml);

          campaign.status = "sent";
          campaign.sentAt = new Date();
          campaign.sentCount = emails.length;
          await campaign.save();

          const logs = emails.map((email: string) => ({
            campaignId: campaign._id,
            type: "campaign",
            recipientEmail: email,
            subject: campaign.subject,
            status: "sent"
          }));
          await EmailLog.insertMany(logs);

          totalSent += emails.length;
        } else {
          campaign.status = "failed";
          await campaign.save();
        }
      } catch (err) {
        console.error("Error processing campaign", campaign._id, err);
        campaign.status = "failed";
        await campaign.save();
      }
    }

    return NextResponse.json({ success: true, processedCampaigns: campaignsToRun.length, totalSent });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
