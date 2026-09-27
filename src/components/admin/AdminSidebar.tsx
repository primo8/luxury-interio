import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Package,
  Layers,
  Users,
  Tag,
  FolderTree,
  Star,
  Truck,
  BarChart3,
  Box,
  Palette,
  Bell,
  ShieldCheck,
  Zap,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAdmin, type AdminTab } from '../../context/AdminContext';

export function AdminSidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setIsAdminView,
    unreadNotificationsCount,
    dashboardData,
  } = useAdmin();

  const ordersPending = dashboardData?.kpis?.orders?.paid || 0;
  const lowStockCount = dashboardData?.kpis?.products?.lowStock || 0;
  const paymentsPending = dashboardData?.kpis?.payments?.pending || 0;

  const mainNav: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: string; badgeType?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag size={18} />,
      badge: ordersPending > 0 ? `${ordersPending}` : undefined,
      badgeType: 'gold',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard size={18} />,
      badge: paymentsPending > 0 ? `${paymentsPending}` : undefined,
      badgeType: 'warning',
    },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Layers size={18} />,
      badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
      badgeType: 'danger',
    },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'discounts', label: 'Discounts', icon: <Tag size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
    { id: 'delivery', label: 'Delivery', icon: <Truck size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  const contentNav: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: '3d-studio', label: '3D Studio', icon: <Box size={18} /> },
    { id: 'cms', label: 'Homepage CMS', icon: <Palette size={18} /> },
  ];

  const systemNav: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: string; badgeType?: string }> = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined,
      badgeType: 'danger',
    },
    { id: 'staff', label: 'Staff & Roles', icon: <ShieldCheck size={18} /> },
    { id: 'mtn-sandbox', label: 'MTN Sandbox', icon: <Zap size={18} />, badge: 'LIVE', badgeType: 'gold' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    { id: 'audit-logs', label: 'Audit Logs', icon: <History size={18} /> },
  ];

  const handleNavClick = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          style={{ zIndex: 39 }}
        />
      )}

      <aside
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
          mobileSidebarOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          {!sidebarCollapsed ? (
            <div className="admin-logo-mark">
              <div className="admin-logo-icon">F</div>
              <div>
                <div className="admin-logo-text">FURNITURA</div>
                <span className="admin-logo-sub">COMMERCE OPS</span>
              </div>
            </div>
          ) : (
            <div className="admin-logo-icon" style={{ margin: '0 auto' }}>
              F
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'var(--admin-sidebar-muted)',
              padding: '0.35rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: sidebarCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Groups (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1.5rem' }}>
          {/* MAIN */}
          <div className="admin-nav-section">
            {!sidebarCollapsed && <div className="admin-nav-title">Main Operations</div>}
            {mainNav.map((item) => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className={`admin-nav-badge ${item.badgeType || ''}`}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="admin-nav-section">
            {!sidebarCollapsed && <div className="admin-nav-title">Experience & Content</div>}
            {contentNav.map((item) => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>

          {/* SYSTEM */}
          <div className="admin-nav-section">
            {!sidebarCollapsed && <div className="admin-nav-title">System & Security</div>}
            {systemNav.map((item) => (
              <button
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className={`admin-nav-badge ${item.badgeType || ''}`}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer: Back to Storefront Button & Expand Toggle */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--admin-sidebar-border)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#FFFFFF',
                padding: '0.6rem 0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
              }}
              title="Expand Sidebar"
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => setIsAdminView(false)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                color: 'var(--admin-gold-light)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Return to Customer Storefront"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={16} />
                <span>View Storefront</span>
              </div>
              <ExternalLink size={14} opacity={0.7} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
