import { Resend } from 'resend';
import { AppConfig } from "@/app.config";

export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

/**
 * Clean, white-background newsletter style email wrapper
 */
export function getEmailHtml(title: string, bodyHtml: string, unsubscribeUrl?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .header { background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e5e7eb; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; color: #111827; font-weight: 600; }
          .content { padding: 32px 24px; color: #374151; font-size: 16px; line-height: 1.6; }
          .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; background-color: #20692b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            <p><strong>The UBDM Course</strong><br/>[Your Physical Address Here]</p>
            <p><small>You are receiving this email because you are a registered student.</small></p>
            ${unsubscribeUrl ? `<p><small><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from marketing emails.</small></p>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendEmail(to: string | string[], subject: string, htmlContent: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Mock sending email to:", to);
    console.log("Subject:", subject);
    // console.log("HTML:", htmlContent);
    return { success: true, mock: true };
  }

  // Simple HTML to text converter for spam filter compliance
  const textContent = htmlContent
    .replace(/<style[^>]*>.*<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();

  try {
    const data = await resend.emails.send({
      from: AppConfig.emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: htmlContent,
      text: textContent,
      replyTo: AppConfig.emailFrom,
    });
    
    if (data.error) {
      console.error("Resend returned an error:", data.error);
      throw new Error(data.error.message);
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    throw new Error(error.message || "Failed to send email through Resend API.");
  }
}
