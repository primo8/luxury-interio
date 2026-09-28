import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, disconnectDatabase } from '../config/database';
import { StaffModel } from '../models/Staff';

async function authorizeAdmin() {
  const targetEmail = (process.argv[2] || 'primoniyitanga@gmail.com').toLowerCase().trim();
  console.log(`🔐 [Authorize Admin] Authorizing '${targetEmail}' as active SUPER_ADMIN...`);

  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ [Authorize Admin] Database connection failed. Verify MONGODB_URI.');
    process.exit(1);
  }

  try {
    const permissions = [
      'orders:read',
      'orders:write',
      'payments:read',
      'payments:write',
      'products:read',
      'products:write',
      'inventory:read',
      'inventory:write',
      'discounts:read',
      'discounts:write',
      'customers:read',
      'customers:write',
      'categories:read',
      'categories:write',
      'reviews:read',
      'reviews:write',
      'delivery:read',
      'delivery:write',
      'cms:read',
      'cms:write',
      '3d:read',
      '3d:write',
      'analytics:read',
      'notifications:read',
      'staff:read',
      'staff:write',
      'settings:read',
      'settings:write',
      'audit:read',
      'mtn:test',
    ];

    const staffDoc = await StaffModel.findOneAndUpdate(
      { email: targetEmail },
      {
        $set: {
          name: 'Primo Niyitanga',
          email: targetEmail,
          role: 'SUPER_ADMIN',
          permissions,
          department: 'EXECUTIVE',
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          id: 'staff-primo',
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ [Authorize Admin] Successfully authorized staff record:`);
    console.log({
      id: staffDoc.id,
      name: staffDoc.name,
      email: staffDoc.email,
      role: staffDoc.role,
      isActive: staffDoc.isActive,
      department: staffDoc.department,
    });
  } catch (err: any) {
    console.error('❌ [Authorize Admin] Authorization failed:', err.message || err);
  } finally {
    await disconnectDatabase();
    console.log('🔌 [Authorize Admin] Database disconnected.');
  }
}

authorizeAdmin();
