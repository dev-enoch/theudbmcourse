import mongoose, { Schema, Document } from "mongoose";

export interface IGroupLink {
  courseId: string;
  courseName: string;
  link: string;
  enabled: boolean;
}

export interface ISettings extends Document {
  groupLinks: IGroupLink[];
  payonairePurchaseLink: string;
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
      default: "https://payonaire.com",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
