"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { resend } from "@/lib/email";
import { AppConfig } from "@/app.config";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function getReceivedEmails() {
  await requireAdmin();
  // Usually returns { data: { data: [] } } or { data: [] }
  const response = await resend.emails.receiving.list();
  if (response.error) throw new Error(response.error.message);
  return (response.data as any)?.data || [];
}

export async function getSentEmails() {
  await requireAdmin();
  const response = await resend.emails.list();
  if (response.error) throw new Error(response.error.message);
  return (response.data as any)?.data || [];
}

export async function getReceivedEmail(id: string) {
  await requireAdmin();
  const response = await resend.emails.receiving.get(id);
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

export async function getSentEmail(id: string) {
  await requireAdmin();
  const response = await resend.emails.get(id);
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

export async function sendMail({
  to,
  subject,
  htmlBody,
  inReplyTo,
}: {
  to: string;
  subject: string;
  htmlBody: string;
  inReplyTo?: string;
}) {
  await requireAdmin();

  const finalHtml = htmlBody.includes("<html")
    ? htmlBody
    : `<div style="font-family: sans-serif;">${htmlBody.replace(/\n/g, '<br/>')}</div>`;

  const payload: any = {
    from: AppConfig.emailFrom,
    to: [to],
    subject,
    html: finalHtml,
  };

  if (inReplyTo) {
    payload.headers = {
      "In-Reply-To": inReplyTo,
    };
  }

  const response = await resend.emails.send(payload);
  if (response.error) throw new Error(response.error.message);
  return response.data;
}
