import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const token = url.searchParams.get("token");

    if (!userId || !token) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const expectedToken = crypto
      .createHash("sha256")
      .update(userId + (process.env.NEXTAUTH_SECRET || "default_secret"))
      .digest("hex");

    if (token !== expectedToken) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 403 });
    }

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    user.unsubscribed = true;
    await user.save();

    // Return a simple HTML page confirming the unsubscription
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f9fafb; color: #111827; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            h1 { color: #10B981; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Unsubscribed</h1>
            <p>You have successfully unsubscribed from all future marketing and notification emails.</p>
            <p><small>You will still receive critical account and security emails.</small></p>
            <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Return to Home</a>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });

  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
