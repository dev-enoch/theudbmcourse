import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types";
import AppLayout from "@/components/common/AppLayout";

const hausaCourses: Omit<Course, "modules">[] = [
  {
    id: "ha-affiliate-marketing",
    title: "Affiliate Marketing (Hausa)",
  },
  {
    id: "ha-whatsapp-marketing",
    title: "WhatsApp Marketing (Hausa)",
  },
  {
    id: "ha-facebook-instagram-ads",
    title: "Facebook & Instagram Ads (Hausa)",
  },
  {
    id: "ha-tiktok-ads",
    title: "TikTok Ads / Marketing (Hausa)",
  },
];

export default async function HomePage() {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col">
        <section id="courses" className="w-full py-8 md:py-18 lg:py-24">
          <div className="container px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge>Our Courses</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Start Your Journey
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our courses are designed to be practical and action-oriented,
                  giving you the blueprint for success.
                </p>
              </div>
            </div>

            {/* Hausa Courses */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl text-center mb-8">
                Hausa Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12">
                {hausaCourses.map((course) => (
                  <Card key={course.id} className="h-full flex flex-col w-full">
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="grow" />
                      <Button asChild className="mt-auto w-full">
                        <Link href={`/courses/${course.id}`}>
                          View Course <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
