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
      const catDocs = Array.from(db.categories.values());
      await CategoryModel.insertMany(catDocs);
      console.log(`✅ [Seed] Inserted ${catDocs.length} Categories`);
    } else {
      console.log(`ℹ️ [Seed] Categories collection already contains ${existingCats} documents. Skipping.`);
    }

    // 2. Products
    const existingProducts = await ProductModel.countDocuments();
    if (existingProducts === 0 || forceOverwrite) {
      if (forceOverwrite) await ProductModel.deleteMany({});
      const productDocs = Array.from(db.products.values());
      await ProductModel.insertMany(productDocs);
      console.log(`✅ [Seed] Inserted ${productDocs.length} Products`);
    } else {
      console.log(`ℹ️ [Seed] Products collection already contains ${existingProducts} documents. Skipping.`);
    }

    // 3. Customers
    const existingCustomers = await CustomerModel.countDocuments();
    if (existingCustomers === 0 || forceOverwrite) {
      if (forceOverwrite) await CustomerModel.deleteMany({});
      const customerDocs = Array.from(db.customers.values());
      await CustomerModel.insertMany(customerDocs);
      console.log(`✅ [Seed] Inserted ${customerDocs.length} Customers`);
    } else {
      console.log(`ℹ️ [Seed] Customers collection already contains ${existingCustomers} documents. Skipping.`);
    }

    // 4. Discounts
    const existingDiscounts = await DiscountModel.countDocuments();
    if (existingDiscounts === 0 || forceOverwrite) {
      if (forceOverwrite) await DiscountModel.deleteMany({});
      const discountDocs = Array.from(db.discounts.values());
      await DiscountModel.insertMany(discountDocs);
      console.log(`✅ [Seed] Inserted ${discountDocs.length} Discounts`);
    } else {
      console.log(`ℹ️ [Seed] Discounts collection already contains ${existingDiscounts} documents. Skipping.`);
    }

    // 5. Delivery Zones
    const existingZones = await DeliveryZoneModel.countDocuments();
    if (existingZones === 0 || forceOverwrite) {
      if (forceOverwrite) await DeliveryZoneModel.deleteMany({});
      const zoneDocs = Array.from(db.deliveryZones.values());
      await DeliveryZoneModel.insertMany(zoneDocs);
      console.log(`✅ [Seed] Inserted ${zoneDocs.length} Delivery Zones`);
    } else {
      console.log(`ℹ️ [Seed] Delivery Zones already contains ${existingZones} documents. Skipping.`);
    }

    // 6. Orders
    const existingOrders = await OrderModel.countDocuments();
    if (existingOrders === 0 || forceOverwrite) {
      if (forceOverwrite) await OrderModel.deleteMany({});
      const orderDocs = Array.from(db.orders.values());
      await OrderModel.insertMany(orderDocs);
      console.log(`✅ [Seed] Inserted ${orderDocs.length} Orders`);
    } else {
      console.log(`ℹ️ [Seed] Orders collection already contains ${existingOrders} documents. Skipping.`);
    }

    // 7. Payments
    const existingPayments = await PaymentModel.countDocuments();
    if (existingPayments === 0 || forceOverwrite) {
      if (forceOverwrite) await PaymentModel.deleteMany({});
      const paymentDocs = Array.from(db.payments.values());
      await PaymentModel.insertMany(paymentDocs);
      console.log(`✅ [Seed] Inserted ${paymentDocs.length} Payment Transactions`);
    } else {
      console.log(`ℹ️ [Seed] Payments collection already contains ${existingPayments} documents. Skipping.`);
    }

    // 8. Staff
    const existingStaff = await StaffModel.countDocuments();
    if (existingStaff === 0 || forceOverwrite) {
      if (forceOverwrite) await StaffModel.deleteMany({});
      const staffDocs = Array.from(db.staff.values());
      await StaffModel.insertMany(staffDocs);
      console.log(`✅ [Seed] Inserted ${staffDocs.length} Staff accounts`);
    } else {
      console.log(`ℹ️ [Seed] Staff collection already contains ${existingStaff} documents. Skipping.`);
    }

    // 9. Notifications
    const existingNotifs = await NotificationModel.countDocuments();
    if (existingNotifs === 0 || forceOverwrite) {
      if (forceOverwrite) await NotificationModel.deleteMany({});
      const notifDocs = Array.from(db.notifications.values());
      await NotificationModel.insertMany(notifDocs);
      console.log(`✅ [Seed] Inserted ${notifDocs.length} Notifications`);
    } else {
      console.log(`ℹ️ [Seed] Notifications collection already contains ${existingNotifs} documents. Skipping.`);
    }

    // 10. Audit Logs
    const existingLogs = await AuditLogModel.countDocuments();
    if (existingLogs === 0 || forceOverwrite) {
      if (forceOverwrite) await AuditLogModel.deleteMany({});
      const logDocs = Array.from(db.auditLogs.values());
      await AuditLogModel.insertMany(logDocs);
      console.log(`✅ [Seed] Inserted ${logDocs.length} Audit Logs`);
    } else {
      console.log(`ℹ️ [Seed] Audit Logs already contains ${existingLogs} documents. Skipping.`);
    }

    // 11. CMS & Settings
    await CMSModel.findOneAndUpdate(
      { key: 'STOREFRONT_HOME' },
      { $setOnInsert: { key: 'STOREFRONT_HOME', ...db.cms } },
      { upsert: true }
    );
    console.log('✅ [Seed] Initialized CMS Lookbook document');

    await SettingsModel.findOneAndUpdate(
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
