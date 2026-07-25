"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ResendEmail } from "../types";

export function MailList({
  emails,
  activeTab,
  selectedEmail,
  onSelectEmail,
}: {
  emails: ResendEmail[];
  activeTab: "inbox" | "sent";
  selectedEmail: ResendEmail | null;
  onSelectEmail: (email: ResendEmail) => void;
}) {
  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8 text-center">
        No emails found in this folder.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col p-4 gap-2">
        {emails.map((email) => {
          const isSelected = selectedEmail?.id === email.id;
          
          return (
            <button
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${
                isSelected ? "bg-accent" : "bg-background"
              }`}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold truncate">
                    {activeTab === "inbox" ? email.from : email.to?.join(", ")}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {email.created_at
                      ? formatDistanceToNow(new Date(email.created_at), { addSuffix: true })
                      : ""}
                  </div>
                </div>
                <div className="font-medium truncate w-full">{email.subject}</div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
