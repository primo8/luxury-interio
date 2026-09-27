import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin, isFirebaseAuthActive } from '../config/firebase';
import { StaffModel } from '../models/Staff';
import { db } from '../db/memoryDb';
import { isDatabaseConnected } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name?: string;
    role: string;
    permissions: string[];
    isStaff: boolean;
  };
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'orders.read',
    'orders.update',
    'orders.cancel',
    'payments.read',
    'payments.reconcile',
    'payments.refund',
    'products.read',
    'products.create',
    'products.update',
    'products.archive',
    'inventory.read',
    'inventory.adjust',
    'discounts.read',
    'discounts.create',
    'discounts.update',
    'customers.read',
    'categories.read',
    'categories.manage',
    'delivery.read',
    'delivery.manage',
    'reviews.read',
    'reviews.manage',
    'cms.read',
    'cms.manage',
    'analytics.read',
    'notifications.read',
    'notifications.manage',
    'staff.read',
    'staff.manage',
    'settings.manage',
    'audit.read',
  ],
  ORDER_MANAGER: [
    'orders.read',
    'orders.update',
    'orders.cancel',
    'customers.read',
    'delivery.read',
    'delivery.manage',
    'notifications.read',
  ],
  PRODUCT_MANAGER: [
    'products.read',
    'products.create',
    'products.update',
    'products.archive',
    'inventory.read',
    'inventory.adjust',
    'categories.read',
    'categories.manage',
  ],
  FINANCE_MANAGER: [
    'payments.read',
    'payments.reconcile',
    'payments.refund',
    'orders.read',
    'discounts.read',
    'discounts.create',
    'discounts.update',
    'analytics.read',
  ],
  CONTENT_MANAGER: [
    'cms.read',
    'cms.manage',
    'reviews.read',
    'reviews.manage',
    'categories.read',
    'categories.manage',
    'products.read',
  ],
  SUPPORT_AGENT: [
    'orders.read',
    'customers.read',
    'reviews.read',
    'reviews.manage',
    'notifications.read',
  ],
};

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // In local development or when Firebase is not configured, support fallback admin session
  if (!isFirebaseAuthActive()) {
    req.user = {
      uid: 'dev-admin-uid',
      email: 'alexandre.v@furnitura.rw',
      name: 'Alexandre Vance',
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      isStaff: true,
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No Bearer token provided in Authorization header.',
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    let staffRecord: any = null;

    if (isDatabaseConnected()) {
      staffRecord = await StaffModel.findOne({
        $or: [{ firebaseUid: decodedToken.uid }, { email: decodedToken.email?.toLowerCase() }],
        isActive: true,
      } as any).lean();
    } else {
      staffRecord = Array.from(db.staff.values()).find(
        (s) => s.email.toLowerCase() === decodedToken.email?.toLowerCase() && (s.isActive ?? s.active)
      );
    }

    const role = staffRecord?.role || 'SUPPORT_AGENT';
    const permissions =
      staffRecord?.permissions?.length > 0
        ? staffRecord.permissions
        : DEFAULT_ROLE_PERMISSIONS[role] || [];

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: staffRecord?.name || decodedToken.name || 'Staff Member',
      role,
      permissions,
      isStaff: Boolean(staffRecord),
    };

    return next();
  } catch (err: any) {
    console.error('❌ [Auth Middleware] Token verification failed:', err.message || err);
    return res.status(401).json({
      success: false,
      message: 'Invalid, revoked, or expired authentication token.',
    });
  }
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userPerms = req.user.permissions || [];
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN' || userPerms.includes('*');

    if (isSuperAdmin || userPerms.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Required permission: '${permission}'.`,
    });
  };
}
