import mongoose, { Schema, Document } from 'mongoose';

export type StaffRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ORDER_MANAGER'
  | 'PRODUCT_MANAGER'
  | 'FINANCE_MANAGER'
  | 'CONTENT_MANAGER'
  | 'SUPPORT_AGENT';

export interface IStaffDocument extends Document {
  id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  role: StaffRole;
  permissions: string[];
  department?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaffDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    firebaseUid: { type: String, index: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: [
        'SUPER_ADMIN',
        'ADMIN',
        'ORDER_MANAGER',
        'PRODUCT_MANAGER',
        'FINANCE_MANAGER',
        'CONTENT_MANAGER',
        'SUPPORT_AGENT',
      ],
      required: true,
      default: 'ADMIN',
    },
    permissions: { type: [String], default: [] },
    department: String,
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

export const StaffModel = mongoose.models.Staff || mongoose.model<IStaffDocument>('Staff', StaffSchema);
