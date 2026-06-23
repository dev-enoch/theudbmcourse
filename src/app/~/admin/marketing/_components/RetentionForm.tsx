"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { sendRetentionEmails } from "../actions";

export function RetentionForm() {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await sendRetentionEmails();
      toast.success("Retention emails queued for inactive users!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send emails");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Identify users who haven't completed a module in over 7 days and send them a "We miss you" re-engagement email with a quick link to their last active course.
      </p>

      <Button onClick={handleSend} disabled={loading} variant="outline" className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        Send Re-engagement Blast
      </Button>
    </div>
  );
}
