import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let isFirebaseAdminInitialized = false;

export function initFirebaseAdmin(): boolean {
  if (isFirebaseAdminInitialized) {
    return true;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.log(
      'ℹ️ [Firebase Admin] Environment variables (FIREBASE_PROJECT_ID, etc.) not fully provided. Auth fallback active for local development.'
    );
    return false;
  }

  try {
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    isFirebaseAdminInitialized = true;
    console.log(`✅ [Firebase Admin] Initialized successfully for project: ${projectId}`);
    return true;
  } catch (err: any) {
    console.error('❌ [Firebase Admin] Initialization error:', err.message || err);
    return false;
  }
}

export function isFirebaseAuthActive(): boolean {
  return isFirebaseAdminInitialized;
}

export function getFirebaseAdmin() {
  return {
    auth: getAuth,
  };
}

export { getAuth };

