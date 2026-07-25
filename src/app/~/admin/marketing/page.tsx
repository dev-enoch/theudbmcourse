import {
  getCampaigns,
  getAutomationRules,
  getEmailLogs,
  getMarketingStats,
  getEnrollmentChartData,
  getAudienceSegmentsData
} from "./actions";
import { AppConfig } from "@/app.config";

import CampaignManager from "./_components/CampaignManager";
import AutomationsPanel from "./_components/AutomationsPanel";
import MarketingAnalytics from "./_components/MarketingAnalytics";
import KpiCards from "./_components/KpiCards";
import EnrollmentChart from "./_components/EnrollmentChart";
import AudienceDonutChart from "./_components/AudienceDonutChart";
import CampaignPerformanceTable from "./_components/CampaignPerformanceTable";

export default async function MarketingPage() {
  const [campaigns, rules, logs, stats, enrollmentData, audienceData] = await Promise.all([
    getCampaigns(),
    getAutomationRules(),
    getEmailLogs(),
    getMarketingStats(),
    getEnrollmentChartData(),
    getAudienceSegmentsData()
  ]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketing Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Turn your admin panel into a growth engine. Build drip sequences, blast campaigns, and track analytics.
        </p>
      </div>

      {!process.env.RESEND_API_KEY && (
        <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-500 rounded-lg">
          <p className="font-semibold">⚠️ Resend Configuration Missing</p>
          <p className="text-sm mt-1">
            You have not set a <code>RESEND_API_KEY</code> in your environment variables. Emails will not actually send.
            Once you add it, ensure your domain <b>{AppConfig.emailDomain}</b> is verified in Resend.
          </p>
        </div>
      )}

      {/* Row 1: KPI Cards */}
      <KpiCards stats={stats} />

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EnrollmentChart data={enrollmentData} />
        <AudienceDonutChart data={audienceData} />
      </div>

      {/* Row 3: Campaign Performance and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CampaignPerformanceTable campaigns={campaigns} />
        
        <div className="col-span-1 flex flex-col gap-6">
          <AutomationsPanel rules={rules} />
          <MarketingAnalytics logs={logs} />
        </div>
      </div>
    </div>
  );
}
