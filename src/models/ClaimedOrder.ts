import mongoose, { Schema, Document } from "mongoose";

export interface IClaimedOrder extends Document {
  orderId: string;
  email: string;
  deviceKey: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ClaimedOrderSchema = new Schema<IClaimedOrder>(
  {
    orderId: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    deviceKey: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ClaimedOrder ||
  mongoose.model<IClaimedOrder>("ClaimedOrder", ClaimedOrderSchema);
