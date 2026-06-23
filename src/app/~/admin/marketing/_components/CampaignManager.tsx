"use client";

import { useState } from "react";
import { createCampaign, sendCampaignNow } from "../actions";

export default function CampaignManager() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "active" | "inactive">("all");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"now" | "schedule">("now");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !body) return alert("Subject and body are required");

    setLoading(true);
    try {
      if (mode === "now") {
        const { id } = await createCampaign({ subject, body, audience });
        await sendCampaignNow(id);
        alert("Campaign sent successfully!");
      } else {
        if (!scheduledDate) return alert("Please select a date and time");
        await createCampaign({ subject, body, audience, scheduledAt: new Date(scheduledDate).toISOString() });
        alert("Campaign scheduled successfully!");
      }
      setSubject("");
      setBody("");
      setScheduledDate("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Daily Ping Campaign Manager</h2>
      <p className="text-gray-400 mb-6 text-sm">
        Send custom, styled HTML emails to your users. Use basic Markdown/text here.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            placeholder="E.g. Your Weekly Gains Update!"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Audience</label>
          <select
            value={audience}
            onChange={e => setAudience(e.target.value as any)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users Only</option>
            <option value="inactive">Inactive / Stalled Users</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email Body (Text/Markdown)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            placeholder="Type your message here. Separate paragraphs with new lines."
            required
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-gray-300">
            <input type="radio" checked={mode === "now"} onChange={() => setMode("now")} />
            Send Now
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="radio" checked={mode === "schedule"} onChange={() => setMode("schedule")} />
            Schedule for Later
          </label>
        </div>

        {mode === "schedule" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              required={mode === "schedule"}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
        >
          {loading ? "Processing..." : mode === "now" ? "Send Campaign Now" : "Schedule Campaign"}
        </button>
      </form>
    </div>
  );
}
