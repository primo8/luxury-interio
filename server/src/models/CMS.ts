import mongoose, { Schema, Document } from 'mongoose';

export interface ICMSDocument extends Document {
  key: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroPrimaryCtaText: string;
  heroSecondaryCtaText: string;
  heroFeaturedImage: string;
  announcementText: string;
  announcementActive: boolean;
  dealOfTheWeekTitle: string;
  dealOfTheWeekSubtitle: string;
  dealOfTheWeekProductId: string;
  dealOfTheWeekDiscount: string;
  dealOfTheWeekEndsAt: Date;
  updatedAt: Date;
}

const CMSSchema = new Schema<ICMSDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'STOREFRONT_HOME' },
    heroTitle: { type: String, default: 'Architectural Comfort for Modern Sanctuaries' },
    heroSubtitle: {
      type: String,
      default: 'Crafted with sustainably sourced French oak, Italian bouclé, and structural brass.',
    },
    heroBadge: { type: String, default: 'AUTUMN LOOKBOOK 2026' },
    heroPrimaryCtaText: { type: String, default: 'Explore Curated Suites' },
    heroSecondaryCtaText: { type: String, default: 'Experience 3D Atelier' },
    heroFeaturedImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=85',
    },
    announcementText: {
      type: String,
      default: 'Complimentary White-Glove Kigali Delivery on orders above $500 • MoMo Sandbox Active',
    },
    announcementActive: { type: Boolean, default: true },
    dealOfTheWeekTitle: { type: String, default: 'The Aurelia Velvet Chaise' },
    dealOfTheWeekSubtitle: { type: String, default: 'Sculptural velvet lounge with brushed champagne brass base.' },
    dealOfTheWeekProductId: { type: String, default: 'prod-1' },
    dealOfTheWeekDiscount: { type: String, default: '25% OFF' },
    dealOfTheWeekEndsAt: { type: Date, default: () => new Date(Date.now() + 86400000 * 5) },
  },
  {
    timestamps: true,
  }
);

export const CMSModel = mongoose.models.CMS || mongoose.model<ICMSDocument>('CMS', CMSSchema);
