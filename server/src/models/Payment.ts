import mongoose, { Schema } from 'mongoose';

export interface IPaymentEvent {
  status: string;
  timestamp: Date;
  details?: string;
  source: 'GATEWAY_CALLBACK' | 'STATUS_POLL' | 'MANUAL_RECONCILE' | 'SYSTEM';
}

export interface IPaymentDocument {
  id: string;
  paymentId: string;
  orderId: string;
  mtnReferenceId: string;
  externalId?: string;
  amount: number;
  currency: string;
  phoneNumberMasked: string;
  provider: 'MTN_MOMO' | 'CARD' | 'BANK_TRANSFER';
  environment: 'SANDBOX' | 'PRODUCTION';
  status: 'INITIATING' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'EXPIRED' | 'REFUNDED' | 'UNKNOWN';
  failureReason?: string;
  rawResponse?: any;
  events: IPaymentEvent[];
  lastCheckedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentEventSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: String,
    source: { type: String, default: 'SYSTEM' },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    mtnReferenceId: { type: String, required: true, unique: true, index: true },
    externalId: String,
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'RWF' },
    phoneNumberMasked: { type: String, required: true },
    provider: { type: String, enum: ['MTN_MOMO', 'CARD', 'BANK_TRANSFER'], default: 'MTN_MOMO' },
    environment: { type: String, enum: ['SANDBOX', 'PRODUCTION'], default: 'SANDBOX' },
    status: {
      type: String,
      enum: ['INITIATING', 'PENDING', 'SUCCESSFUL', 'FAILED', 'REJECTED', 'EXPIRED', 'REFUNDED', 'UNKNOWN'],
      default: 'PENDING',
      index: true,
    },
    failureReason: String,
    rawResponse: Schema.Types.Mixed,
    events: { type: [PaymentEventSchema], default: [] },
    lastCheckedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
