"use client";

import { useState } from "react";
import { MailList } from "./MailList";
import { MailViewer } from "./MailViewer";
import { ComposeModal } from "./ComposeModal";
import { Inbox, Send, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResendEmail } from "../types";

export function MailClient({ initialReceived, initialSent, emailFrom }: { initialReceived: ResendEmail[], initialSent: ResendEmail[], emailFrom: string }) {
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [selectedEmail, setSelectedEmail] = useState<ResendEmail | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<ResendEmail | null>(null);

  // Fallback to empty array just in case data comes back as null/undefined
  const emails = activeTab === "inbox" ? (initialReceived || []) : (initialSent || []);

  const handleCompose = () => {
    setReplyToEmail(null);
    setIsComposing(true);
  };

  const handleReply = (email: ResendEmail) => {
    setReplyToEmail(email);
    setIsComposing(true);
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Mail Sidebar */}
      <div className="hidden md:flex w-64 border-r bg-muted/20 flex-col p-4 shrink-0">
        <Button onClick={handleCompose} className="w-full justify-start gap-2 mb-6">
          <PenSquare className="h-4 w-4" />
          Compose
        </Button>
        <nav className="flex flex-col gap-2">
          <Button
            variant={activeTab === "inbox" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => { setActiveTab("inbox"); setSelectedEmail(null); }}
          >
            <Inbox className="h-4 w-4" />
            Inbox
            <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {initialReceived?.length || 0}
            </span>
          </Button>
          <Button
            variant={activeTab === "sent" ? "secondary" : "ghost"}
            className="justify-start gap-2"
            onClick={() => { setActiveTab("sent"); setSelectedEmail(null); }}
          >
            <Send className="h-4 w-4" />
            Sent
            <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {initialSent?.length || 0}
            </span>
          </Button>
        </nav>
      </div>

      {/* Mail List */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-background h-full shrink-0 ${selectedEmail ? 'hidden md:flex' : 'flex'}`}>
        <MailList
          emails={emails}
          activeTab={activeTab}
          selectedEmail={selectedEmail}
          onSelectEmail={setSelectedEmail}
        />
      </div>

      {/* Mail Viewer */}
      <div className={`flex-1 bg-background overflow-y-auto ${!selectedEmail ? 'hidden md:flex' : 'flex'}`}>
        {selectedEmail ? (
          <MailViewer
            email={selectedEmail}
            onReply={() => handleReply(selectedEmail)}
            activeTab={activeTab}
            onBack={() => setSelectedEmail(null)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            Select an email to view
          </div>
        )}
      </div>

      {isComposing && (
        <ComposeModal
          onClose={() => setIsComposing(false)}
          replyToEmail={replyToEmail}
          activeTab={activeTab}
        />
      )}
    </div>
  );
}
