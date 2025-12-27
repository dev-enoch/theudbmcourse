"use client";

import { useState, useMemo, useRef } from "react";
import type { Course, UserProgress, Topic } from "@/lib/types";
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

const linkifyText = (text: string): React.ReactNode[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) =>
    part.startsWith("http") ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        [here]
      </a>
    ) : (
      part
    )
  );
};

function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const videoRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
      <iframe
        ref={videoRef}
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function ModulesSidebar({
  course,
  progress,
  selectedTopic,
  defaultAccordionValue,
  onNextTopic,
}: {
  course: Course;
  progress: UserProgress;
  selectedTopic: Topic | null;
  defaultAccordionValue?: string;
  allTopicIds: string[];
  userId: string;
  onNextTopic: (topic: Topic) => void;
}) {
  // Flatten all topics in order
  const allTopics = useMemo(
    () => course.modules.flatMap((m) => m.topics),
    [course.modules]
  );

  // Determine which topic is next available
  const nextAvailableTopicId = useMemo(() => {
    for (const topic of allTopics) {
      if (!progress[topic.id]) {
        return topic.id;
      }
    }
    return null;
  }, [allTopics, progress]);

  const handleMarkNext = (topic: Topic) => {
    if (topic.id === nextAvailableTopicId || progress[topic.id]) {
      onNextTopic(topic);
    }
  };

  return (
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
                        isNextAvailable={topic.id === nextAvailableTopicId}
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
  );
}

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

  const handleNextTopic = async (topic: Topic) => {
    // Only allow next if this topic is the next available or already completed
    const nextTopic = course.modules
      .flatMap((m) => m.topics)
      .find((t) => !progress[t.id]);

    if (topic.id !== nextTopic?.id && !progress[topic.id]) {
      toast.error("You must complete previous topics first.");
      return;
    }

    // Mark topic as completed
    if (!progress[topic.id]) {
      try {
        setProgress((prev) => ({ ...prev, [topic.id]: true }));
        await updateUserProgressOnServer(userId, topic.id, true);
        toast.success(`You've completed "${topic.title}".`);
      } catch {
        toast.error("Error: Could not save progress.");
        return;
      }
    }

    // Navigate to next topic
    const allTopics = course.modules.flatMap((m) => m.topics);
    const currentIndex = allTopics.findIndex((t) => t.id === topic.id);
    const next = allTopics[currentIndex + 1];
    if (next) {
      router.push(`/courses/${course.id}/${next.id}`);
    } else {
      toast.success("Congratulations! You've completed the course!");
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 sm:p-6">
      {/* Mobile Video */}
      {selectedTopic && (
        <div className="lg:hidden mb-4">
          <VideoPlayer
            videoId={selectedTopic.videoId}
            title={selectedTopic.title}
          />
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

        <ModulesSidebar
          course={course}
          progress={progress}
          selectedTopic={selectedTopic}
          defaultAccordionValue={defaultAccordionValue}
          allTopicIds={allTopicIds}
          userId={userId}
          onNextTopic={handleNextTopic}
        />
      </div>

      {/* Desktop Video + Topic */}
      <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4 order-1 lg:order-2">
        {selectedTopic && (
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-3xl">{selectedTopic.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="hidden lg:block">
                <VideoPlayer
                  videoId={selectedTopic.videoId}
                  title={selectedTopic.title}
                />
              </div>
              <CardDescription>
                {linkifyText(selectedTopic.description)}
              </CardDescription>
              <div className="grow" />
              <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
                {isLastTopic ? (
                  course.id === "ha-tiktok-ads" ? (
                    <Button
                      onClick={() =>
                        window.open(
                          "https://chat.whatsapp.com/LCECsTmXq7iIJIlBSoLPaQ",
                          "_blank"
                        )
                      }
                    >
                      Join Group
                    </Button>
                  ) : (
                    <Button onClick={() => router.push("/")}>
                      Back to Home
                    </Button>
                  )
                ) : (
                  <Button onClick={() => handleNextTopic(selectedTopic)}>
                    Next Topic
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
