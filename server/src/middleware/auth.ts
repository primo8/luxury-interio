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

  // 1. Check if Firebase Authentication service is initialized
  if (!isFirebaseAuthActive()) {
    // In production, or whenever dev bypass is not explicitly enabled, strictly reject
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEV_AUTH_BYPASS !== 'true') {
      return res.status(401).json({
        success: false,
        message: 'Authentication service is unavailable. Privileged access requires active authentication.',
      });
    }

    // Explicit local development bypass only when ALLOW_DEV_AUTH_BYPASS='true' and NOT in production
    console.warn('⚠️ [DEV ONLY] Development auth bypass active (ALLOW_DEV_AUTH_BYPASS=true)');
    req.user = {
      uid: 'dev-admin-uid',
      email: 'alexandre.v@furnitura.rw',
      name: 'Alexandre Vance (Dev Mock)',
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      isStaff: true,
    };
    return next();
  }

  // 2. Validate Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No Bearer token provided in Authorization header.',
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Empty Bearer token provided in Authorization header.',
    });
  }

  // 3. Cryptographically verify Firebase ID token
  let decodedToken: any;
  try {
    const admin = getFirebaseAdmin();
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch (err: any) {
    console.error('❌ [Auth Middleware] Token verification failed:', err.message || err);
    return res.status(401).json({
      success: false,
      message: 'Invalid, revoked, or expired authentication token.',
    });
  }

  // 4. Look up authorized staff member in MongoDB StaffModel (Server-Side RBAC)
  try {
    let staffRecord: any = null;
    const userEmail = decodedToken.email?.toLowerCase();
    const userUid = decodedToken.uid;

    if (isDatabaseConnected()) {
      staffRecord = await StaffModel.findOne({
        $or: [{ firebaseUid: userUid }, { email: userEmail }],
        isActive: true,
      } as any).lean();
    } else {
      staffRecord = Array.from(db.staff.values()).find(
        (s) =>
          ((userEmail && s.email.toLowerCase() === userEmail) || (s as any).firebaseUid === userUid) &&
          (s.isActive ?? s.active) === true
      );
    }

    // 5. If user is authenticated by Firebase but is NOT in StaffModel, reject with 403 Forbidden
    if (!staffRecord) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: User account is not authorized as an active staff member.',
      });
    }

    // 6. Resolve authoritative role and permissions strictly from server-side database
    const role = staffRecord.role || 'SUPPORT_AGENT';
    const permissions =
      Array.isArray(staffRecord.permissions) && staffRecord.permissions.length > 0
        ? staffRecord.permissions
        : DEFAULT_ROLE_PERMISSIONS[role] || [];

    req.user = {
      uid: userUid,
      email: userEmail || staffRecord.email,
      name: staffRecord.name || decodedToken.name || 'Staff Member',
      role,
      permissions,
      isStaff: true,
    };

    return next();
  } catch (dbErr: any) {
    console.error('❌ [Auth Middleware] Database staff authorization error:', dbErr.message || dbErr);
    return res.status(500).json({
      success: false,
      message: 'Internal error during staff authorization verification.',
    });
  }
}

export { DEFAULT_ROLE_PERMISSIONS };

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.isStaff) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Valid staff authentication required.',
      });
    }

    const userPerms = req.user.permissions || [];
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN' || userPerms.includes('*');
    const altPermission = permission.includes('.') ? permission.replace('.', ':') : permission.replace(':', '.');

    if (isSuperAdmin || userPerms.includes(permission) || userPerms.includes(altPermission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access forbidden: Insufficient permissions. Required permission: '${permission}'.`,
    });
  };
}
