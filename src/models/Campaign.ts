import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  subject: string;
  body: string;
  audience: "all" | "active" | "inactive";
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledAt?: Date;
  sentAt?: Date;
  sentCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    audience: {
      type: String,
      enum: ["all", "active", "inactive"],
      default: "all",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "failed"],
      default: "draft",
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    sentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);
