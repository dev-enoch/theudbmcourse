export type GroupLinkConfig = {
  courseId: string;
  courseName: string;
  link: string;
  enabled: boolean;
};

export type AppConfigType = {
  siteTitle: string;
  description: string;
  supportEmail: string;
  supportWhatsApp: string;
  payonairePurchaseLink: string;
  emailFrom: string;
  emailDomain: string;
  adminEmailPlaceholder: string;
  defaultGroupLinks: GroupLinkConfig[];
};

export const AppConfig: AppConfigType = {
  // Branding
  siteTitle: "The UBDM Course",
  description: "An affiliate marketing course platform.",

  // Support & Contact
  supportEmail: "support@theubdmcourse.online",
  supportWhatsApp: "https://wa.me/2349038633816",

  // E-Commerce
  payonairePurchaseLink: "https://payonaire.com",

  // Email Configuration (Resend)
  emailFrom: "UBDM Support <support@theubdmcourse.online>",
  emailDomain: "theubdmcourse.online",

  // Admin Seed Account
  adminEmailPlaceholder: "admin@theubdmcourse.online",

  // Default Group Links (for Database Seeding)
  defaultGroupLinks: [
    {
      courseId: "ha-tiktok-ads",
      courseName: "TikTok Ads Course",
      link: "https://chat.whatsapp.com/C2GTedPcLtzIcDbi5cXHhV",
      enabled: true,
    },
  ],
};
