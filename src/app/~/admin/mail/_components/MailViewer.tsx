"use client";

import { useEffect, useState } from "react";
import { getReceivedEmail, getSentEmail } from "../actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Reply, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ResendEmail } from "../types";

export function MailViewer({
  email,
  onReply,
  onBack,
}: {
  email: ResendEmail;
  onReply: () => void;
  onBack: () => void;
}) {
  const [fullEmail, setFullEmail] = useState<ResendEmail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setFullEmail(null);

    async function loadEmail() {
      if (!email?.id) return;
      setLoading(true);
      try {
        const data =
          email.folder === "inbox"
            ? await getReceivedEmail(email.id)
            : await getSentEmail(email.id);
        if (isMounted) {
          setFullEmail(data);
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error("Could not load email details: " + error.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEmail();

    return () => {
      isMounted = false;
    };
  }, [email.id, email.folder]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold truncate flex-1">{email.subject}</h2>
        <Button onClick={onReply} variant="outline" size="sm" className="gap-2 shrink-0 rounded-full px-4">
          <Reply className="h-4 w-4" />
          <span className="hidden sm:inline">Reply</span>
        </Button>
      </div>

      <div className="p-4 border-b bg-muted/5">
        <div className="grid gap-1.5 text-sm">
          <div className="flex gap-2">
            <span className="font-semibold text-muted-foreground w-12">From:</span>
            <span>{fullEmail?.from || email.from}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-muted-foreground w-12">To:</span>
            <span className="truncate">{(fullEmail?.to || email.to)?.join(", ")}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-muted-foreground w-12">Date:</span>
            <span>
              {email.created_at
                ? format(new Date(email.created_at), "PPpp")
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : fullEmail ? (
          <div
            className="prose max-w-none text-black"
            dangerouslySetInnerHTML={{ __html: fullEmail.html || `<p>${fullEmail.text || "No content."}</p>` }}
          />
        ) : (
          <div className="text-center text-muted-foreground pt-10">
            Could not load the email content.
          </div>
        )}
      </div>
    </div>
  );
}
