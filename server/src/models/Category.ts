import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);
