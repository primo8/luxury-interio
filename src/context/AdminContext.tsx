import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAdminNotifications, fetchAdminDashboard } from '../utils/adminApi';

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
  // Check URL hash or default
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return window.location.hash.startsWith('#/admin') || window.location.pathname.startsWith('/admin');
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser] = useState<AdminUser>(DEFAULT_USER);
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

  const refreshDashboardStats = async () => {
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
    if (isAdminView) {
      refreshDashboardStats();
    }
  }, [isAdminView]);

  // Global Keyboard shortcuts: Ctrl+K for search, Ctrl+Shift+A for Admin toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminView((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateToTab = (tab: AdminTab, contextId?: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    if (tab === 'orders' && contextId) setSelectedOrderId(contextId);
    if (tab === 'payments' && contextId) setSelectedPaymentId(contextId);
    if (tab === 'products' && contextId) setSelectedProductId(contextId);
    if (tab === 'customers' && contextId) setSelectedCustomerId(contextId);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminView,
        setIsAdminView,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        isSearchOpen,
        setIsSearchOpen,
        currentUser,
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
