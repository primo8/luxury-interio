import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, disconnectDatabase } from '../config/database';
import { db } from '../db/memoryDb';
import {
  ProductModel,
  OrderModel,
  PaymentModel,
  CustomerModel,
  DiscountModel,
  CategoryModel,
  DeliveryZoneModel,
  StaffModel,
  NotificationModel,
  AuditLogModel,
  CMSModel,
  SettingsModel,
} from '../models';

export async function seedDatabase(forceOverwrite = false) {
  console.log('🚀 [Seed] Starting MongoDB Atlas data synchronization...');
  const connected = await connectDatabase();

  if (!connected) {
    console.error('❌ [Seed] Cannot connect to MongoDB Atlas. Ensure MONGODB_URI is set.');
    return;
  }

  try {
    // 1. Categories
    const existingCats = await CategoryModel.countDocuments();
    if (existingCats === 0 || forceOverwrite) {
      if (forceOverwrite) await CategoryModel.deleteMany({});
      const catDocs = Array.from(db.categories.values()).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        imageUrl: c.image,
        displayOrder: 0,
        isActive: true,
      }));
      await CategoryModel.insertMany(catDocs as any);
      console.log(`✅ [Seed] Inserted ${catDocs.length} Categories`);
    } else {
      console.log(`ℹ️ [Seed] Categories collection already contains ${existingCats} documents. Skipping.`);
    }

    // 2. Products
    const existingProducts = await ProductModel.countDocuments();
    if (existingProducts === 0 || forceOverwrite) {
      if (forceOverwrite) await ProductModel.deleteMany({});
      const productDocs = Array.from(db.products.values()).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        sku: p.sku,
        brand: 'FURNITURA Atelier',
        category: p.category,
        subCategory: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        currency: 'USD',
        room: p.room,
        isPopular: p.isPopular || false,
        isNewArrival: p.isNewArrival || false,
        rating: p.rating || 5.0,
        reviewCount: p.reviewCount || 0,
        description: p.description,
        images: p.images || (p.image ? [p.image] : []),
        colors: p.colors || [],
        model3dUrl: p.model3dUrl,
        defaultMaterial: 'velvet',
        lightingPreset: 'warm_luxury',
        is3dEnabled: Boolean(p.model3dUrl),
        stock: p.stockCount || 10,
        lowStockThreshold: 5,
        status: p.inStock ? 'ACTIVE' : 'OUT_OF_STOCK',
      }));
      await ProductModel.insertMany(productDocs as any);
      console.log(`✅ [Seed] Inserted ${productDocs.length} Products`);
    } else {
      console.log(`ℹ️ [Seed] Products collection already contains ${existingProducts} documents. Skipping.`);
    }

    // 3. Customers
    const existingCustomers = await CustomerModel.countDocuments();
    if (existingCustomers === 0 || forceOverwrite) {
      if (forceOverwrite) await CustomerModel.deleteMany({});
      const customerDocs = Array.from(db.customers.values()).map((c) => ({
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        address: c.address,
        province: c.province,
        district: c.district,
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        lastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate) : undefined,
        status: c.status === 'VIP' ? 'VIP' : 'REGULAR',
        tags: c.tags || [],
      }));
      await CustomerModel.insertMany(customerDocs as any);
      console.log(`✅ [Seed] Inserted ${customerDocs.length} Customers`);
    } else {
      console.log(`ℹ️ [Seed] Customers collection already contains ${existingCustomers} documents. Skipping.`);
    }

    // 4. Discounts
    const existingDiscounts = await DiscountModel.countDocuments();
    if (existingDiscounts === 0 || forceOverwrite) {
      if (forceOverwrite) await DiscountModel.deleteMany({});
      const discountDocs = Array.from(db.discounts.values()).map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name || d.description || d.code,
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
      await DiscountModel.insertMany(discountDocs as any);
      console.log(`✅ [Seed] Inserted ${discountDocs.length} Discounts`);
    } else {
      console.log(`ℹ️ [Seed] Discounts collection already contains ${existingDiscounts} documents. Skipping.`);
    }

    // 5. Delivery Zones
    const existingZones = await DeliveryZoneModel.countDocuments();
    if (existingZones === 0 || forceOverwrite) {
      if (forceOverwrite) await DeliveryZoneModel.deleteMany({});
      const zoneDocs = Array.from(db.deliveryZones.values()).map((z) => ({
        id: z.id,
        name: z.name,
        region: z.region,
        districts: z.districts,
        fee: z.fee,
        freeDeliveryThreshold: z.freeShippingThreshold,
        estimatedDays: z.estimatedDays,
        whiteGloveAvailable: z.whiteGloveIncluded ?? z.whiteGloveAvailable ?? true,
        isActive: true,
        description: z.description,
      }));
      await DeliveryZoneModel.insertMany(zoneDocs as any);
      console.log(`✅ [Seed] Inserted ${zoneDocs.length} Delivery Zones`);
    } else {
      console.log(`ℹ️ [Seed] Delivery Zones already contains ${existingZones} documents. Skipping.`);
    }

    // 6. Orders
    const existingOrders = await OrderModel.countDocuments();
    if (existingOrders === 0 || forceOverwrite) {
      if (forceOverwrite) await OrderModel.deleteMany({});
      const orderDocs = Array.from(db.orders.values()).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.fullName,
        customerEmail: o.customer.email,
        customerPhone: o.customer.phone,
        deliveryAddress: {
          province: o.customer.province,
          district: o.customer.district,
          sector: o.customer.sector,
          streetAddress: o.customer.address,
          notes: o.customer.notes,
        },
        items: o.items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.price,
          subtotal: i.subtotal,
          image: i.image,
        })),
        subtotal: o.subtotal,
        deliveryFee: o.shippingFee,
        discountAmount: o.discountAmount,
        appliedDiscountCode: o.couponCode,
        total: o.total,
        currency: o.currency,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        paymentId: o.paymentReferenceId,
        timeline: (o.timeline || []).map((t) => ({
          status: t.status || o.orderStatus,
          timestamp: new Date(t.timestamp),
          actor: t.actor,
          note: t.notes || t.event,
        })),
      }));
      await OrderModel.insertMany(orderDocs as any);
      console.log(`✅ [Seed] Inserted ${orderDocs.length} Orders`);
    } else {
      console.log(`ℹ️ [Seed] Orders collection already contains ${existingOrders} documents. Skipping.`);
    }

    // 7. Payments
    const existingPayments = await PaymentModel.countDocuments();
    if (existingPayments === 0 || forceOverwrite) {
      if (forceOverwrite) await PaymentModel.deleteMany({});
      const paymentDocs = Array.from(db.payments.values()).map((p) => ({
        id: p.id || p.paymentId,
        paymentId: p.paymentId,
        orderId: p.orderId,
        mtnReferenceId: p.mtnReferenceId,
        externalId: p.externalId,
        amount: p.amount,
        currency: p.currency,
        phoneNumberMasked: p.phoneNumberMasked,
        provider: 'MTN_MOMO',
        environment: 'SANDBOX',
        status: p.status,
        failureReason: p.failureReason,
        events: [
          {
            status: p.status,
            timestamp: new Date(p.createdAt),
            details: 'Initial transaction record',
            source: 'SYSTEM',
          },
        ],
      }));
      await PaymentModel.insertMany(paymentDocs as any);
      console.log(`✅ [Seed] Inserted ${paymentDocs.length} Payment Transactions`);
    } else {
      console.log(`ℹ️ [Seed] Payments collection already contains ${existingPayments} documents. Skipping.`);
    }

    // 8. Staff
    const existingStaff = await StaffModel.countDocuments();
    if (existingStaff === 0 || forceOverwrite) {
      if (forceOverwrite) await StaffModel.deleteMany({});
      const staffDocs = Array.from(db.staff.values()).map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        permissions: s.permissions,
        department: s.department || 'OPERATIONS',
        isActive: s.isActive ?? s.active ?? true,
      }));
      await StaffModel.insertMany(staffDocs as any);
      console.log(`✅ [Seed] Inserted ${staffDocs.length} Staff accounts`);
    } else {
      console.log(`ℹ️ [Seed] Staff collection already contains ${existingStaff} documents. Skipping.`);
    }

    // 9. Notifications
    const existingNotifs = await NotificationModel.countDocuments();
    if (existingNotifs === 0 || forceOverwrite) {
      if (forceOverwrite) await NotificationModel.deleteMany({});
      const notifDocs = Array.from(db.notifications.values()).map((n) => ({
        id: n.id,
        type: n.type.toUpperCase(),
        title: n.title,
        message: n.message,
        isRead: n.isRead ?? n.read ?? false,
        linkTab: n.link ? n.link.split('/')[2] : undefined,
      }));
      await NotificationModel.insertMany(notifDocs as any);
      console.log(`✅ [Seed] Inserted ${notifDocs.length} Notifications`);
    } else {
      console.log(`ℹ️ [Seed] Notifications collection already contains ${existingNotifs} documents. Skipping.`);
    }

    // 10. Audit Logs
    const existingLogs = await AuditLogModel.countDocuments();
    if (existingLogs === 0 || forceOverwrite) {
      if (forceOverwrite) await AuditLogModel.deleteMany({});
      const logDocs = Array.from(db.auditLogs.values()).map((l) => ({
        id: l.id,
        actorId: l.actorId,
        actorName: l.actorName,
        actorRole: l.actorRole,
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        details: l.details,
        beforeState: l.beforeState,
        afterState: l.afterState,
        createdAt: new Date(l.timestamp),
      }));
      await AuditLogModel.insertMany(logDocs as any);
      console.log(`✅ [Seed] Inserted ${logDocs.length} Audit Logs`);
    } else {
      console.log(`ℹ️ [Seed] Audit Logs already contains ${existingLogs} documents. Skipping.`);
    }

    // 11. CMS & Settings
    await (CMSModel as any).findOneAndUpdate(
      { key: 'STOREFRONT_HOME' },
      { $setOnInsert: { key: 'STOREFRONT_HOME', ...db.cms } },
      { upsert: true }
    );
    console.log('✅ [Seed] Initialized CMS Lookbook document');

    await (SettingsModel as any).findOneAndUpdate(
      { key: 'GLOBAL_SETTINGS' },
      { $setOnInsert: { key: 'GLOBAL_SETTINGS', ...db.settings } },
      { upsert: true }
    );
    console.log('✅ [Seed] Initialized System Settings document');

    console.log('🎉 [Seed] MongoDB Atlas database seeding completed successfully!');
  } catch (err: any) {
    console.error('❌ [Seed] Error during seeding:', err.message || err);
  } finally {
    await disconnectDatabase();
  }
}

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  const force = process.argv.includes('--force');
  seedDatabase(force).then(() => process.exit(0));
}
