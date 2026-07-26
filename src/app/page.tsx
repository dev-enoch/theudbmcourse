import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types";
import AppLayout from "@/components/common/AppLayout";
import { Progress } from "@/components/ui/progress";
import { readCoursesFile, getUserProgress } from "@/lib/data";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/getAuthSession";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getAuthSession();

  if (!session) redirect("/unauthorized");
  const userId = session.userId;

  const progress = await getUserProgress(userId);

  const resolvedCourses = await readCoursesFile();

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col">
        <section className="w-full py-8 md:py-18 lg:py-24">
          <div className="container px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <Badge>Our Courses</Badge>
              <h2 className="text-3xl font-bold sm:text-5xl">
                Start Your Journey
              </h2>
              <p className="text-muted-foreground max-w-[900px]">
                Practical, action-oriented courses with real results.
              </p>
            </div>

            {/* Courses */}
            {resolvedCourses.length === 0 ? (
              <div className="mt-12">
                <Card className="w-full bg-background border-dashed shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="rounded-full bg-muted p-4">
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No Courses Available</h3>
                    <p className="text-muted-foreground max-w-sm">
                      There are currently no courses available on the platform. Please check back later!
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resolvedCourses.map((course) => {
                  const allTopicIds = course.modules.flatMap((m) =>
                    m.topics.map((t) => t.id)
                  );

                  const completedCount = allTopicIds.filter(
                    (id) => progress[id]
                  ).length;

                  const percentage =
                    allTopicIds.length > 0
                      ? Math.round((completedCount / allTopicIds.length) * 100)
                      : 0;

                  const isCompleted =
                    completedCount === allTopicIds.length &&
                    allTopicIds.length > 0;

                  return (
                    <Card key={course.id} className="h-full flex flex-col w-full">
                      <CardHeader className="space-y-2">
                        <CardTitle>{course.title}</CardTitle>

                        {isCompleted && (
                          <Badge className="w-fit flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </Badge>
                        )}
                      </CardHeader>

                      <CardContent className="flex flex-col flex-1 space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{percentage}%</span>
                          </div>
                          <Progress value={percentage} />
                        </div>

                        {/* Action */}
                        <Button asChild className="mt-auto w-full">
                          <Link href={`/courses/${course.id}`}>
                            {isCompleted ? "Review Course" : "Continue Course"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
