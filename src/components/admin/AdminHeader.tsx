import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Tag,
  Zap,
  Package,
  Store,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAdmin, type AdminTab } from '../../context/AdminContext';
import { IS_ADMIN_MODE } from '../../config/appMode';

export function AdminHeader() {
  const {
    activeTab,
    navigateToTab,
    setMobileSidebarOpen,
    setIsSearchOpen,
    currentUser,
    unreadNotificationsCount,
    setIsAdminView,
    logout,
  } = useAdmin();

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const quickActionsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Commerce Command Center', section: 'Overview' };
      case 'orders':
        return { title: 'Orders Management', section: 'Main Operations' };
      case 'payments':
        return { title: 'MTN MoMo Transactions', section: 'Financial Operations' };
      case 'products':
        return { title: 'Product Catalog', section: 'Catalog' };
      case 'inventory':
        return { title: 'Inventory & Stock Logistics', section: 'Logistics' };
      case 'customers':
        return { title: 'Customer Directory & VIPs', section: 'Customers' };
      case 'discounts':
        return { title: 'Promotional Discounts & Coupons', section: 'Marketing' };
      case 'categories':
        return { title: 'Catalog Categories', section: 'Catalog' };
      case 'reviews':
        return { title: 'Customer Reviews & Moderation', section: 'Reputation' };
      case 'delivery':
        return { title: 'Rwanda Delivery Zones & Rates', section: 'Fulfillment' };
      case 'analytics':
        return { title: 'Revenue & Operations Analytics', section: 'Intelligence' };
      case '3d-studio':
        return { title: '3D Studio & WebGL Configuration', section: 'Experience' };
      case 'cms':
        return { title: 'Homepage & Banners CMS', section: 'Experience' };
      case 'notifications':
        return { title: 'System & Operational Notifications', section: 'System' };
      case 'staff':
        return { title: 'Staff Users & Role-Based Access', section: 'Security' };
      case 'mtn-sandbox':
        return { title: 'MTN MoMo Sandbox Test Center', section: 'Gateways' };
      case 'settings':
        return { title: 'Store Configuration & Settings', section: 'System' };
      case 'audit-logs':
        return { title: 'Privileged Security Audit Trail', section: 'Compliance' };
      default:
        return { title: 'Admin Console', section: 'FURNITURA' };
    }
  };

  const { title, section } = getPageTitle(activeTab);

  return (
    <header className="admin-header">
      {/* Left: Mobile Hamburger & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.4rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--admin-text-primary)',
          }}
          className="admin-mobile-only"
        >
          <Menu size={22} />
        </button>

        <div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--admin-amethyst)',
            }}
          >
            FURNITURA / {section}
          </div>
          <h1
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--admin-text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="admin-search-trigger" onClick={() => setIsSearchOpen(true)}>
          <Search size={16} />
          <span>Search orders, products, MTN ref...</span>
          <span className="admin-search-kbd">⌘K</span>
        </button>

        {/* Environment Indicator */}
        <div className="admin-env-pill sandbox" title="Connected to MTN MoMo Sandbox Gateway">
          SANDBOX
        </div>
      </div>

      {/* Right: Quick Actions, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Quick Actions Dropdown */}
        <div style={{ position: 'relative' }} ref={quickActionsRef}>
          <button
            className="admin-btn admin-btn-gold"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Plus size={16} />
            <span>Quick Action</span>
            <ChevronDown size={14} />
          </button>

          {isQuickActionsOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '230px',
                background: '#FFFFFF',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid var(--admin-border)',
                padding: '0.5rem',
                zIndex: 50,
              }}
            >
              <button
                onClick={() => {
                  navigateToTab('products');
                  setIsQuickActionsOpen(false);
                }}
                className="admin-nav-item"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                <Package size={16} color="var(--admin-plum)" />
                <span>+ Add Product</span>
              </button>
              <button
                onClick={() => {
                  navigateToTab('discounts');
                  setIsQuickActionsOpen(false);
                }}
                className="admin-nav-item"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                <Tag size={16} color="var(--admin-amethyst)" />
                <span>+ Create Discount</span>
              </button>
              <button
                onClick={() => {
                  navigateToTab('inventory');
                  setIsQuickActionsOpen(false);
                }}
                className="admin-nav-item"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                <Layers size={16} color="var(--admin-warning)" />
                <span>Adjust Stock</span>
              </button>
              <button
                onClick={() => {
                  navigateToTab('mtn-sandbox');
                  setIsQuickActionsOpen(false);
                }}
                className="admin-nav-item"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                <Zap size={16} color="var(--admin-gold-dark)" />
                <span>MTN Sandbox Test</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            style={{
              position: 'relative',
              background: 'var(--admin-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--admin-text-primary)',
            }}
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--admin-error)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '340px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                border: '1px solid var(--admin-border)',
                padding: '1rem',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--admin-border-light)',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recent Notifications</span>
                <button
                  onClick={() => {
                    navigateToTab('notifications');
                    setIsNotificationsOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--admin-amethyst)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    background: 'var(--admin-bg)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--admin-success)', display: 'flex', gap: '4px' }}>
                    <CheckCircle2 size={14} /> MTN Payment of $964 Verified
                  </div>
                  <div style={{ color: 'var(--admin-text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                    Order #FURN-2026-000103 by Marc Cyubahiro
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    background: 'var(--admin-bg)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--admin-warning)', display: 'flex', gap: '4px' }}>
                    <Clock size={14} /> Low Stock: Teak Outdoor Set (6 units)
                  </div>
                  <div style={{ color: 'var(--admin-text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                    Reorder recommended for outdoor catalog
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    background: 'var(--admin-bg)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--admin-error)', display: 'flex', gap: '4px' }}>
                    <AlertCircle size={14} /> Payment Failed: #FURN-2026-000105
                  </div>
                  <div style={{ color: 'var(--admin-text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                    Insufficient funds on MoMo account
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staff Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
            }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--admin-amethyst)',
              }}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--admin-amethyst)' }}>
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown size={14} color="var(--admin-text-muted)" />
          </button>

          {isProfileOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '220px',
                background: '#FFFFFF',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid var(--admin-border)',
                padding: '0.5rem',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--admin-border-light)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{currentUser.email}</div>
              </div>

              <button
                onClick={() => {
                  navigateToTab('settings');
                  setIsProfileOpen(false);
                }}
                className="admin-nav-item"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                Store Settings
              </button>

              <button
                onClick={() => {
                  navigateToTab('audit-logs');
                  setIsProfileOpen(false);
                }}
                className="admin-nav-item"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                Audit Logs
              </button>

              <div style={{ borderTop: '1px solid var(--admin-border-light)', margin: '0.35rem 0' }} />

              {!IS_ADMIN_MODE && (
                <button
                  onClick={() => setIsAdminView(false)}
                  className="admin-nav-item"
                  style={{ color: 'var(--admin-plum)' }}
                >
                  <Store size={16} />
                  <span>Return to Storefront</span>
                </button>
              )}

              <button
                onClick={async () => {
                  setIsProfileOpen(false);
                  await logout();
                }}
                className="admin-nav-item"
                style={{ color: '#EF4444' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
