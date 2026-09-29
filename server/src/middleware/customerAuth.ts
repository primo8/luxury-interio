import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin, isFirebaseAuthActive } from '../config/firebase';
import { CustomerModel, type ICustomerDocument } from '../models/Customer';
import { db } from '../db/memoryDb';
import { isDatabaseConnected } from '../config/database';

export interface CustomerAuthenticatedRequest extends Request {
  customer?: {
    id: string;
    firebaseUid: string;
    email: string;
    fullName: string;
    phone?: string;
    photoURL?: string;
    authProvider?: string;
    emailVerified?: boolean;
    addresses?: any[];
    wishlist?: string[];
    totalOrders: number;
    totalSpent: number;
    status: string;
  };
  firebaseUser?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    emailVerified?: boolean;
    providerId?: string;
  };
}

/**
 * Extracts and cryptographically verifies Firebase ID token for Customers/Users.
 * Synchronizes or retrieves the customer profile directly from MongoDB Atlas.
 */
export async function requireCustomerAuth(
  req: CustomerAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required. Please sign in with your account.',
    });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Bearer token missing.',
    });
  }

  // 1. Verify token with Firebase Admin
  let decodedToken: any;
  if (isFirebaseAuthActive()) {
    try {
      const admin = getFirebaseAdmin();
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (err: any) {
      console.error('❌ [CustomerAuth] Firebase token verification failed:', err.message || err);
      return res.status(401).json({
        success: false,
        message: 'Your session has expired or is invalid. Please sign in again.',
      });
    }
  } else {
    // Development fallback when Firebase Admin private keys are not loaded in local environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        success: false,
        message: 'Authentication service unavailable in production.',
      });
    }

    // Decode mock or client token in local dev
    try {
      // Basic base64 payload decode for local dev verification
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        decodedToken = {
          uid: payload.user_id || payload.sub || payload.uid || 'dev-customer-uid',
          email: payload.email || 'client@luxury-interio.com',
          name: payload.name || payload.displayName || 'VIP Client',
          picture: payload.picture || '',
          email_verified: payload.email_verified ?? true,
        };
      } else {
        decodedToken = {
          uid: 'dev-customer-uid',
          email: 'client@luxury-interio.com',
          name: 'VIP Client',
          picture: '',
          email_verified: true,
        };
      }
    } catch {
      decodedToken = {
        uid: 'dev-customer-uid',
        email: 'client@luxury-interio.com',
        name: 'VIP Client',
        picture: '',
        email_verified: true,
      };
    }
  }

  const firebaseUid = decodedToken.uid;
  const userEmail = (decodedToken.email || '').toLowerCase().trim();
  const userName = decodedToken.name || decodedToken.displayName || userEmail.split('@')[0] || 'Client';
  const userPhoto = decodedToken.picture || '';
  const emailVerified = decodedToken.email_verified ?? false;
  const authProvider = decodedToken.firebase?.sign_in_provider || 'password';

  req.firebaseUser = {
    uid: firebaseUid,
    email: userEmail,
    name: userName,
    picture: userPhoto,
    emailVerified,
    providerId: authProvider,
  };

  // 2. Fetch or provision the Customer record in MongoDB Atlas
  try {
    let customerDoc: any = null;

    if (isDatabaseConnected()) {
      customerDoc = await CustomerModel.findOne({
        $or: [{ firebaseUid }, ...(userEmail ? [{ email: userEmail }] : [])],
      });

      if (!customerDoc) {
        // Auto-provision new customer record in MongoDB Atlas
        const customerId = `cust-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        customerDoc = await CustomerModel.create({
          id: customerId,
          firebaseUid,
          fullName: userName,
          email: userEmail || `${firebaseUid}@users.furnitura.com`,
          phone: '',
          photoURL: userPhoto,
          authProvider,
          emailVerified,
          address: '',
          addresses: [],
          wishlist: [],
          totalOrders: 0,
          totalSpent: 0,
          status: 'NEW',
          tags: ['Storefront Customer', 'Firebase Auth'],
          lastLoginAt: new Date(),
        });
        console.log(`✨ [CustomerAuth] Created new MongoDB customer for Firebase UID: ${firebaseUid}`);
      } else {
        // Update Firebase UID and login metadata if not linked yet
        let needsSave = false;
        if (!customerDoc.firebaseUid || customerDoc.firebaseUid !== firebaseUid) {
          customerDoc.firebaseUid = firebaseUid;
          needsSave = true;
        }
        if (userPhoto && !customerDoc.photoURL) {
          customerDoc.photoURL = userPhoto;
          needsSave = true;
        }
        customerDoc.lastLoginAt = new Date();
        customerDoc.emailVerified = emailVerified;
        if (needsSave || true) {
          await customerDoc.save();
        }
      }
    } else {
      // Memory DB fallback
      customerDoc = Array.from(db.customers.values()).find(
        (c) => (c as any).firebaseUid === firebaseUid || (userEmail && c.email.toLowerCase() === userEmail)
      );

      if (!customerDoc) {
        const customerId = `cust-${Date.now().toString(36)}`;
        customerDoc = {
          id: customerId,
          firebaseUid,
          fullName: userName,
          email: userEmail,
          phone: '',
          photoURL: userPhoto,
          authProvider,
          emailVerified,
          address: '',
          addresses: [],
          wishlist: [],
          totalOrders: 0,
          totalSpent: 0,
          status: 'NEW',
          tags: ['Storefront Customer'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.customers.set(customerId, customerDoc);
      }
    }

    req.customer = {
      id: customerDoc.id,
      firebaseUid: customerDoc.firebaseUid || firebaseUid,
      email: customerDoc.email,
      fullName: customerDoc.fullName,
      phone: customerDoc.phone,
      photoURL: customerDoc.photoURL || userPhoto,
      authProvider: customerDoc.authProvider || authProvider,
      emailVerified: customerDoc.emailVerified ?? emailVerified,
      addresses: customerDoc.addresses || [],
      wishlist: customerDoc.wishlist || [],
      totalOrders: customerDoc.totalOrders || 0,
      totalSpent: customerDoc.totalSpent || 0,
      status: customerDoc.status || 'NEW',
    };

    return next();
  } catch (dbErr: any) {
    console.error('❌ [CustomerAuth] Database lookup error:', dbErr.message || dbErr);
    return res.status(500).json({
      success: false,
      message: 'Failed to synchronize customer account with database.',
    });
  }
}

/**
 * Optional Customer Auth: populates req.customer if valid Bearer token provided,
 * otherwise proceeds as guest without failing.
 */
export async function optionalCustomerAuth(
  req: CustomerAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return requireCustomerAuth(req, res, next);
}
