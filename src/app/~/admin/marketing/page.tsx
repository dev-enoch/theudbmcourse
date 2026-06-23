import {
  getMarketingSettings,
  getRetentionUsers,
  getPromoCodes,
  getEmailLogs,
} from "./actions";

import EngagementTriggers from "./_components/EngagementTriggers";
import CampaignManager from "./_components/CampaignManager";
import RetentionPanel from "./_components/RetentionPanel";
import PromoCodeManager from "./_components/PromoCodeManager";
import MarketingAnalytics from "./_components/MarketingAnalytics";

export default async function MarketingPage() {
  const [settings, inactiveUsers, codes, logs] = await Promise.all([
    getMarketingSettings(),
    getRetentionUsers(),
    getPromoCodes(),
    getEmailLogs(),
  ]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Marketing Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Turn your admin panel into a growth engine. Automate engagement, manage campaigns, and track analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <EngagementTriggers
            initialLessonTrigger={settings.lessonTrigger}
            initialCourseTrigger={settings.courseTrigger}
          />
          <RetentionPanel inactiveUsers={inactiveUsers} />
          <PromoCodeManager codes={codes} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <CampaignManager />
          <MarketingAnalytics logs={logs} />
        </div>
      </div>
    </div>
  );
}
