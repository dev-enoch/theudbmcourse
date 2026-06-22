"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateSettingsOnServer } from "../actions";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    supportWhatsApp?: string;
    supportEmail?: string;
    siteTitle?: string;
    announcementBanner?: string;
    announcementEnabled?: boolean;
  };
}

const TooltipInfo = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 inline-block cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  return (
    <div className="space-y-8 pb-12">
      <BrandingSection initialSettings={initialSettings} />
      <SupportSection initialSettings={initialSettings} />
      <PayonaireSection initialSettings={initialSettings} />
      <GroupsSection initialSettings={initialSettings} />
    </div>
  );
}

// ---------------------------------------------
// BRANDING SECTION
// ---------------------------------------------
function BrandingSection({ initialSettings }: { initialSettings: SettingsFormProps["initialSettings"] }) {
  const [siteTitle, setSiteTitle] = useState(initialSettings.siteTitle || "");
  const [announcementBanner, setAnnouncementBanner] = useState(initialSettings.announcementBanner || "");
  const [announcementEnabled, setAnnouncementEnabled] = useState(initialSettings.announcementEnabled || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateSettingsOnServer({ siteTitle, announcementBanner, announcementEnabled });
      if (result.error) toast.error(result.error);
      else toast.success("Branding settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update branding settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Branding & Appearance</CardTitle>
          <CardDescription>
            Configure global site title and announcement banner across the entire platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">
              Site Title <TooltipInfo content="This appears in the browser tab and meta tags for SEO." />
            </Label>
            <Input
              id="siteTitle"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Blueprint to Automated Gains (BAG)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcementBanner">
              Announcement Banner Text <TooltipInfo content="Visible at the very top of all pages when enabled. Formats as a marquee." />
            </Label>
            <Input
              id="announcementBanner"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="E.g., Welcome to the new platform!"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="announcementEnabled"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="announcementEnabled" className="cursor-pointer">
              Enable Announcement Banner
            </Label>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Keep the site title concise for better SEO.</span>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ---------------------------------------------
// SUPPORT SECTION
// ---------------------------------------------
function SupportSection({ initialSettings }: { initialSettings: SettingsFormProps["initialSettings"] }) {
  const [supportWhatsApp, setSupportWhatsApp] = useState(initialSettings.supportWhatsApp || "");
  const [supportEmail, setSupportEmail] = useState(initialSettings.supportEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateSettingsOnServer({ supportWhatsApp, supportEmail });
      if (result.error) toast.error(result.error);
      else toast.success("Support settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update support settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Support & Contact Channels</CardTitle>
          <CardDescription>
            Configure support links for users needing help or reporting issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supportWhatsApp">Support WhatsApp Link</Label>
            <Input
              id="supportWhatsApp"
              value={supportWhatsApp}
              onChange={(e) => setSupportWhatsApp(e.target.value)}
              placeholder="https://wa.me/..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@bag.com"
              required
              type="email"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Used on login pages and support interfaces.</span>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ---------------------------------------------
// PAYONAIRE SECTION
// ---------------------------------------------
function PayonaireSection({ initialSettings }: { initialSettings: SettingsFormProps["initialSettings"] }) {
  const [payonairePurchaseLink, setPayonairePurchaseLink] = useState(initialSettings.payonairePurchaseLink || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateSettingsOnServer({ payonairePurchaseLink });
      if (result.error) toast.error(result.error);
      else toast.success("Checkout link saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update checkout link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Payonaire Purchase Setting</CardTitle>
          <CardDescription>
            Configure the default redirect checkout URL on Payonaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payonairePurchaseLink">
              Payonaire Purchase URL <TooltipInfo content="Unauthorized users trying to access locked courses are sent here." />
            </Label>
            <Input
              id="payonairePurchaseLink"
              value={payonairePurchaseLink}
              onChange={(e) => setPayonairePurchaseLink(e.target.value)}
              placeholder="https://payonaire.com/checkout/..."
              required
              type="url"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Make sure this points to your active checkout page.</span>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ---------------------------------------------
// GROUPS SECTION
// ---------------------------------------------
function GroupsSection({ initialSettings }: { initialSettings: SettingsFormProps["initialSettings"] }) {
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>(initialSettings.groupLinks);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addGroupLink = () => {
    setGroupLinks([
      ...groupLinks,
      { courseId: "", courseName: "", link: "", enabled: true },
    ]);
  };

  const removeGroupLink = (index: number) => {
    setGroupLinks(groupLinks.filter((_, i) => i !== index));
  };

  const updateGroupLink = (index: number, field: keyof GroupLink, value: any) => {
    const updated = [...groupLinks];
    updated[index] = { ...updated[index], [field]: value };
    setGroupLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateSettingsOnServer({ groupLinks });
      if (result.error) toast.error(result.error);
      else toast.success("Group links saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update group links.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Group Links Manager</CardTitle>
          <CardDescription>
            Manage WhatsApp/Telegram group links for courses. <TooltipInfo content="When a user completes a course with an enabled group link, they'll see a 'Join Group' button on their dashboard." />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center bg-muted/20">
              No group links configured yet.
            </p>
          ) : (
            <div className="space-y-4">
              {groupLinks.map((link, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/10 relative">
                  <div className="flex justify-between items-start">
                    <Badge variant={link.enabled ? "default" : "secondary"}>
                      {link.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGroupLink(index)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`courseId-${index}`}>Course ID</Label>
                      <Input
                        id={`courseId-${index}`}
                        value={link.courseId}
                        onChange={(e) => updateGroupLink(index, "courseId", e.target.value)}
                        placeholder="e.g., ha-tiktok-ads"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`courseName-${index}`}>Course Name</Label>
                      <Input
                        id={`courseName-${index}`}
                        value={link.courseName}
                        onChange={(e) => updateGroupLink(index, "courseName", e.target.value)}
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
                      onChange={(e) => updateGroupLink(index, "link", e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`enabled-${index}`}
                      checked={link.enabled}
                      onChange={(e) => updateGroupLink(index, "enabled", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={`enabled-${index}`} className="cursor-pointer">
                      Enable this group link
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button type="button" variant="outline" onClick={addGroupLink} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Group Link
          </Button>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Course ID must perfectly match the ID in your courses.json file.</span>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
