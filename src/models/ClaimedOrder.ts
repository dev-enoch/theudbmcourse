import mongoose, { Schema, Document } from "mongoose";

export interface IResetRecord {
  timestamp: Date;
  previousDeviceKey: string;
}

export interface IAccessRecord {
  timestamp: Date;
  deviceKey: string;
  ip?: string;
}

export interface IClaimedOrder extends Document {
  orderId: string;
  email: string;
  deviceKey: string;
  resetHistory: IResetRecord[];
  accessHistory: IAccessRecord[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ResetRecordSchema = new Schema<IResetRecord>({
  timestamp: { type: Date, required: true },
  previousDeviceKey: { type: String, required: true },
});

const AccessRecordSchema = new Schema<IAccessRecord>({
  timestamp: { type: Date, required: true },
  deviceKey: { type: String, required: true },
  ip: { type: String },
});

const ClaimedOrderSchema = new Schema<IClaimedOrder>(
  {
    orderId: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    deviceKey: { type: String, required: true },
    resetHistory: { type: [ResetRecordSchema], default: [] },
    accessHistory: { type: [AccessRecordSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ClaimedOrder ||
  mongoose.model<IClaimedOrder>("ClaimedOrder", ClaimedOrderSchema);
