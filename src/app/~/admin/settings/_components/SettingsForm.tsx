"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateSettingsOnServer } from "../actions";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupLink {
  courseId: string;
  courseName: string;
  link: string;
  enabled: boolean;
}

interface SettingsFormProps {
  initialSettings: {
    _id: string;
    groupLinks: GroupLink[];
    payonairePurchaseLink?: string;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>(
    initialSettings.groupLinks
  );
  const [payonairePurchaseLink, setPayonairePurchaseLink] = useState<string>(
    initialSettings.payonairePurchaseLink || "https://payonaire.com"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addGroupLink = () => {
    setGroupLinks([
      ...groupLinks,
      {
        courseId: "",
        courseName: "",
        link: "",
        enabled: true,
      },
    ]);
  };

  const removeGroupLink = (index: number) => {
    setGroupLinks(groupLinks.filter((_, i) => i !== index));
  };

  const updateGroupLink = (
    index: number,
    field: keyof GroupLink,
    value: any
  ) => {
    const updated = [...groupLinks];
    updated[index] = { ...updated[index], [field]: value };
    setGroupLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateSettingsOnServer(groupLinks, payonairePurchaseLink);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Settings updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payonaire Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payonaire Purchase Settings</CardTitle>
          <CardDescription>
            Configure the default redirect checkout URL on Payonaire. Users who have not purchased the course or are unauthorized will be prompted to purchase via this link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payonairePurchaseLink">Payonaire Purchase URL</Label>
            <Input
              id="payonairePurchaseLink"
              value={payonairePurchaseLink}
              onChange={(e) => setPayonairePurchaseLink(e.target.value)}
              placeholder="https://payonaire.com/checkout/..."
              required
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              This URL is used as the link button in the Access Locked page.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Links</CardTitle>
          <CardDescription>
            Manage WhatsApp/Telegram group links for different courses. When a
            user completes a course with an enabled group link, they'll see a
            "Join Group" button.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No group links configured yet.
            </p>
          ) : (
            groupLinks.map((link, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-4 relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <Badge variant={link.enabled ? "default" : "secondary"}>
                      {link.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGroupLink(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`courseId-${index}`}>Course ID</Label>
                    <Input
                      id={`courseId-${index}`}
                      value={link.courseId}
                      onChange={(e) =>
                        updateGroupLink(index, "courseId", e.target.value)
                      }
                      placeholder="e.g., ha-tiktok-ads"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must match the course ID in your courses.json
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`courseName-${index}`}>Course Name</Label>
                    <Input
                      id={`courseName-${index}`}
                      value={link.courseName}
                      onChange={(e) =>
                        updateGroupLink(index, "courseName", e.target.value)
                      }
                      placeholder="e.g., TikTok Ads Course"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`link-${index}`}>Group Link</Label>
                  <Input
                    id={`link-${index}`}
                    value={link.link}
                    onChange={(e) =>
                      updateGroupLink(index, "link", e.target.value)
                    }
                    placeholder="https://chat.whatsapp.com/..."
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`enabled-${index}`}
                    checked={link.enabled}
                    onChange={(e) =>
                      updateGroupLink(index, "enabled", e.target.checked)
                    }
                    className="rounded"
                  />
                  <Label
                    htmlFor={`enabled-${index}`}
                    className="cursor-pointer"
                  >
                    Enable this group link
                  </Label>
                </div>
              </div>
            ))
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addGroupLink}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Group Link
          </Button>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
