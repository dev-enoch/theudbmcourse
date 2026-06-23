import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  campaignId?: string; // If tied to a specific campaign
  type: "campaign" | "reengagement" | "lesson_completion" | "course_completion" | "other";
  recipientEmail: string;
  subject: string;
  sentAt: Date;
  status: "sent" | "failed";
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    campaignId: { type: String },
    type: {
      type: String,
      enum: ["campaign", "reengagement", "lesson_completion", "course_completion", "other"],
      required: true,
    },
    recipientEmail: { type: String, required: true },
    subject: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    error: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
