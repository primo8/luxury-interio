import mongoose, { Schema } from 'mongoose';

export interface IColorOption {
  name: string;
  hex: string;
  threeColor: number;
}

export interface IProductDocument {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  cost?: number;
  currency: string;
  room: string;
  isPopular?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription?: string;
  images: string[];
  colors: IColorOption[];
  model3dUrl?: string;
  defaultMaterial?: string;
  lightingPreset?: string;
  is3dEnabled?: boolean;
  stock: number;
  lowStockThreshold?: number;
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  materials?: string[];
  finish?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ColorOptionSchema = new Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  threeColor: { type: Number, required: true },
}, { _id: false });

const ProductSchema = new Schema<IProductDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    brand: { type: String, default: 'FURNITURA Atelier' },
    category: { type: String, required: true, index: true },
    subCategory: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    cost: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    room: { type: String, required: true, index: true },
    isPopular: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    description: { type: String, required: true },
    shortDescription: { type: String },
    images: { type: [String], default: [] },
    colors: { type: [ColorOptionSchema], default: [] },
    model3dUrl: { type: String },
    defaultMaterial: { type: String, default: 'velvet' },
    lightingPreset: { type: String, default: 'warm_luxury' },
    is3dEnabled: { type: Boolean, default: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      weight: Number,
    },
    materials: [String],
    finish: String,
    seoTitle: String,
    seoDescription: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ room: 1, status: 1 });
ProductSchema.index({ price: 1 });

export const ProductModel = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
