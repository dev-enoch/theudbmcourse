"use server";

import { connectDB } from "./mongoose";
import Settings from "@/models/Settings";
import { IGroupLink } from "@/models/Settings";

export async function getSettings() {
  await connectDB();

  let settings = await Settings.findOne();

  // Create default settings if none exist
  if (!settings) {
    settings = await Settings.create({
      groupLinks: [
        {
          courseId: "ha-tiktok-ads",
          courseName: "TikTok Ads Course",
          link: "https://chat.whatsapp.com/C2GTedPcLtzIcDbi5cXHhV",
          enabled: true,
        },
      ],
      payonairePurchaseLink: "https://payonaire.com",
    });
  }

  // Ensure default link exists in return object if not already set
  if (!settings.payonairePurchaseLink) {
    settings.payonairePurchaseLink = "https://payonaire.com";
    await settings.save();
  }

  return JSON.parse(JSON.stringify(settings));
}

export async function getGroupLinkByCourseId(courseId: string) {
  await connectDB();

  const settings = await Settings.findOne();
  if (!settings) return null;

  const groupLink = settings.groupLinks.find(
    (link: IGroupLink) => link.courseId === courseId && link.enabled
  );

  return groupLink ? groupLink.link : null;
}

export async function updateSettings(groupLinks: IGroupLink[], payonairePurchaseLink: string) {
  await connectDB();

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({ groupLinks, payonairePurchaseLink });
  } else {
    settings.groupLinks = groupLinks;
    settings.payonairePurchaseLink = payonairePurchaseLink;
    await settings.save();
  }

  return JSON.parse(JSON.stringify(settings));
}
