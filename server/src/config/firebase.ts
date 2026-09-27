import admin from 'firebase-admin';

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
    // Handle escaped newlines in environment variable
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    isFirebaseAdminInitialized = true;
    console.log(`✅ [Firebase Admin] Initialized successfully for project: ${projectId}`);
    return true;
  } catch (err: any) {
    console.error('❌ [Firebase Admin] Initialization error:', err.message || err);
    return false;
  }
}

export function getFirebaseAdmin() {
  return admin;
}

export function isFirebaseAuthActive(): boolean {
  return isFirebaseAdminInitialized;
}
