import mongoose, { Schema, Document } from "mongoose";
import { AppConfig } from "@/app.config";

export interface IGroupLink {
  courseId: string;
  courseName: string;
  link: string;
  enabled: boolean;
}

export interface ISettings extends Document {
  groupLinks: IGroupLink[];
  payonairePurchaseLink: string;
  supportWhatsApp: string;
  supportEmail: string;
  siteTitle: string;
  announcementBanner: string;
  announcementEnabled: boolean;
  // Marketing & Automated Triggers
  lessonCompletionEmailsEnabled: boolean;
  courseCompletionEmailsEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const GroupLinkSchema = new Schema<IGroupLink>({
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  link: { type: String, required: true },
  enabled: { type: Boolean, default: true },
});

const SettingsSchema = new Schema<ISettings>(
  {
    groupLinks: {
      type: [GroupLinkSchema],
      default: [],
    },
    payonairePurchaseLink: {
      type: String,
      default: AppConfig.payonairePurchaseLink,
    },
    supportWhatsApp: {
      type: String,
      default: AppConfig.supportWhatsApp,
    },
    supportEmail: {
      type: String,
      default: AppConfig.supportEmail,
    },
    siteTitle: {
      type: String,
      default: AppConfig.siteTitle,
    },
    announcementBanner: {
      type: String,
      default: "",
    },
    announcementEnabled: {
      type: Boolean,
      default: false,
    },
    lessonCompletionEmailsEnabled: {
      type: Boolean,
      default: false,
    },
    courseCompletionEmailsEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
