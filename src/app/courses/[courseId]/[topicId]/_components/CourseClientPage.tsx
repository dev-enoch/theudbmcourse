"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Course, UserProgress } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateUserProgressOnServer } from "../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopicItem } from "./TopicItem";
import { toast } from "sonner";

interface CourseClientPageProps {
  course: Course;
  initialProgress: UserProgress;
  userId: string;
  allTopicIds: string[];
  currentTopicId: string;
}

export function CourseClientPage({
  course,
  initialProgress,
  userId,
  allTopicIds,
  currentTopicId,
}: CourseClientPageProps) {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const router = useRouter();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  const selectedTopic = useMemo(() => {
    for (const mod of course.modules) {
      for (const top of mod.topics) {
        if (top.id === currentTopicId) return top;
      }
    }
    return null;
  }, [course, currentTopicId]);

  const progressPercentage = useMemo(() => {
    const completedCount = Object.keys(progress).filter(
      (id) => progress[id] && allTopicIds.includes(id)
    ).length;
    return allTopicIds.length > 0
      ? (completedCount / allTopicIds.length) * 100
      : 0;
  }, [progress, allTopicIds]);

  const defaultAccordionValue = useMemo(() => {
    return selectedTopic
      ? course.modules.find((m) =>
          m.topics.some((t) => t.id === selectedTopic.id)
        )?.id
      : undefined;
  }, [selectedTopic, course.modules]);

  const isLastTopic = useMemo(() => {
    if (!selectedTopic) return true;
    const lastModule = course.modules[course.modules.length - 1];
    const lastTopic = lastModule.topics[lastModule.topics.length - 1];
    return selectedTopic.id === lastTopic.id;
  }, [selectedTopic, course.modules]);

  const handleMarkComplete = async () => {
    if (!selectedTopic || progress[selectedTopic.id]) return;
    try {
      setProgress((prev) => ({ ...prev, [selectedTopic.id]: true }));
      await updateUserProgressOnServer(userId, selectedTopic.id, true);
      toast(`You've completed "${selectedTopic.title}".`);
    } catch (error) {
      setProgress((prev) => ({ ...prev, [selectedTopic.id]: false }));
      toast.error("Error: Could not save progress.");
    }
  };

  const handleNextTopic = () => {
    if (!selectedTopic) return;

    let foundCurrent = false;
    for (const mod of course.modules) {
      for (const top of mod.topics) {
        if (foundCurrent) {
          router.push(`/courses/${course.id}/${top.id}`);
          return;
        }
        if (top.id === selectedTopic.id) foundCurrent = true;
      }
    }
    toast.success("Congratulations! You've completed the entire course!");
    router.push(`/courses/${course.id}`);
  };

  useEffect(() => {
    // Load YouTube API dynamically
    if (!selectedTopic) return;
    const ytScriptId = "youtube-api";
    if (!document.getElementById(ytScriptId)) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.id = ytScriptId;
      document.body.appendChild(tag);
    }

    const interval = setInterval(() => {
      const YT = (window as any).YT;
      if (YT && YT.Player && videoRef.current && !playerRef.current) {
        playerRef.current = new YT.Player(videoRef.current, {
          events: {
            onStateChange: (event: any) => {
              if (event.data === 0) handleMarkComplete(); // Video ended
            },
          },
        });
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [selectedTopic]);

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 sm:p-6">
      {/* Mobile Video */}
      {selectedTopic && (
        <div className="lg:hidden mb-4">
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
            <iframe
              ref={videoRef}
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${selectedTopic.videoId}?enablejsapi=1`}
              title={selectedTopic.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              <Link href={`/courses/${course.id}`} className="hover:underline">
                {course.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <Progress value={progressPercentage} />
              <p className="text-right text-sm font-medium text-primary">
                {Math.round(progressPercentage)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Modules</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 pb-4">
            <ScrollArea className="flex-1">
              <Accordion
                type="single"
                collapsible
                defaultValue={defaultAccordionValue}
                className="w-full px-4"
              >
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger>{module.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1">
                        {module.topics.map((topic) => (
                          <TopicItem
                            key={topic.id}
                            topic={topic}
                            courseId={course.id}
                            isCompleted={!!progress[topic.id]}
                            isSelected={selectedTopic?.id === topic.id}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Video + Topic */}
      <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4 order-1 lg:order-2">
        {selectedTopic && (
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-3xl">{selectedTopic.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="hidden lg:block aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <iframe
                  ref={videoRef}
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedTopic.videoId}?enablejsapi=1`}
                  title={selectedTopic.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <CardDescription>{selectedTopic.description}</CardDescription>
              <div className="grow" />
              <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                {isLastTopic ? (
                  <Button asChild>
                    <Link href={`/courses/${course.id}`}>
                      Back to Course Overview
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={handleNextTopic}>Next Topic</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
