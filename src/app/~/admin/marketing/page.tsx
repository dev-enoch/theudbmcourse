"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { sendMarketingEmail } from "./actions";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export default function MarketingPage() {
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !htmlContent) {
      toast.error("Please provide both a subject and email body.");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendMarketingEmail(subject, htmlContent);
      if (result.success) {
        toast.success(`Successfully sent to ${result.count} users!`);
        setSubject("");
        setHtmlContent("");
      } else {
        toast.error(`Failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Marketing & Communications</h1>
        <p className="text-muted-foreground mt-1">
          Send broadcast emails, daily pings, and promotions to all active students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Broadcast Email
          </CardTitle>
          <CardDescription>
            This email will be sent to all registered students. You can use {"{{name}}"} to insert the student's name dynamically. You can use HTML to style your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input 
              id="subject" 
              placeholder="e.g. 🚀 Flash Sale on New Courses!" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">HTML Content</Label>
            <Textarea 
              id="content" 
              className="min-h-[300px] font-mono text-sm"
              placeholder={`<div style="font-family: sans-serif;">\n  <h2>Hi {{name}},</h2>\n  <p>Your message here...</p>\n</div>`}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              disabled={isSending}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 mt-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Double check your content before sending.</p>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Broadcast"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
