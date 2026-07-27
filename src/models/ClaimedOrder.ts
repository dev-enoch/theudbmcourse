import mongoose, { Schema, Document } from "mongoose";

export interface IClaimedOrder extends Document {
  orderId: string;
  email: string;
  languagePreference?: "ha" | "en";
  createdAt?: Date;
  updatedAt?: Date;
}

const ClaimedOrderSchema = new Schema<IClaimedOrder>(
  {
    orderId: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    languagePreference: {
      type: String,
      enum: ["ha", "en"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ClaimedOrder ||
  mongoose.model<IClaimedOrder>("ClaimedOrder", ClaimedOrderSchema);
