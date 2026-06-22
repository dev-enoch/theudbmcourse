"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendMagicLink } from "../actions";
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await sendMagicLink(email);
      if (res.error) {
        setStatus({ error: res.error });
      } else if (res.redirectUrl) {
        setStatus({ success: res.success });
        setEmail("");
        // Instantly redirect using location.href to ensure cookies are written and middleware intercepts correctly
        setTimeout(() => {
          window.location.href = res.redirectUrl!;
        }, 1000);
      }
    } catch (err: any) {
      setStatus({ error: err.message || "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left border-t border-border/60 pt-4">
      <div className="space-y-2">
        <Label htmlFor="recovery-email" className="text-xs font-semibold text-foreground/90">
          Existing Student? Log In Instantly
        </Label>
        <div className="flex gap-2">
          <Input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your account email"
            required
            className="flex-1 text-sm py-2"
          />
          <Button type="submit" disabled={isSubmitting} variant="outline" className="px-3">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="h-4 w-4 mr-1.5" />
                Access Now
              </>
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Enter your registered email to immediately verify your status and activate access on this browser.
        </p>
      </div>

      {status?.error && (
        <div className="flex items-start gap-2 p-2.5 text-xs bg-destructive/10 text-destructive rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{status.error}</span>
        </div>
      )}

      {status?.success && (
        <div className="flex items-start gap-2 p-2.5 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{status.success}</span>
        </div>
      )}
    </form>
  );
}
