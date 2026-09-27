import mongoose, { Schema } from 'mongoose';

export interface ICustomerDocument {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  province?: string;
  district?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  status: 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE';
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, required: true, index: true, trim: true },
    address: { type: String, required: true },
    province: String,
    district: String,
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    lastOrderDate: Date,
    status: { type: String, enum: ['VIP', 'REGULAR', 'NEW', 'INACTIVE'], default: 'NEW' },
    tags: { type: [String], default: [] },
    notes: String,
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ totalSpent: -1 });

export const CustomerModel = mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);
