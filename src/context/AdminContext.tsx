import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, isClientFirebaseConfigured } from '../config/firebase';
import { IS_ADMIN_MODE, IS_CLIENT_MODE } from '../config/appMode';
import { fetchAdminNotifications, fetchAdminDashboard } from '../utils/adminApi';
import { getApiOrigin } from '../config/api';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'payments'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'discounts'
  | 'categories'
  | 'reviews'
  | 'delivery'
  | 'analytics'
  | '3d-studio'
  | 'cms'
  | 'notifications'
  | 'staff'
  | 'mtn-sandbox'
  | 'settings'
  | 'audit-logs';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  permissions: string[];
  phone?: string;
}

interface AdminContextType {
  isAdminView: boolean;
  setIsAdminView: (active: boolean) => void;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  currentUser: AdminUser;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  unreadNotificationsCount: number;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedPaymentId: string | null;
  setSelectedPaymentId: (id: string | null) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  navigateToTab: (tab: AdminTab, contextId?: string) => void;
  refreshDashboardStats: () => Promise<void>;
  dashboardData: any;
  showAdminToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  adminToasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>;
  dismissAdminToast: (id: string) => void;
}

const DEFAULT_USER: AdminUser = {
  id: 'staff-1',
  name: 'Diane Uwase',
  email: 'admin@furnitura.luxury',
  role: 'SUPER_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  permissions: [
    'orders:read', 'orders:write',
    'payments:read', 'payments:write',
    'products:read', 'products:write',
    'inventory:read', 'inventory:write',
    'discounts:read', 'discounts:write',
    'customers:read', 'customers:write',
    'categories:read', 'categories:write',
    'reviews:read', 'reviews:write',
    'delivery:read', 'delivery:write',
    'cms:read', 'cms:write',
    '3d:read', '3d:write',
    'analytics:read',
    'notifications:read',
    'staff:read', 'staff:write',
    'settings:read', 'settings:write',
    'audit:read',
    'mtn:test',
  ],
  phone: '+250 788 123 456',
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Determine if admin view is active based on deployment mode or explicit navigation
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (IS_CLIENT_MODE) return false;
    if (IS_ADMIN_MODE) return true;
    return window.location.hash.startsWith('#/admin') || window.location.pathname.startsWith('/admin');
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If not in admin mode, default authenticated state is not required
    if (IS_CLIENT_MODE) return false;
    const token = localStorage.getItem('furnitura_admin_token') || sessionStorage.getItem('furnitura_admin_token');
    return Boolean(token);
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(4);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [adminToasts, setAdminToasts] = useState<
    Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>
  >([]);

  const showAdminToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setAdminToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissAdminToast(id);
    }, 4000);
  };

  const dismissAdminToast = (id: string) => {
    setAdminToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Verify server-side RBAC and fetch admin profile
  const verifyServerRbac = useCallback(async (token: string): Promise<{ success: boolean; message?: string }> => {
    const apiOrigin = getApiOrigin();
    try {
      const res = await fetch(`${apiOrigin}/api/admin/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.user) {
        setCurrentUser({
          id: data.user.id || DEFAULT_USER.id,
          name: data.user.name || DEFAULT_USER.name,
          email: data.user.email || DEFAULT_USER.email,
          role: data.user.role || DEFAULT_USER.role,
          avatar: data.user.avatar || DEFAULT_USER.avatar,
          permissions: data.user.permissions || DEFAULT_USER.permissions,
          phone: data.user.phone || DEFAULT_USER.phone,
        });
        setIsAuthenticated(true);
        return { success: true };
      }

      return {
        success: false,
        message:
          data.message ||
          (res.status === 403
            ? 'Access Denied: Your account was authenticated, but is not registered or active in the staff directory.'
            : res.status === 401
            ? 'Authentication failed: Invalid or expired session token.'
            : `Server returned HTTP ${res.status}: ${res.statusText}`),
      };
    } catch (err: any) {
      console.error('[AdminContext] RBAC verification error:', err);
      return {
        success: false,
        message: `Backend Connection Error: Unable to reach backend API at '${apiOrigin}'. Ensure backend is deployed and VITE_API_URL is configured.`,
      };
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (IS_CLIENT_MODE) {
      setIsLoadingAuth(false);
      return;
    }

    let isMounted = true;
    const existingToken =
      localStorage.getItem('furnitura_admin_token') || sessionStorage.getItem('furnitura_admin_token');

    if (existingToken) {
      verifyServerRbac(existingToken).then((authRes) => {
        if (isMounted) {
          if (!authRes.success && !isClientFirebaseConfigured) {
            // In dev mode with fallback token, keep active
            setIsAuthenticated(true);
          } else if (!authRes.success) {
            setIsAuthenticated(false);
            localStorage.removeItem('furnitura_admin_token');
          }
          setIsLoadingAuth(false);
        }
      });
    } else {
      setIsLoadingAuth(false);
    }

    // If client Firebase SDK is configured, subscribe to auth state
    if (isClientFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted) return;
        if (fbUser) {
          try {
            const token = await fbUser.getIdToken();
            localStorage.setItem('furnitura_admin_token', token);
            const rbacRes = await verifyServerRbac(token);
            if (!rbacRes.success) {
              localStorage.removeItem('furnitura_admin_token');
              setIsAuthenticated(false);
            }
          } catch (err) {
            console.error('[Firebase Auth] Failed to get ID token:', err);
          }
        }
        setIsLoadingAuth(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [verifyServerRbac]);

  // Login handler
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      let token = '';

      if (isClientFirebaseConfigured && auth) {
        try {
          // Attempt Firebase Client SDK login
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          token = await userCredential.user.getIdToken();
        } catch (fbErr: any) {
          // If Email/Password is disabled in Firebase Console (auth/operation-not-allowed) or user is not in Firebase Auth,
          // fall back gracefully to direct staff credentials verified on backend
          if (
            fbErr.code === 'auth/operation-not-allowed' ||
            fbErr.code === 'auth/user-not-found' ||
            fbErr.code === 'auth/invalid-credential'
          ) {
            console.warn(
              '[Firebase Auth] Email/Password provider not enabled in Firebase Console. Falling back to direct staff auth API...'
            );
            const apiOrigin = getApiOrigin();
            const res = await fetch(`${apiOrigin}/api/admin/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!data.success) {
              return { success: false, message: data.message || 'Invalid credentials' };
            }
            token = data.token || `furn-session-${Date.now()}`;
            if (data.user) {
              setCurrentUser(data.user);
            }
          } else {
            throw fbErr;
          }
        }
      } else {
        // Direct RBAC server login fallback (for dev or direct staff auth)
        const apiOrigin = getApiOrigin();
        const res = await fetch(`${apiOrigin}/api/admin/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!data.success) {
          return { success: false, message: data.message || 'Invalid credentials' };
        }
        token = data.token || `furn-session-${Date.now()}`;
        if (data.user) {
          setCurrentUser(data.user);
        }
      }

      localStorage.setItem('furnitura_admin_token', token);
      const authRes = await verifyServerRbac(token);
      if (!authRes.success) {
        setIsAuthenticated(false);
        localStorage.removeItem('furnitura_admin_token');
        return { success: false, message: authRes.message || 'Access verification failed.' };
      }

      setIsAuthenticated(true);
      showAdminToast('Signed in successfully to Admin Command Center', 'success');
      return { success: true };
    } catch (err: any) {
      console.error('[Admin Login Failed]', err);
      return {
        success: false,
        message: err.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  // Google Sign-In handler
  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!isClientFirebaseConfigured || !auth) {
        return {
          success: false,
          message: 'Google Sign-In is unavailable because Firebase is not configured in this environment.',
        };
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();

      localStorage.setItem('furnitura_admin_token', token);
      const authRes = await verifyServerRbac(token);

      if (!authRes.success) {
        // Failed verification
        await signOut(auth);
        localStorage.removeItem('furnitura_admin_token');
        sessionStorage.removeItem('furnitura_admin_token');
        setIsAuthenticated(false);
        return {
          success: false,
          message:
            authRes.message ||
            'Access Denied: Your Google account was authenticated, but is not authorized as an active staff member in FURNITURA.',
        };
      }

      setIsAuthenticated(true);
      showAdminToast('Signed in successfully with Google', 'success');
      return { success: true };
    } catch (err: any) {
      console.error('[Google Sign-In Failed]', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false, message: 'Google sign-in popup was closed before completing.' };
      }
      return {
        success: false,
        message: err.message || 'Google authentication failed. Please try again.',
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (isClientFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('[Admin Logout Warning]', err);
    } finally {
      localStorage.removeItem('furnitura_admin_token');
      sessionStorage.removeItem('furnitura_admin_token');
      setIsAuthenticated(false);
      setCurrentUser(DEFAULT_USER);
      showAdminToast('Signed out of Admin Command Center', 'info');
    }
  };

  const refreshDashboardStats = async () => {
    if (!isAuthenticated && IS_ADMIN_MODE) return;
    try {
      const [dashRes, notifRes] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminNotifications(),
      ]);
      if (dashRes.success) {
        setDashboardData(dashRes);
      }
      if (notifRes.success && notifRes.unreadCount !== undefined) {
        setUnreadNotificationsCount(notifRes.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    if (isAdminView && isAuthenticated) {
      refreshDashboardStats();
    }
  }, [isAdminView, isAuthenticated]);

  // Global Keyboard shortcuts: Ctrl+K for search, Ctrl+Shift+A for Admin toggle (only if not client mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (isAdminView) {
          e.preventDefault();
          setIsSearchOpen((prev) => !prev);
        }
      }
      // Only allow toggle if not strictly forced to client mode
      if (!IS_CLIENT_MODE && (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminView((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminView]);

  const navigateToTab = (tab: AdminTab, contextId?: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    if (tab === 'orders' && contextId) setSelectedOrderId(contextId);
    if (tab === 'payments' && contextId) setSelectedPaymentId(contextId);
    if (tab === 'products' && contextId) setSelectedProductId(contextId);
    if (tab === 'customers' && contextId) setSelectedCustomerId(contextId);
  };

  const setAdminViewSafely = (active: boolean) => {
    if (IS_CLIENT_MODE) {
      setIsAdminView(false);
      return;
    }
    if (IS_ADMIN_MODE) {
      setIsAdminView(true);
      return;
    }
    setIsAdminView(active);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminView: IS_CLIENT_MODE ? false : IS_ADMIN_MODE ? true : isAdminView,
        setIsAdminView: setAdminViewSafely,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        isSearchOpen,
        setIsSearchOpen,
        currentUser,
        isAuthenticated,
        isLoadingAuth,
        login,
        loginWithGoogle,
        logout,
        unreadNotificationsCount,
        selectedOrderId,
        setSelectedOrderId,
        selectedPaymentId,
        setSelectedPaymentId,
        selectedProductId,
        setSelectedProductId,
        selectedCustomerId,
        setSelectedCustomerId,
        navigateToTab,
        refreshDashboardStats,
        dashboardData,
        showAdminToast,
        adminToasts,
        dismissAdminToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
