import { getAdminAnalytics } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, CheckCircle, ShieldCheck, ShieldAlert, MonitorSmartphone } from "lucide-react";
import {
  SignupsChart,
  MonthlyRevenueChart,
  CourseCompletionChart,
  TopLessonsChart,
  AccountHealthChart
} from "./_components/DashboardCharts"

export default async function AdminPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1">
          High-level metrics and performance indicators for the platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Accounts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.suspendedUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently banned or suspended
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active courses in library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCompletedLessons}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total lessons watched by students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Users with admin privileges
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth (Last 7 Days)</CardTitle>
            <CardDescription>Daily new user registrations on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SignupsChart data={analytics.signupsOverTime} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Monthly Users & Est. Revenue (12m)</CardTitle>
            <CardDescription>User acquisition and generated revenue at $15k per user.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <MonthlyRevenueChart data={analytics.monthlyRevenue} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Account Health</CardTitle>
            <CardDescription>Breakdown of user statuses across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <AccountHealthChart data={analytics.accountHealth} />
          </CardContent>
        </Card>
      </div>      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Course Completion Rates</CardTitle>
            <CardDescription>Percentage of students who fully completed each course.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <CourseCompletionChart data={analytics.courseCompletions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Engaging Lessons</CardTitle>
            <CardDescription>Top 5 lessons with the highest completion numbers.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <TopLessonsChart data={analytics.topLessons} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
