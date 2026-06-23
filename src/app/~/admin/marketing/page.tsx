import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomatedTriggersForm } from "./_components/AutomatedTriggersForm";
import { DailyPingForm } from "./_components/DailyPingForm";
import { RetentionForm } from "./_components/RetentionForm";
import { getMarketingSettings } from "./actions";

export default async function MarketingPage() {
  const settings = await getMarketingSettings();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Marketing Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage automated engagement triggers, send daily pings, and retain students.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Engagement Triggers</CardTitle>
              <CardDescription>
                Enable automated emails to celebrate student milestones and boost completion rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomatedTriggersForm initialSettings={settings} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retention & Re-engagement</CardTitle>
              <CardDescription>
                Send quick "We Miss You" emails to inactive students to bring them back.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RetentionForm />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Daily Ping Campaign</CardTitle>
              <CardDescription>
                Blast a custom marketing email to your users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailyPingForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
