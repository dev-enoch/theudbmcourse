"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { sendDailyPing } from "../actions";

export function DailyPingForm() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return toast.error("Please provide both subject and body.");

    setLoading(true);
    try {
      await sendDailyPing({ subject, body, audience });
      toast.success("Campaign dispatched successfully!");
      setSubject("");
      setBody("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send ping");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="audience">Target Audience</Label>
        <Select value={audience} onValueChange={setAudience}>
          <SelectTrigger id="audience">
            <SelectValue placeholder="Select audience..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active Users Only</SelectItem>
            <SelectItem value="inactive">Inactive Users (No recent progress)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject Line</Label>
        <Input 
          id="subject" 
          placeholder="New Module Available! 🚀" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Email Body (Plain Text or HTML)</Label>
        <Textarea 
          id="body" 
          placeholder="Write your custom marketing message here..." 
          className="min-h-[150px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This message will automatically be wrapped in the standard BAG newsletter template.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Dispatch Campaign Now
      </Button>
    </form>
  );
}
