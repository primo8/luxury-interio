import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscountDocument extends Document {
  id: string;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  startDate: Date;
  endDate: Date;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscountDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
    value: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    perCustomerLimit: { type: Number, default: 1, min: 1 },
    applicableCategories: { type: [String], default: [] },
    applicableProducts: { type: [String], default: [] },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'EXPIRED'], default: 'ACTIVE', index: true },
  },
  {
    timestamps: true,
  }
);

DiscountSchema.index({ code: 1, status: 1 });

export const DiscountModel = mongoose.models.Discount || mongoose.model<IDiscountDocument>('Discount', DiscountSchema);
