import { getReceivedEmails, getSentEmails } from "./actions";
import { MailClient } from "./_components/MailClient";
import { AppConfig } from "@/app.config";

export default async function MailPage() {
  // Fetch initial data for the mail client
  const [receivedEmails, sentEmails] = await Promise.all([
    getReceivedEmails().catch(() => []),
    getSentEmails().catch(() => []),
  ]);

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] md:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-9rem)] rounded-xl border bg-background overflow-hidden">
      {!process.env.RESEND_API_KEY && (
        <div className="p-4 border-b border-red-500/50 bg-red-500/10 text-red-500">
          <p className="font-semibold text-sm">⚠️ Resend Configuration Missing</p>
          <p className="text-xs mt-1">
            You have not set a <code>RESEND_API_KEY</code>. Mail features will not work.
          </p>
        </div>
      )}
      
      <MailClient 
        initialReceived={receivedEmails} 
        initialSent={sentEmails} 
        emailFrom={AppConfig.emailFrom}
      />
    </div>
  );
}
