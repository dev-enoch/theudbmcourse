"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createAutomationRule, toggleAutomationRule, deleteAutomationRule } from "../actions";

export default function AutomationsPanel({ rules }: { rules: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  // Form states for new rule
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("inactive_14_days");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading("create");
    try {
      await createAutomationRule({ name, trigger, subject, htmlBody, isActive: true });
      window.location.reload();
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(null);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    setLoading(`toggle-${id}`);
    try {
      await toggleAutomationRule(id, !currentStatus);
      window.location.reload();
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    setLoading(`delete-${id}`);
    try {
      await deleteAutomationRule(id);
      window.location.reload();
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(null);
    }
  }

  const triggerLabels: Record<string, string> = {
    inactive_14_days: "User Inactive for 14 Days",
    lesson_completed: "User Completes Any Lesson",
    course_completed: "User Completes Full Course",
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Broadcast Mail</CardTitle>
        <CardDescription>
          Send broadcast emails to your users and set up automated drip sequences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Create New Rule */}
        <div className="bg-muted/30 border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold mb-4">Create New Automation</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-background border rounded px-3 py-2 focus:ring-2 focus:ring-ring"
                  placeholder="e.g. 14-Day Re-engagement Drip"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trigger Event</label>
                <select
                  value={trigger}
                  onChange={e => setTrigger(e.target.value)}
                  className="w-full bg-background border rounded px-3 py-2 focus:ring-2 focus:ring-ring"
                >
                  <option value="inactive_14_days">User Inactive for 14 Days</option>
                  <option value="lesson_completed">User Completes Any Lesson</option>
                  <option value="course_completed">User Completes Full Course</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-background border rounded px-3 py-2 focus:ring-2 focus:ring-ring"
                placeholder="Where have you been?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Body (HTML/Markdown-style)</label>
              <textarea
                value={htmlBody}
                onChange={e => setHtmlBody(e.target.value)}
                rows={4}
                className="w-full bg-background border rounded px-3 py-2 focus:ring-2 focus:ring-ring"
                placeholder="<p>We noticed you haven't logged in recently...</p>"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading === "create"}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-sm font-medium disabled:opacity-50"
            >
              {loading === "create" ? "Creating..." : "Create Automation"}
            </button>
          </form>
        </div>

        {/* Existing Rules */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Active Automations</h3>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No automations created yet.</p>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-background">
                  <div className="mb-4 sm:mb-0">
                    <h4 className="font-semibold">{rule.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">Trigger:</span> {triggerLabels[rule.trigger] || rule.trigger}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-sm">
                      <span className="font-medium text-foreground">Subject:</span> {rule.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{rule.isActive ? "Active" : "Paused"}</span>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggle(rule._id, rule.isActive)}
                        disabled={loading === `toggle-${rule._id}`}
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      disabled={loading === `delete-${rule._id}`}
                      className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
