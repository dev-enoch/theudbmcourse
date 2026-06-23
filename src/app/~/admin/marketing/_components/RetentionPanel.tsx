"use client";

import { useState } from "react";
import { sendReengagementEmail } from "../actions";

export default function RetentionPanel({ inactiveUsers }: { inactiveUsers: any[] }) {
  const [sending, setSending] = useState<string | null>(null);

  async function handleSend(email: string, name?: string) {
    setSending(email);
    try {
      await sendReengagementEmail(email, name);
      alert("Re-engagement email sent!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Retention & Re-engagement</h2>
      <p className="text-gray-400 mb-6 text-sm">
        "We Miss You" campaigns. Below are users who have stalled in their progress.
      </p>

      {inactiveUsers.length === 0 ? (
        <p className="text-gray-500">No inactive users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {inactiveUsers.map((user) => (
                <tr key={user._id} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{user.name || "N/A"}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleSend(user.email, user.name)}
                      disabled={sending === user.email}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      {sending === user.email ? "Sending..." : "Send 'We Miss You'"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
