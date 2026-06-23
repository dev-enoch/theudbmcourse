"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function MarketingAnalytics({ logs }: { logs: any[] }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Marketing Analytics (Delivery Logs)</CardTitle>
        <CardDescription>
          Track campaigns, re-engagement emails, and automated triggers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-muted-foreground">No email logs found yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b sticky top-0 z-10">
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
                  <tr key={log._id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(log.sentAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
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
      </CardContent>
    </Card>
  );
}
