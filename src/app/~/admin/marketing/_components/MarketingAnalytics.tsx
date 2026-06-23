"use client";

import { format } from "date-fns";

export default function MarketingAnalytics({ logs }: { logs: any[] }) {
  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Marketing Analytics (Delivery Logs)</h2>
      <p className="text-gray-400 mb-6 text-sm">
        Track campaigns, re-engagement emails, and automated triggers.
      </p>

      {logs.length === 0 ? (
        <p className="text-gray-500">No email logs found yet.</p>
      ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {format(new Date(log.sentAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                      {log.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.recipientEmail}</td>
                  <td className="px-4 py-3 truncate max-w-xs" title={log.subject}>
                    {log.subject}
                  </td>
                  <td className="px-4 py-3">
                    {log.status === "sent" ? (
                      <span className="text-green-500 font-medium">Sent</span>
                    ) : (
                      <span className="text-red-500 font-medium" title={log.error}>Failed</span>
                    )}
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
