import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { getCourseById, getUserProgress } from "@/lib/data";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import AppLayout from "@/components/common/AppLayout";

type CourseLandingPageProps = {
  params: {
    courseId: string;
  };
};

export default async function CourseLandingPage(props: CourseLandingPageProps) {
  const { courseId } = await props.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const progress = await getUserProgress(userId);

  let firstUncompletedTopicId = course.modules?.[0]?.topics?.[0]?.id;
  let allTopicsCompleted = true;

  if (course.modules) {
    outer: for (const mod of course.modules) {
      for (const topic of mod.topics) {
        if (!progress[topic.id]) {
          firstUncompletedTopicId = topic.id;
          allTopicsCompleted = false;
          break outer;
        }
      }
    }
  }

  const startTopicId = firstUncompletedTopicId;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Course Info and Start Button */}
          <div className="md:col-span-2">
            {/* Display course image if exists */}
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="w-full max-h-64 object-cover rounded-md mb-6"
              />
            )}

            <h1 className="text-4xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {course.description}
            </p>

            {startTopicId ? (
              <Button asChild size="lg" className="mt-8">
                <Link href={`/courses/${course.id}/${startTopicId}`}>
                  {allTopicsCompleted ? "Review Course" : "Start Course"}
                </Link>
              </Button>
            ) : (
              <p className="mt-8 text-muted-foreground">
                This course does not have any topics yet.
              </p>
            )}
          </div>

          {/* Course Content Accordion */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={course.modules?.[0]?.id}
                >
                  {course.modules?.map((module) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger>{module.title}</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2">
                          {module.topics.map((topic) => {
                            const isCompleted = !!progress[topic.id];
                            return (
                              <div
                                key={topic.id}
                                className="flex items-center gap-3 px-3 py-2 text-muted-foreground"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                                <span>{topic.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
