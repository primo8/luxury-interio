import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, disconnectDatabase } from '../config/database';
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
} from '../models';

export async function runMigration() {
  console.log('🔄 [Migration] Running MongoDB Atlas Index sync & schema validations...');
  const connected = await connectDatabase();

  if (!connected) {
    console.error('❌ [Migration] Could not connect to MongoDB Atlas.');
    return;
  }

  try {
    console.log('Building model indexes in MongoDB Atlas...');
    await Promise.all([
      ProductModel.syncIndexes(),
      OrderModel.syncIndexes(),
      PaymentModel.syncIndexes(),
      CustomerModel.syncIndexes(),
      DiscountModel.syncIndexes(),
      CategoryModel.syncIndexes(),
      DeliveryZoneModel.syncIndexes(),
      StaffModel.syncIndexes(),
      NotificationModel.syncIndexes(),
      AuditLogModel.syncIndexes(),
    ]);

    console.log('✅ [Migration] All MongoDB Atlas indexes successfully verified and built.');
  } catch (err: any) {
    console.error('❌ [Migration] Index build error:', err.message || err);
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigration().then(() => process.exit(0));
}
