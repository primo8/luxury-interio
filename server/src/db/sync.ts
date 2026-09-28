import { isDatabaseConnected } from '../config/database';
import { db } from './memoryDb';
import { ProductModel } from '../models/Product';
import { OrderModel } from '../models/Order';
import { PaymentModel } from '../models/Payment';
import { CustomerModel } from '../models/Customer';
import { DiscountModel } from '../models/Discount';
import { CategoryModel } from '../models/Category';
import { DeliveryZoneModel } from '../models/DeliveryZone';
import { ReviewModel } from '../models/Review';
import { StaffModel } from '../models/Staff';
import { NotificationModel } from '../models/Notification';
import { AuditLogModel } from '../models/AuditLog';
import { CMSModel } from '../models/CMS';
import { SettingsModel } from '../models/Settings';

/**
 * Synchronizes in-memory cache with MongoDB Atlas on startup and ensures MongoDB is the single source of truth.
 */
export async function syncDatabaseWithMongo(): Promise<void> {
  if (!isDatabaseConnected()) {
    console.log('ℹ️ [DB Sync] Running in local in-memory mode.');
    return;
  }

  try {
    const productCount = await ProductModel.countDocuments();

    if (productCount === 0) {
      console.log('🌱 [DB Sync] MongoDB Atlas is fresh. Seeding initial FURNITURA dataset into Atlas...');

      // Seed products
      const products = Array.from(db.products.values()).map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.subtitle,
        slug: p.slug || p.id,
        sku: p.sku,
        brand: p.brand || 'FURNITURA Atelier',
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        discountPercent: p.discountPercent,
        currency: 'USD',
        room: p.room,
        isPopular: p.isPopular,
        isNewArrival: p.isNewArrival,
        rating: p.rating,
        reviewCount: p.reviewCount || 0,
        description: p.description,
        image: p.image,
        images: p.images || [p.image],
        galleryImages: p.galleryImages || [p.image],
        colors: p.colors,
        stock: p.stockCount,
        stockCount: p.stockCount,
        inStock: p.inStock,
        threeModelType: p.threeModelType,
        status: 'ACTIVE',
      }));
      if (products.length > 0) await ProductModel.insertMany(products as any);

      // Seed categories
      const categories = Array.from(db.categories.values()).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        roomKey: c.roomKey,
        description: c.description,
        image: c.image,
        displayOrder: c.displayOrder,
        active: c.active,
        isActive: c.active,
      }));
      if (categories.length > 0) await CategoryModel.insertMany(categories as any);

      // Seed discounts
      const discounts = Array.from(db.discounts.values()).map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        discountType: d.type === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        value: d.value,
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        minOrderValue: d.minOrderValue,
        maxDiscount: d.maxDiscount,
        usageLimit: d.usageLimit,
        usageCount: d.usageCount,
        status: d.status,
      }));
      if (discounts.length > 0) await DiscountModel.insertMany(discounts as any);

      // Seed delivery zones
      const zones = Array.from(db.deliveryZones.values()).map((z) => ({
        id: z.id,
        name: z.name,
        region: z.region,
        districts: z.districts,
        fee: z.fee,
        freeDeliveryThreshold: z.freeShippingThreshold,
        estimatedDays: z.estimatedDays,
        whiteGloveAvailable: z.whiteGloveAvailable,
        isActive: z.active,
        description: z.description,
      }));
      if (zones.length > 0) await DeliveryZoneModel.insertMany(zones as any);

      // Seed staff
      const staffList = Array.from(db.staff.values()).map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        permissions: s.permissions,
        department: s.department || 'OPERATIONS',
        isActive: s.active,
      }));
      if (staffList.length > 0) await StaffModel.insertMany(staffList as any);

      console.log('✅ [DB Sync] Initial MongoDB Atlas dataset successfully seeded.');
    } else {
      console.log(`📦 [DB Sync] Loading existing data from MongoDB Atlas (${productCount} products found)...`);

      // 1. Load Products
      const mongoProducts = await ProductModel.find({ status: { $ne: 'ARCHIVED' } }).lean();
      if (mongoProducts.length > 0) {
        db.products.clear();
        for (const p of mongoProducts as any[]) {
          db.products.set(p.id, {
            id: p.id,
            sku: p.sku,
            name: p.name,
            subtitle: p.subtitle || '',
            category: p.category,
            room: p.room,
            price: p.price,
            originalPrice: p.originalPrice,
            discountPercent: p.discountPercent,
            rating: p.rating || 5,
            reviewCount: p.reviewCount || 0,
            reviewsCount: p.reviewCount || 0,
            image: p.image || (p.images && p.images[0]) || '/hero-chair.jpg',
            images: p.images || [],
            galleryImages: p.galleryImages || p.images || [],
            description: p.description || '',
            longDescription: p.longDescription || '',
            dimensions: p.dimensions,
            materials: p.materials,
            colors: p.colors || [],
            inStock: (p.stockCount ?? p.stock ?? 0) > 0,
            stockCount: p.stockCount ?? p.stock ?? 0,
            isNew: p.isNewArrival || p.isNew,
            isBestSeller: p.isPopular || p.isBestSeller,
            isDealOfTheWeek: p.isDealOfTheWeek,
            isFeatured: p.isFeatured,
            badge: p.badge,
            threeModelType: p.threeModelType || 'chair',
            slug: p.slug,
            brand: p.brand,
          });
        }
      }

      // 2. Load Orders
      const mongoOrders = await OrderModel.find().lean();
      if (mongoOrders.length > 0) {
        for (const o of mongoOrders as any[]) {
          db.orders.set(o.id || o.orderNumber, {
            id: o.id || o.orderNumber,
            orderNumber: o.orderNumber,
            items: (o.items || []).map((i: any) => ({
              productId: i.productId,
              name: i.productName || i.name,
              sku: i.sku,
              price: i.unitPrice ?? i.price,
              originalPrice: i.originalPrice,
              quantity: i.quantity,
              colorName: i.colorName,
              image: i.image,
              discountAmount: i.discountAmount,
              subtotal: i.subtotal,
            })),
            subtotal: o.subtotal,
            discountAmount: o.discountAmount || 0,
            couponCode: o.appliedDiscountCode || o.couponCode,
            shippingFee: o.deliveryFee ?? o.shippingFee ?? 0,
            total: o.total,
            currency: o.currency || 'USD',
            customer: {
              fullName: o.customerName || o.customer?.fullName || '',
              email: o.customerEmail || o.customer?.email || '',
              phone: o.customerPhone || o.customer?.phone || '',
              province: o.deliveryAddress?.province || o.customer?.province,
              district: o.deliveryAddress?.district || o.customer?.district,
              sector: o.deliveryAddress?.sector || o.customer?.sector,
              address: o.deliveryAddress?.streetAddress || o.customer?.address || '',
              notes: o.deliveryAddress?.notes || o.customer?.notes,
            },
            deliveryZoneId: o.deliveryZoneId,
            deliveryZoneName: o.deliveryZoneName,
            orderStatus: o.orderStatus,
            paymentMethod: o.paymentMethod || 'MTN_MOMO',
            paymentStatus: o.paymentStatus || 'PENDING',
            paymentReferenceId: o.paymentId || o.paymentReferenceId,
            timeline: (o.timeline || []).map((t: any) => ({
              id: t.id || `t-${Date.now()}`,
              timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
              actor: t.actor || 'Staff',
              event: t.note || t.event || 'Status update',
              status: t.status,
            })),
            createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
          });
        }
      }

      // 3. Load Discounts
      const mongoDiscounts = await DiscountModel.find({ status: { $ne: 'ARCHIVED' } }).lean();
      if (mongoDiscounts.length > 0) {
        for (const d of mongoDiscounts as any[]) {
          db.discounts.set(d.id, {
            id: d.id,
            name: d.name || d.code,
            code: d.code,
            type: d.discountType === 'PERCENTAGE' ? 'percentage' : 'fixed',
            value: d.value,
            startDate: d.startDate ? new Date(d.startDate).toISOString() : new Date().toISOString(),
            endDate: d.endDate ? new Date(d.endDate).toISOString() : new Date().toISOString(),
            minOrderValue: d.minOrderValue || 0,
            maxDiscount: d.maxDiscount,
            usageLimit: d.usageLimit || 100,
            perCustomerLimit: d.perCustomerLimit || 1,
            usageCount: d.usageCount || 0,
            status: d.status || 'ACTIVE',
            createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
          });
        }
      }

      // 4. Load Customers
      const mongoCustomers = await CustomerModel.find().lean();
      if (mongoCustomers.length > 0) {
        for (const c of mongoCustomers as any[]) {
          db.customers.set(c.id, {
            id: c.id,
            fullName: c.fullName,
            email: c.email,
            phone: c.phone,
            province: c.province,
            district: c.district,
            sector: c.sector,
            address: c.address,
            notes: c.notes,
            tags: c.tags || [],
            totalOrders: c.totalOrders || 0,
            totalSpent: c.totalSpent || 0,
            lastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate).toISOString() : undefined,
            status: c.status || 'ACTIVE',
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
          });
        }
      }

      // 5. Load Delivery Zones
      const mongoZones = await DeliveryZoneModel.find({ isActive: true }).lean();
      if (mongoZones.length > 0) {
        for (const z of mongoZones as any[]) {
          db.deliveryZones.set(z.id, {
            id: z.id,
            name: z.name,
            region: z.region,
            districts: z.districts || [],
            fee: z.fee,
            currency: 'USD',
            estimatedDays: z.estimatedDays || '2-3 Business Days',
            freeShippingThreshold: z.freeDeliveryThreshold ?? 1000,
            active: z.isActive ?? true,
            whiteGloveAvailable: z.whiteGloveAvailable ?? true,
            whiteGloveFee: z.whiteGloveFee || 50,
            description: z.description || '',
          });
        }
      }

      // 6. Ensure Super Admins from initial staff exist and load all active staff
      for (const s of Array.from(db.staff.values())) {
        if (s.role === 'SUPER_ADMIN') {
          await StaffModel.findOneAndUpdate(
            { email: s.email.toLowerCase() },
            {
              $setOnInsert: {
                id: s.id,
                name: s.name,
                email: s.email.toLowerCase(),
                role: s.role,
                permissions: s.permissions,
                department: s.department || 'EXECUTIVE',
                isActive: true,
              },
            },
            { upsert: true, new: true }
          );
        }
      }

      const mongoStaff = await StaffModel.find({ isActive: true }).lean();
      if (mongoStaff.length > 0) {
        for (const s of mongoStaff as any[]) {
          db.staff.set(s.id, {
            id: s.id,
            name: s.name,
            email: s.email,
            role: s.role,
            permissions: s.permissions || [],
            active: s.isActive ?? true,
            department: s.department,
            firebaseUid: s.firebaseUid,
            createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
          });
        }
      }

      console.log(`✅ [DB Sync] MongoDB Atlas state synchronized: ${db.products.size} products, ${db.orders.size} orders, ${db.discounts.size} discounts, ${db.customers.size} customers, ${db.staff.size} staff.`);
    }
  } catch (err: any) {
    console.error('❌ [DB Sync] Synchronization with MongoDB failed:', err.message || err);
  }
}
