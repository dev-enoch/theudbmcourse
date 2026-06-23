"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, TrendingUp, Mail, Megaphone } from "lucide-react";

interface KpiCardsProps {
  stats: {
    totalStudents: number;
    conversionRate: number;
    emailsDelivered: number;
    activeCampaigns: number;
  };
}

export default function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Active Learners
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <div className="h-8 w-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Users who started a course
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emails Delivered</CardTitle>
          <div className="h-8 w-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
            <Mail className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.emailsDelivered.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total outreach volume
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Marketing Activity</CardTitle>
          <div className="h-8 w-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
            <Megaphone className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active campaigns & rules
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
