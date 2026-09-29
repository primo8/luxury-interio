import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isClientFirebaseConfigured } from '../config/firebase';

export interface CustomerAddress {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  province?: string;
  district?: string;
  sector?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface CustomerProfile {
  id: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  authProvider?: string;
  emailVerified?: boolean;
  address?: string;
  province?: string;
  district?: string;
  addresses: CustomerAddress[];
  wishlist: string[];
  totalOrders: number;
  totalSpent: number;
  status: 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE';
  lastOrderDate?: string;
  createdAt?: string;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  firebaseUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: {
    streetAddress: string;
    province?: string;
    district?: string;
    sector?: string;
    notes?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    selectedColor?: { name: string; hex: string };
    image?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  appliedDiscountCode?: string;
  total: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  paymentId?: string;
  mtnReferenceId?: string;
  timeline: Array<{ status: string; timestamp: string; actor: string; note?: string }>;
  createdAt: string;
}

export type AuthModalTab = 'login' | 'register' | 'profile' | 'orders' | 'addresses' | 'security';

interface UserAuthContextType {
  firebaseUser: FirebaseUser | null;
  customer: CustomerProfile | null;
  idToken: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  orders: UserOrder[];
  ordersLoading: boolean;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    phone?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updateCustomerProfile: (data: {
    fullName?: string;
    phone?: string;
    address?: string;
    province?: string;
    district?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  addAddress: (addr: Omit<CustomerAddress, 'id'>) => Promise<{ success: boolean; message?: string }>;
  deleteAddress: (addressId: string) => Promise<{ success: boolean; message?: string }>;
  fetchOrders: () => Promise<void>;
  syncWishlistWithMongo: (wishlistIds: string[]) => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '';

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);

  // Sync user with backend MongoDB Atlas
  const syncWithMongoDB = useCallback(async (token: string, user: FirebaseUser, extraData?: any) => {
    try {
      const res = await fetch(`${API_URL}/api/user/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: user.displayName || extraData?.fullName || '',
          photoURL: user.photoURL || '',
          phone: user.phoneNumber || extraData?.phone || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCustomer(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.warn('⚠️ [UserAuth] Backend MongoDB sync warning:', err);
    }
    return null;
  }, []);

  // Fetch orders from MongoDB
  const fetchOrders = useCallback(async () => {
    if (!idToken) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/orders`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [idToken]);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    if (!isClientFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        try {
          const token = await user.getIdToken();
          setFirebaseUser(user);
          setIdToken(token);
          await syncWithMongoDB(token, user);
        } catch (err) {
          console.error('[UserAuth] Token retrieval error:', err);
        }
      } else {
        setFirebaseUser(null);
        setCustomer(null);
        setIdToken(null);
        setOrders([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncWithMongoDB]);

  // Fetch orders whenever user opens modal on orders tab or when customer changes
  useEffect(() => {
    if (customer && idToken && (authModalTab === 'orders' || authModalTab === 'profile')) {
      fetchOrders();
    }
  }, [customer, idToken, authModalTab, fetchOrders]);

  const openAuthModal = (tab?: AuthModalTab) => {
    if (tab) {
      setAuthModalTab(tab);
    } else {
      setAuthModalTab(customer ? 'profile' : 'login');
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // 1. Google Sign-In
  const loginWithGoogle = async () => {
    if (!isClientFirebaseConfigured || !auth) {
      return { success: false, message: 'Firebase Client is not configured in this environment.' };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken();
      setFirebaseUser(cred.user);
      setIdToken(token);
      await syncWithMongoDB(token, cred.user);
      setAuthModalTab('profile');
      return { success: true };
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      return { success: false, message: err.message || 'Google sign-in was cancelled or failed.' };
    }
  };

  // 2. Email & Password Sign-In
  const loginWithEmail = async (email: string, pass: string) => {
    if (!isClientFirebaseConfigured || !auth) {
      return { success: false, message: 'Firebase Client is not configured.' };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const token = await cred.user.getIdToken();
      setFirebaseUser(cred.user);
      setIdToken(token);
      await syncWithMongoDB(token, cred.user);
      setAuthModalTab('profile');
      return { success: true };
    } catch (err: any) {
      let msg = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Incorrect password.';
      if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
      return { success: false, message: msg };
    }
  };

  // 3. Email & Password Registration
  const registerWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    phone?: string
  ) => {
    if (!isClientFirebaseConfigured || !auth) {
      return { success: false, message: 'Firebase Client is not configured.' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateFirebaseProfile(cred.user, { displayName: fullName.trim() });
      const token = await cred.user.getIdToken();
      setFirebaseUser(cred.user);
      setIdToken(token);
      await syncWithMongoDB(token, cred.user, { fullName, phone });
      setAuthModalTab('profile');
      return { success: true };
    } catch (err: any) {
      let msg = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      return { success: false, message: msg };
    }
  };

  // 4. Logout
  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setFirebaseUser(null);
    setCustomer(null);
    setIdToken(null);
    setOrders([]);
    setIsAuthModalOpen(false);
  };

  // 5. Password Reset
  const resetPassword = async (email: string) => {
    if (!auth) return { success: false, message: 'Firebase not configured.' };
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send password reset email.' };
    }
  };

  // 6. Update Customer Profile in MongoDB Atlas
  const updateCustomerProfile = async (data: {
    fullName?: string;
    phone?: string;
    address?: string;
    province?: string;
    district?: string;
  }) => {
    if (!idToken) return { success: false, message: 'Authentication required.' };
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success && result.user) {
        setCustomer((prev) => (prev ? { ...prev, ...result.user } : result.user));
        return { success: true, message: 'Profile updated in MongoDB Atlas.' };
      }
      return { success: false, message: result.message || 'Failed to update profile.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  // 7. Add Address to MongoDB Atlas
  const addAddress = async (addr: Omit<CustomerAddress, 'id'>) => {
    if (!idToken) return { success: false, message: 'Authentication required.' };
    try {
      const res = await fetch(`${API_URL}/api/user/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(addr),
      });
      const result = await res.json();
      if (result.success && result.addresses) {
        setCustomer((prev) => (prev ? { ...prev, addresses: result.addresses } : prev));
        return { success: true, message: 'Address saved.' };
      }
      return { success: false, message: result.message || 'Failed to save address.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  // 8. Delete Address from MongoDB Atlas
  const deleteAddress = async (addressId: string) => {
    if (!idToken) return { success: false, message: 'Authentication required.' };
    try {
      const res = await fetch(`${API_URL}/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const result = await res.json();
      if (result.success && result.addresses) {
        setCustomer((prev) => (prev ? { ...prev, addresses: result.addresses } : prev));
        return { success: true, message: 'Address removed.' };
      }
      return { success: false, message: result.message || 'Failed to remove address.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  // 9. Sync Wishlist with MongoDB Atlas
  const syncWishlistWithMongo = async (wishlistIds: string[]) => {
    if (!idToken) return;
    try {
      await fetch(`${API_URL}/api/user/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ wishlist: wishlistIds }),
      });
    } catch (err) {
      console.warn('[UserAuth] Wishlist sync warning:', err);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        firebaseUser,
        customer,
        idToken,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        orders,
        ordersLoading,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        resetPassword,
        updateCustomerProfile,
        addAddress,
        deleteAddress,
        fetchOrders,
        syncWishlistWithMongo,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};
