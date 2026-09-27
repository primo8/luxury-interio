import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsDocument extends Document {
  key: string;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  autoApproveReviews: boolean;
  mtnEnvironment: string;
  mtnTargetEnvironment: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'GLOBAL_SETTINGS' },
    storeName: { type: String, default: 'FURNITURA Luxury Living' },
    contactEmail: { type: String, default: 'concierge@furnitura.rw' },
    contactPhone: { type: String, default: '+250 788 123 456' },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0.18 },
    freeShippingThreshold: { type: Number, default: 500 },
    maintenanceMode: { type: Boolean, default: false },
    allowGuestCheckout: { type: Boolean, default: true },
    autoApproveReviews: { type: Boolean, default: false },
    mtnEnvironment: { type: String, default: 'SANDBOX' },
    mtnTargetEnvironment: { type: String, default: 'sandbox' },
  },
  {
    timestamps: true,
  }
);

export const SettingsModel = mongoose.models.Settings || mongoose.model<ISettingsDocument>('Settings', SettingsSchema);
