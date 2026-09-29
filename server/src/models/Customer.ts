import mongoose, { Schema } from 'mongoose';

export interface ICustomerAddress {
  id: string;
  label?: string; // e.g. 'Home', 'Office', 'Villa'
  fullName: string;
  phone: string;
  streetAddress: string;
  province?: string;
  district?: string;
  sector?: string;
  isDefault?: boolean;
  notes?: string;
  createdAt?: Date;
}

export interface ICustomerDocument {
  id: string;
  firebaseUid?: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  authProvider?: string;
  emailVerified?: boolean;
  address?: string;
  province?: string;
  district?: string;
  addresses: ICustomerAddress[];
  wishlist: string[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  lastLoginAt?: Date;
  status: 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE';
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerAddressSchema = new Schema<ICustomerAddress>(
  {
    id: { type: String, required: true },
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    province: String,
    district: String,
    sector: String,
    isDefault: { type: Boolean, default: false },
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    firebaseUid: { type: String, index: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    photoURL: { type: String, default: '' },
    authProvider: { type: String, default: 'password' },
    emailVerified: { type: Boolean, default: false },
    address: { type: String, default: '' },
    province: { type: String, default: '' },
    district: { type: String, default: '' },
    addresses: { type: [CustomerAddressSchema], default: [] },
    wishlist: { type: [String], default: [] },
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    lastOrderDate: Date,
    lastLoginAt: Date,
    status: { type: String, enum: ['VIP', 'REGULAR', 'NEW', 'INACTIVE'], default: 'NEW' },
    tags: { type: [String], default: ['Storefront Customer'] },
    notes: String,
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ firebaseUid: 1 });

export const CustomerModel = mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);
