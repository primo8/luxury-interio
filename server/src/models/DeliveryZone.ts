import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryZoneDocument extends Document {
  id: string;
  name: string;
  region: string;
  districts: string[];
  fee: number;
  freeDeliveryThreshold?: number;
  estimatedDays: string;
  whiteGloveAvailable: boolean;
  isActive: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryZoneSchema = new Schema<IDeliveryZoneDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    region: { type: String, required: true },
    districts: { type: [String], default: [] },
    fee: { type: Number, required: true, min: 0 },
    freeDeliveryThreshold: Number,
    estimatedDays: { type: String, required: true },
    whiteGloveAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const DeliveryZoneModel =
  mongoose.models.DeliveryZone || mongoose.model<IDeliveryZoneDocument>('DeliveryZone', DeliveryZoneSchema);
