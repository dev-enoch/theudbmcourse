import mongoose, { Schema, Document } from "mongoose";

export interface IUserProgress {
  topicId: string;
  completed: boolean;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  role: "admin" | "user";
  progress: IUserProgress[];
  active?: boolean;
  adminNotes?: string;
  suspensionReason?: string;
  suspendedUntil?: Date;
  revokedCourses?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProgressSchema = new Schema<IUserProgress>({
  topicId: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    active: { type: Boolean, default: true },

    // CRM and Suspension Fields
    adminNotes: { type: String, default: "" },
    suspensionReason: { type: String, default: "" },
    suspendedUntil: { type: Date },
    revokedCourses: { type: [String], default: [] },

    // ✔ added progress to the DB schema
    progress: {
      type: [ProgressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
