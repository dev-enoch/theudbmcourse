"use client";

import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/types";
import Link from "next/link";

interface TopicItemProps {
  topic: Topic;
  isCompleted: boolean;
  isSelected: boolean;
  isNextAvailable?: boolean;
  courseId: string;
}

export function TopicItem({
  topic,
  isCompleted,
  isSelected,
  isNextAvailable,
  courseId,
}: TopicItemProps) {
  let Icon;
  if (isCompleted) Icon = CheckCircle2;
  else if (isNextAvailable) Icon = Circle;
  else Icon = Lock;

  const isClickable = isCompleted || isNextAvailable;

  return (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start pl-2 h-auto py-2",
        isSelected && "bg-primary/10"
      )}
      disabled={!isClickable}
    >
      {isClickable ? (
        <Link href={`/courses/${courseId}/${topic.id}`}>
          <Icon
            className={cn(
              "h-5 w-5 mr-2 text-muted-foreground",
              isCompleted && "text-primary fill-primary/20",
              isSelected && "text-primary"
            )}
          />
          <span className="flex-1 text-left text-sm">{topic.title}</span>
        </Link>
      ) : (
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2 text-muted-foreground" />
          <span className="flex-1 text-left text-sm">{topic.title}</span>
        </div>
      )}
    </Button>
  );
}
