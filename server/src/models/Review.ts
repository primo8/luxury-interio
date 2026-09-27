import mongoose, { Schema } from 'mongoose';

export interface IReviewDocument {
  id: string;
  productId: string;
  productName: string;
  customerId?: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'FLAGGED';
  helpfulVotes: number;
  conciergeReply?: {
    text: string;
    repliedAt: Date;
    repliedBy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    customerId: String,
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, required: true },
    verifiedBuyer: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED', 'FLAGGED'],
      default: 'APPROVED',
      index: true,
    },
    helpfulVotes: { type: Number, default: 0 },
    conciergeReply: {
      text: String,
      repliedAt: Date,
      repliedBy: String,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ productId: 1, status: 1 });

export const ReviewModel = mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);
