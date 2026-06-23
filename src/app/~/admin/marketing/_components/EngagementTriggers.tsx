"use client";

import { useState } from "react";
import { saveAutomatedTriggers } from "../actions";

export default function EngagementTriggers({
  initialLessonTrigger,
  initialCourseTrigger,
}: {
  initialLessonTrigger: boolean;
  initialCourseTrigger: boolean;
}) {
  const [lessonTrigger, setLessonTrigger] = useState(initialLessonTrigger);
  const [courseTrigger, setCourseTrigger] = useState(initialCourseTrigger);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveAutomatedTriggers(lessonTrigger, courseTrigger);
      alert("Settings saved successfully!");
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Automated Engagement Triggers</h2>
      <p className="text-gray-400 mb-6 text-sm">
        Automatically send styled, encouraging emails when users complete a milestone.
      </p>

      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={lessonTrigger}
            onChange={(e) => setLessonTrigger(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-gray-200">Send Lesson Completion Emails</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={courseTrigger}
            onChange={(e) => setCourseTrigger(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-gray-200">Send Course Completion Certificates</span>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
      >
        {saving ? "Saving..." : "Save Triggers"}
      </button>
    </div>
  );
}
