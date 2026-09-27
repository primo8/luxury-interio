import mongoose, { Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedColor?: {
    name: string;
    hex: string;
  };
  image?: string;
}

export interface IOrderTimelineEvent {
  status: string;
  timestamp: Date;
  actor: string;
  note?: string;
}

export interface IOrderDocument {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: {
    province?: string;
    district?: string;
    sector?: string;
    streetAddress: string;
    notes?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  appliedDiscountCode?: string;
  tax: number;
  total: number;
  currency: string;
  orderStatus:
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROCESSING'
    | 'READY_FOR_DELIVERY'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';
  paymentStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'REFUNDED' | 'EXPIRED';
  paymentId?: string;
  mtnReferenceId?: string;
  deliveryZoneId?: string;
  timeline: IOrderTimelineEvent[];
  notes?: string[];
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    selectedColor: {
      name: String,
      hex: String,
    },
    image: String,
  },
  { _id: false }
);

const TimelineEventSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String, default: 'SYSTEM' },
    note: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true, uppercase: true },
    customerId: { type: String, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true, index: true },
    deliveryAddress: {
      province: String,
      district: String,
      sector: String,
      streetAddress: { type: String, required: true },
      notes: String,
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    appliedDiscountCode: String,
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    orderStatus: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'READY_FOR_DELIVERY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESSFUL', 'FAILED', 'REJECTED', 'REFUNDED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    paymentId: { type: String, index: true },
    mtnReferenceId: { type: String, index: true },
    deliveryZoneId: String,
    timeline: { type: [TimelineEventSchema], default: [] },
    notes: { type: [String], default: [] },
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

export const OrderModel = mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
