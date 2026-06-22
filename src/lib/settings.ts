"use server";

import { connectDB } from "./mongoose";
import Settings from "@/models/Settings";
import { IGroupLink } from "@/models/Settings";

export async function getSettings() {
  try {
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
        supportWhatsApp: "https://wa.me/2349038633816",
        supportEmail: "support@bag.com",
        siteTitle: "Blueprint to Automated Gains (BAG)",
        announcementBanner: "",
        announcementEnabled: false,
      });
    }

    // Ensure default link exists in return object if not already set
    if (!settings.payonairePurchaseLink) {
      settings.payonairePurchaseLink = "https://payonaire.com";
      await settings.save();
    }

    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.warn("Could not connect to DB for settings, returning defaults:", error);
    return {
      groupLinks: [],
      payonairePurchaseLink: "https://payonaire.com",
      supportWhatsApp: "https://wa.me/2349038633816",
      supportEmail: "support@bag.com",
      siteTitle: "Blueprint to Automated Gains (BAG)",
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

export async function updateSettings(
  groupLinks: IGroupLink[],
  payonairePurchaseLink: string,
  supportWhatsApp: string,
  supportEmail: string,
  siteTitle: string,
  announcementBanner: string,
  announcementEnabled: boolean
) {
  await connectDB();

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      groupLinks,
      payonairePurchaseLink,
      supportWhatsApp,
      supportEmail,
      siteTitle,
      announcementBanner,
      announcementEnabled,
    });
  } else {
    settings.groupLinks = groupLinks;
    settings.payonairePurchaseLink = payonairePurchaseLink;
    settings.supportWhatsApp = supportWhatsApp;
    settings.supportEmail = supportEmail;
    settings.siteTitle = siteTitle;
    settings.announcementBanner = announcementBanner;
    settings.announcementEnabled = announcementEnabled;
    await settings.save();
  }

  return JSON.parse(JSON.stringify(settings));
}
