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
import { CheckCircle2, Circle, Lock } from "lucide-react";
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

  // Determine next available topic
  let nextAvailableTopicId: string | null = null;
  let allTopicsCompleted = true;

  outer: for (const mod of course.modules) {
    for (const topic of mod.topics) {
      if (!progress[topic.id]) {
        if (!nextAvailableTopicId) nextAvailableTopicId = topic.id;
        allTopicsCompleted = false;
      }
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Course Info */}
          {course.image && (
            <img
              src={course.image}
              alt={course.title}
              className="w-full max-h-64 object-cover rounded-md mb-6"
            />
          )}
          <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {course.description}
          </p>

          {/* Start/Review Button */}
          {nextAvailableTopicId && (
            <Button asChild size="lg" className="mt-6">
              <Link href={`/courses/${course.id}/${nextAvailableTopicId}`}>
                {allTopicsCompleted ? "Review Course" : "Start Course"}
              </Link>
            </Button>
          )}

          {/* Course Content Accordion */}
          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion
                type="single"
                collapsible
                defaultValue={course.modules?.[0]?.id}
              >
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger>{module.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2 mt-2">
                        {module.topics.map((topic) => {
                          const isCompleted = !!progress[topic.id];
                          const isNextAvailable =
                            topic.id === nextAvailableTopicId;
                          const isLocked = !isCompleted && !isNextAvailable;

                          let Icon = isCompleted
                            ? CheckCircle2
                            : isNextAvailable
                            ? Circle
                            : Lock;
                          const isClickable = isCompleted || isNextAvailable;

                          return (
                            <div
                              key={topic.id}
                              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted"
                            >
                              {isClickable ? (
                                <Link
                                  href={`/courses/${course.id}/${topic.id}`}
                                  className="flex items-center gap-3 w-full"
                                >
                                  <Icon
                                    className={`h-5 w-5 ${
                                      isCompleted
                                        ? "text-primary fill-primary/20"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                  <span
                                    className={isCompleted ? "font-medium" : ""}
                                  >
                                    {topic.title}
                                  </span>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 w-full opacity-50 cursor-not-allowed">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                  <span>{topic.title}</span>
                                </div>
                              )}
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
    </AppLayout>
  );
}
