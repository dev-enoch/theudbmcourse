"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendMail } from "../actions";
import { ResendEmail } from "../types";

export function ComposeModal({
  onClose,
  replyToEmail,
  activeTab,
}: {
  onClose: () => void;
  replyToEmail?: ResendEmail | null;
  activeTab: "inbox" | "sent";
}) {
  const [to, setTo] = useState(() => {
    if (!replyToEmail) return "";
    // If we're replying to an email in our inbox, we send it to the 'from' address
    // If we're replying to a sent email, we probably want to send it to the 'to' address
    if (activeTab === "inbox") {
      // Extract email from "Name <email@domain.com>" if formatted that way
      const match = replyToEmail.from.match(/<([^>]+)>/);
      return match ? match[1] : replyToEmail.from;
    }
    return replyToEmail.to?.[0] || "";
  });

  const [subject, setSubject] = useState(() => {
    if (!replyToEmail) return "";
    const s = replyToEmail.subject || "";
    return s.startsWith("Re:") ? s : `Re: ${s}`;
  });

  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSending(true);
    try {
      await sendMail({
        to,
        subject,
        htmlBody: body,
        inReplyTo: replyToEmail?.id, // Useful for threading if the email client supports it
      });
      toast.success("Email sent successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{replyToEmail ? "Reply" : "New Message"}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 mt-4 overflow-y-auto pr-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">To:</label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              type="email"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Subject:</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
            />
          </div>
          
          <div className="grid gap-2 flex-1 flex flex-col">
            <label className="text-sm font-medium">Message (HTML/Text):</label>
            <textarea
              className="flex-1 min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
