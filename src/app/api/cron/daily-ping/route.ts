import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { sendEmail, getEmailHtml } from "@/lib/email";
import User from "@/models/User";

// Secure the cron route using a secret key
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectDB();
    
    // As an example, sending a generic weekly reminder to active users
    const users = await User.find({ role: "user", active: true }, { email: 1 }).lean();
    const emails = users.map(u => u.email).filter(Boolean);

    if (emails.length > 0) {
      const subject = "Your BAG Weekly Update 🚀";
      const htmlBody = `
        <p>Happy week from the Blueprint to Automated Gains team!</p>
        <p>We just wanted to remind you to log in and tackle your next lesson. Consistency is the key to mastering your gains.</p>
        <p>See you inside!</p>
        <a href="${process.env.APP_URL}/login" class="button">Go to Dashboard</a>
      `;
      
      const emailHtml = getEmailHtml(subject, htmlBody);
      await sendEmail(emails, subject, emailHtml);
    }

    return NextResponse.json({ success: true, count: emails.length });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
