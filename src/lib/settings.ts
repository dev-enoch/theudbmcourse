"use server";

import { connectDB } from "./mongoose";
import Settings from "@/models/Settings";
import { IGroupLink, ISettings } from "@/models/Settings";
import { AppConfig } from "@/app.config";

export async function getSettings() {
  try {
    await connectDB();

    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        groupLinks: AppConfig.defaultGroupLinks,
        payonairePurchaseLink: AppConfig.payonairePurchaseLink,
        supportWhatsApp: AppConfig.supportWhatsApp,
        supportEmail: AppConfig.supportEmail,
        siteTitle: AppConfig.siteTitle,
        announcementBanner: "",
        announcementEnabled: false,
      });
    }

    // Ensure default link exists in return object if not already set
    if (!settings.payonairePurchaseLink) {
      settings.payonairePurchaseLink = AppConfig.payonairePurchaseLink;
      await settings.save();
    }

    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.warn("Could not connect to DB for settings, returning defaults:", error);
    return {
      groupLinks: [],
      payonairePurchaseLink: AppConfig.payonairePurchaseLink,
      supportWhatsApp: AppConfig.supportWhatsApp,
      supportEmail: AppConfig.supportEmail,
      siteTitle: AppConfig.siteTitle,
      announcementBanner: "",
      announcementEnabled: false,
    };
  }
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

export async function updateSettings(updates: Partial<ISettings>) {
  await connectDB();

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      groupLinks: updates.groupLinks || [],
      payonairePurchaseLink: updates.payonairePurchaseLink || AppConfig.payonairePurchaseLink,
      supportWhatsApp: updates.supportWhatsApp || AppConfig.supportWhatsApp,
      supportEmail: updates.supportEmail || AppConfig.supportEmail,
      siteTitle: updates.siteTitle || AppConfig.siteTitle,
      announcementBanner: updates.announcementBanner || "",
      announcementEnabled: updates.announcementEnabled || false,
    });
  } else {
    if (updates.groupLinks !== undefined) settings.groupLinks = updates.groupLinks;
    if (updates.payonairePurchaseLink !== undefined) settings.payonairePurchaseLink = updates.payonairePurchaseLink;
    if (updates.supportWhatsApp !== undefined) settings.supportWhatsApp = updates.supportWhatsApp;
    if (updates.supportEmail !== undefined) settings.supportEmail = updates.supportEmail;
    if (updates.siteTitle !== undefined) settings.siteTitle = updates.siteTitle;
    if (updates.announcementBanner !== undefined) settings.announcementBanner = updates.announcementBanner;
    if (updates.announcementEnabled !== undefined) settings.announcementEnabled = updates.announcementEnabled;
    await settings.save();
  }

  return JSON.parse(JSON.stringify(settings));
}
