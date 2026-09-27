import mongoose, { Schema } from 'mongoose';

export interface IInventoryAdjustmentDocument {
  id: string;
  productId: string;
  sku: string;
  quantityChange: number;
  type: 'RESTOCK' | 'SALE' | 'DAMAGE' | 'RETURN' | 'MANUAL_ADJUSTMENT';
  reason: string;
  adminId: string;
  adminName: string;
  previousStock: number;
  newStock: number;
  createdAt: Date;
}

const InventoryAdjustmentSchema = new Schema<IInventoryAdjustmentDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    sku: { type: String, required: true, index: true },
    quantityChange: { type: Number, required: true },
    type: {
      type: String,
      enum: ['RESTOCK', 'SALE', 'DAMAGE', 'RETURN', 'MANUAL_ADJUSTMENT'],
      required: true,
    },
    reason: { type: String, required: true },
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

InventoryAdjustmentSchema.index({ createdAt: -1 });

export const InventoryAdjustmentModel =
  mongoose.models.InventoryAdjustment ||
  mongoose.model<IInventoryAdjustmentDocument>('InventoryAdjustment', InventoryAdjustmentSchema);
