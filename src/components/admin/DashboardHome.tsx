import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminDashboard } from '../../utils/adminApi';

export function DashboardHome() {
  const { navigateToTab, setSelectedOrderId } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '12m'>('7d');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 600 }}>Loading FURNITURA Commerce Command Center...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    revenue: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
    orders: { total: 0, paid: 0, processing: 0, delivered: 0, cancelled: 0 },
    payments: { successful: 0, pending: 0, failed: 0, successRate: 100 },
    products: { total: 12, inStock: 10, lowStock: 2, outOfStock: 0 },
  };

  const attentionItems = data?.attentionRequired || [];
  const recentOrders = data?.recentOrders || [];
  const revenueChart = data?.revenueChart || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Attention Required Operational Callout Bar */}
      {attentionItems.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(74, 30, 78, 0.05) 0%, rgba(212, 175, 55, 0.08) 100%)',
            border: '1px solid rgba(74, 30, 78, 0.15)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <AlertTriangle size={18} color="var(--admin-warning)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--admin-text-primary)' }}>
              Operational Attention Required ({attentionItems.length})
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {attentionItems.map((item: any) => (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--admin-shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background:
                        item.severity === 'error'
                          ? 'var(--admin-error)'
                          : item.severity === 'warning'
                          ? 'var(--admin-warning)'
                          : 'var(--admin-info)',
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                    {item.title}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (item.link.includes('payments')) navigateToTab('payments');
                    else if (item.link.includes('inventory')) navigateToTab('inventory');
                    else if (item.link.includes('orders')) navigateToTab('orders');
                    else if (item.link.includes('discounts')) navigateToTab('discounts');
                  }}
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  {item.actionLabel} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Top Executive KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Total Revenue */}
        <div className="admin-kpi-card" onClick={() => navigateToTab('analytics')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="admin-kpi-title">Total Revenue</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--admin-gold-dark)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">${kpis.revenue.total.toLocaleString()}</div>
          <div className="admin-kpi-sub">
            <TrendingUp size={14} color="var(--admin-success)" />
            <span style={{ color: 'var(--admin-success)', fontWeight: 700 }}>+18.4%</span> vs last period
          </div>
        </div>

        {/* Orders Active */}
        <div className="admin-kpi-card" onClick={() => navigateToTab('orders')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="admin-kpi-title">Active Orders</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(74, 30, 78, 0.1)', color: 'var(--admin-plum)' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.orders.total}</div>
          <div className="admin-kpi-sub">
            <span style={{ fontWeight: 600, color: 'var(--admin-amethyst)' }}>
              {kpis.orders.paid + kpis.orders.processing} processing
            </span>
            <span>• {kpis.orders.delivered} delivered</span>
          </div>
        </div>

        {/* MTN MoMo Payments */}
        <div className="admin-kpi-card" onClick={() => navigateToTab('payments')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="admin-kpi-title">MoMo Gateway Success</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--admin-success)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.payments.successRate}%</div>
          <div className="admin-kpi-sub">
            <CheckCircle2 size={14} color="var(--admin-success)" />
            <span>{kpis.payments.successful} verified</span>
            {kpis.payments.pending > 0 && <span style={{ color: 'var(--admin-warning)', fontWeight: 600 }}>• {kpis.payments.pending} pending</span>}
          </div>
        </div>

        {/* Product Catalog & Stock */}
        <div className="admin-kpi-card" onClick={() => navigateToTab('inventory')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="admin-kpi-title">Catalog Inventory</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(123, 44, 191, 0.1)', color: 'var(--admin-amethyst)' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.products.total} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--admin-text-muted)' }}>Items</span></div>
          <div className="admin-kpi-sub">
            {kpis.products.lowStock > 0 ? (
              <span style={{ color: 'var(--admin-warning)', fontWeight: 700 }}>
                ⚠️ {kpis.products.lowStock} items low stock
              </span>
            ) : (
              <span style={{ color: 'var(--admin-success)' }}>All items well-stocked</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Revenue Trend Visualizer & Breakdown */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">
              <TrendingUp size={20} color="var(--admin-plum)" />
              <span>Revenue & Order Velocity</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>
              Real-time authoritative commerce transactions captured via MTN MoMo Gateway
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--admin-bg)', padding: '0.25rem', borderRadius: '8px' }}>
            {(['7d', '30d', '3m', '12m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: timeRange === r ? '#FFFFFF' : 'transparent',
                  color: timeRange === r ? 'var(--admin-plum)' : 'var(--admin-text-secondary)',
                  boxShadow: timeRange === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Chart Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', height: '200px', padding: '1.5rem 0 0.5rem' }}>
          {revenueChart.map((bar: any, idx: number) => {
            const maxRev = Math.max(...revenueChart.map((b: any) => b.revenue), 2000);
            const heightPct = Math.max(12, (bar.revenue / maxRev) * 100);
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-plum)', marginBottom: '0.35rem' }}>
                  ${bar.revenue > 0 ? bar.revenue.toLocaleString() : '0'}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '48px',
                    height: `${heightPct}%`,
                    background:
                      bar.revenue > 0
                        ? 'linear-gradient(180deg, var(--admin-plum-light) 0%, var(--admin-plum) 100%)'
                        : '#E8E1ED',
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'height 0.4s ease',
                  }}
                  title={`${bar.label}: $${bar.revenue} (${bar.ordersCount} orders)`}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
                  {bar.label.split(',')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Orders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">
              <ShoppingBag size={20} color="var(--admin-amethyst)" />
              <span>Recent Commerce Orders</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>
              Latest customer orders awaiting fulfillment or delivery
            </div>
          </div>

          <button
            onClick={() => navigateToTab('orders')}
            className="admin-btn admin-btn-sm admin-btn-secondary"
          >
            <span>View All Orders</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Items Ordered</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Fulfillment</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)' }}>
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>
                      #{order.orderNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{order.customer.phone}</div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                      ${order.total.toLocaleString()}
                    </td>
                    <td>
                      <span className={`admin-status-badge ${order.paymentStatus.toLowerCase()}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          navigateToTab('orders', order.id);
                        }}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        title="Open Order Detail"
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
