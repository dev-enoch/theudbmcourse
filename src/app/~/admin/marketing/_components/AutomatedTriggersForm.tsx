"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { saveAutomatedTriggers } from "../actions";

export function AutomatedTriggersForm({ initialSettings }: { initialSettings: { lessonTrigger: boolean, courseTrigger: boolean } }) {
  const [loading, setLoading] = useState(false);
  const [lessonTrigger, setLessonTrigger] = useState(initialSettings.lessonTrigger);
  const [courseTrigger, setCourseTrigger] = useState(initialSettings.courseTrigger);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveAutomatedTriggers(lessonTrigger, courseTrigger);
      toast.success("Marketing triggers saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col space-y-1">
          <Label className="font-medium">Lesson Completion Emails</Label>
          <span className="text-xs text-muted-foreground">
            Send a styled congratulatory email when a user completes a lesson.
          </span>
        </div>
        <Switch 
          checked={lessonTrigger} 
          onCheckedChange={setLessonTrigger} 
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col space-y-1">
          <Label className="font-medium">Course Completion Certificates</Label>
          <span className="text-xs text-muted-foreground">
            Send a final email with an upsell link when a course is fully completed.
          </span>
        </div>
        <Switch 
          checked={courseTrigger} 
          onCheckedChange={setCourseTrigger} 
        />
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Trigger Preferences
      </Button>
    </div>
  );
}
