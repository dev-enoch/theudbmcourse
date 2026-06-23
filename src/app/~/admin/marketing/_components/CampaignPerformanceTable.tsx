"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CampaignPerformanceTable({ campaigns }: { campaigns: any[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Active and recent campaigns</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {campaigns.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No campaigns yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-y">
                <tr>
                  <th className="px-6 py-3 font-medium">Campaign</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Audience</th>
                  <th className="px-6 py-3 font-medium">Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground truncate max-w-xs">{c.subject}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Email · {new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {c.status === "sent" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Sent
                        </span>
                      ) : c.status === "scheduled" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize text-muted-foreground">
                      {c.audience}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {c.sentCount ? c.sentCount.toLocaleString() : "-"}
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
