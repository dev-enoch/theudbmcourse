"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ResendEmail } from "../types";
import { ArrowDownLeft, ArrowUpRight, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MailList({
  emails,
  filter,
  onFilterChange,
  selectedEmail,
  onSelectEmail,
  onCompose,
}: {
  emails: ResendEmail[];
  filter: "all" | "inbox" | "sent";
  onFilterChange: (f: "all" | "inbox" | "sent") => void;
  selectedEmail: ResendEmail | null;
  onSelectEmail: (email: ResendEmail) => void;
  onCompose: () => void;
}) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header and Pills */}
      <div className="p-4 border-b flex flex-col gap-4 bg-muted/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Mail</h2>
          <Button onClick={onCompose} size="sm" className="gap-2 rounded-full h-8 px-3">
            <PenSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Compose</span>
          </Button>
        </div>
        <div className="flex bg-muted rounded-full p-1 w-full text-sm font-medium">
          <button
            onClick={() => onFilterChange("all")}
            className={`flex-1 rounded-full py-1.5 text-center transition-all ${filter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("inbox")}
            className={`flex-1 rounded-full py-1.5 text-center transition-all ${filter === "inbox" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Received
          </button>
          <button
            onClick={() => onFilterChange("sent")}
            className={`flex-1 rounded-full py-1.5 text-center transition-all ${filter === "sent" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sent
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {emails.length === 0 ? (
          <div className="flex items-center justify-center text-sm text-muted-foreground p-8 text-center h-40">
            No emails found.
          </div>
        ) : (
          <div className="flex flex-col p-3 gap-2">
            {emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              const isInbox = email.folder === "inbox";
              
              return (
                <button
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${
                    isSelected ? "bg-accent border-primary/20" : "bg-background border-transparent"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isInbox ? (
                      <ArrowDownLeft className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex w-full flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold truncate">
                        {isInbox ? email.from : email.to?.join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {email.created_at
                          ? formatDistanceToNow(new Date(email.created_at), { addSuffix: true })
                          : ""}
                      </div>
                    </div>
                    <div className="font-medium truncate text-muted-foreground w-full">{email.subject}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
