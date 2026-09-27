import { useState, useEffect } from 'react';
import {
  CreditCard,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { fetchAdminAnalytics } from '../../utils/adminApi';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAnalytics();
      if (res.success && res.metrics) {
        setAnalytics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading && !analytics) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Compiling commerce analytics...</div>;
  }

  const metrics = analytics || {
    totalRevenue: 0,
    totalOrders: 0,
    paidOrdersCount: 0,
    averageOrderValue: 0,
    categoryBreakdown: [],
    topProducts: [],
    paymentConversion: { attempts: 0, successful: 0, failed: 0, rejected: 0, successRate: 100 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="admin-kpi-card">
          <span className="admin-kpi-title">Gross Revenue (Authoritative)</span>
          <div className="admin-kpi-value">${metrics.totalRevenue.toLocaleString()}</div>
          <div className="admin-kpi-sub">Calculated strictly from paid orders</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-title">Average Order Value (AOV)</span>
          <div className="admin-kpi-value">${metrics.averageOrderValue.toLocaleString()}</div>
          <div className="admin-kpi-sub">Across {metrics.paidOrdersCount} completed orders</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-title">MoMo Gateway Success Rate</span>
          <div className="admin-kpi-value" style={{ color: 'var(--admin-success)' }}>
            {metrics.paymentConversion.successRate}%
          </div>
          <div className="admin-kpi-sub">
            {metrics.paymentConversion.successful} of {metrics.paymentConversion.attempts} attempts
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown + Payment Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Category Revenue Distribution */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <PieChart size={18} color="var(--admin-amethyst)" />
              <span>Revenue by Room Category</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {metrics.categoryBreakdown.map((cat: any, idx: number) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>
                    ${cat.value.toLocaleString()} ({cat.percent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E8E1ED', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percent}%`,
                      background: 'linear-gradient(90deg, var(--admin-plum) 0%, var(--admin-amethyst) 100%)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Operations Funnel */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <CreditCard size={18} color="var(--admin-gold-dark)" />
              <span>MTN MoMo Payment Operations</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#065F46' }}>
                <CheckCircle2 size={18} />
                <span>Verified Successful</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#065F46' }}>
                {metrics.paymentConversion.successful}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#991B1B' }}>
                <AlertCircle size={18} />
                <span>Failed / Insufficient Funds</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#991B1B' }}>
                {metrics.paymentConversion.failed}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#92400E' }}>
                <AlertCircle size={18} />
                <span>Customer Declined / Timeout</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#92400E' }}>
                {metrics.paymentConversion.rejected}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products Showcase */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--admin-gold)" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
            Top Performing Luxury Pieces (By Revenue)
          </h3>
        </div>

        <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Piece</th>
                <th>Units Ordered</th>
                <th>Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topProducts.map((p: any, idx: number) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={p.image || '/hero-chair.jpg'}
                        alt={p.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.quantity} units</td>
                  <td style={{ fontWeight: 800, color: 'var(--admin-plum)', fontSize: '0.95rem' }}>
                    ${p.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
