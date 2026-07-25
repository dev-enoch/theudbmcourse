"use client";

import { useState, useMemo } from "react";
import { MailList } from "./MailList";
import { MailViewer } from "./MailViewer";
import { ComposeModal } from "./ComposeModal";
import { ResendEmail } from "../types";

export function MailClient({ initialReceived, initialSent, emailFrom }: { initialReceived: ResendEmail[], initialSent: ResendEmail[], emailFrom: string }) {
  const [filter, setFilter] = useState<"all" | "inbox" | "sent">("all");
  const [selectedEmail, setSelectedEmail] = useState<ResendEmail | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<ResendEmail | null>(null);

  // Combine and sort emails
  const allEmails = useMemo(() => {
    const received = (initialReceived || []).map(e => ({ ...e, folder: "inbox" as const }));
    const sent = (initialSent || []).map(e => ({ ...e, folder: "sent" as const }));
    
    return [...received, ...sent].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [initialReceived, initialSent]);

  const filteredEmails = useMemo(() => {
    if (filter === "all") return allEmails;
    return allEmails.filter(e => e.folder === filter);
  }, [allEmails, filter]);

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
      {/* Mail List */}
      <div className={`w-full md:w-[350px] border-r flex flex-col bg-background h-full shrink-0 ${selectedEmail ? 'hidden md:flex' : 'flex'}`}>
        <MailList
          emails={filteredEmails}
          filter={filter}
          onFilterChange={setFilter}
          selectedEmail={selectedEmail}
          onSelectEmail={setSelectedEmail}
          onCompose={handleCompose}
        />
      </div>

      {/* Mail Viewer */}
      <div className={`flex-1 bg-background overflow-y-auto ${!selectedEmail ? 'hidden md:flex' : 'flex'}`}>
        {selectedEmail ? (
          <MailViewer
            email={selectedEmail}
            onReply={() => handleReply(selectedEmail)}
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
        />
      )}
    </div>
  );
}
