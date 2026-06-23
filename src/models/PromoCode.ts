import mongoose, { Schema, Document } from "mongoose";

export interface IPromoCode extends Document {
  code: string;
  discountPercentage: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    maxUses: { type: Number, default: 0 }, // 0 means unlimited
    currentUses: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.PromoCode ||
  mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);
