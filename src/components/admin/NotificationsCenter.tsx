import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  fetchAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '../../utils/adminApi';

export function NotificationsCenter() {
  const { navigateToTab, showAdminToast, refreshDashboardStats } = useAdmin();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markAdminNotificationRead(id);
      loadNotifs();
      refreshDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      showAdminToast('All notifications marked as read', 'success');
      loadNotifs();
      refreshDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filterUnread ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Operational Notifications & Alerts ({notifications.length})
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Real-time commerce alerts for orders, MoMo payments, stock levels, and customer reviews
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterUnread}
                onChange={(e) => setFilterUnread(e.target.checked)}
              />
              <span>Unread Only</span>
            </label>

            <button onClick={handleMarkAllRead} className="admin-btn admin-btn-sm admin-btn-secondary">
              <Check size={14} />
              <span>Mark All Read</span>
            </button>

            <button onClick={loadNotifs} className="admin-btn admin-btn-sm admin-btn-secondary">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 700 }}>No notifications in inbox.</div>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className="admin-card"
              style={{
                padding: '1.25rem',
                borderLeft: n.isRead ? '1px solid var(--admin-border)' : '4px solid var(--admin-plum)',
                background: n.isRead ? '#FFFFFF' : '#FAF8FB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ marginTop: '2px' }}>
                  {n.severity === 'success' ? (
                    <CheckCircle2 size={20} color="var(--admin-success)" />
                  ) : n.severity === 'warning' ? (
                    <Clock size={20} color="var(--admin-warning)" />
                  ) : n.severity === 'error' ? (
                    <AlertCircle size={20} color="var(--admin-error)" />
                  ) : (
                    <Bell size={20} color="var(--admin-info)" />
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: n.isRead ? 600 : 800, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {n.link && (
                  <button
                    onClick={() => {
                      if (!n.isRead) handleMarkRead(n.id);
                      if (n.link.includes('orders')) navigateToTab('orders');
                      else if (n.link.includes('payments')) navigateToTab('payments');
                      else if (n.link.includes('inventory')) navigateToTab('inventory');
                      else if (n.link.includes('reviews')) navigateToTab('reviews');
                    }}
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                  >
                    <span>Inspect</span>
                    <ExternalLink size={13} />
                  </button>
                )}

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                    title="Mark as Read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
