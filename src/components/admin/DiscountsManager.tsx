import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  X,
  Save,
  Pause,
  Play,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  fetchAdminDiscounts,
  createAdminDiscount,
  updateAdminDiscountStatus,
} from '../../utils/adminApi';

export function DiscountsManager() {
  const { showAdminToast } = useAdmin();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: 20,
    minOrderValue: 200,
    maxDiscount: 150,
    usageLimit: 100,
    perCustomerLimit: 1,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDiscounts();
      if (res.success) {
        setDiscounts(res.discounts || []);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await updateAdminDiscountStatus(id, nextStatus);
      if (res.success) {
        showAdminToast(`Coupon status set to ${nextStatus}`, 'success');
        loadDiscounts();
      }
    } catch (err) {
      showAdminToast('Failed to update discount status', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.name || !newDiscount.value) {
      showAdminToast('Please fill all required discount fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await createAdminDiscount(newDiscount);
      if (res.success) {
        showAdminToast(`Discount code ${newDiscount.code.toUpperCase()} created!`, 'success');
        setIsCreateOpen(false);
        setNewDiscount({
          name: '',
          code: '',
          type: 'percentage',
          value: 20,
          minOrderValue: 200,
          maxDiscount: 150,
          usageLimit: 100,
          perCustomerLimit: 1,
          startDate: new Date().toISOString().slice(0, 16),
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
        });
        loadDiscounts();
      } else {
        showAdminToast(res.message || 'Failed to create discount', 'error');
      }
    } catch (err) {
      showAdminToast('Server error creating coupon', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="admin-kpi-card">
          <span className="admin-kpi-title">Active Coupons</span>
          <div className="admin-kpi-value" style={{ color: 'var(--admin-success)' }}>
            {summary?.activeCount || 0}
          </div>
          <div className="admin-kpi-sub">Valid at customer checkout</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-title">Total Redemptions</span>
          <div className="admin-kpi-value">{summary?.totalUsage || 0}</div>
          <div className="admin-kpi-sub">Times applied across orders</div>
        </div>

        <div className="admin-kpi-card">
          <span className="admin-kpi-title">Total Campaign Codes</span>
          <div className="admin-kpi-value">{discounts.length}</div>
          <div className="admin-kpi-sub">Managed promotional campaigns</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
              Promotional Campaigns & Coupon Codes
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
              Validated server-side at checkout with usage limit enforcement
            </div>
          </div>

          <button onClick={() => setIsCreateOpen(true)} className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Create Discount</span>
          </button>
        </div>

        <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Campaign Name</th>
                <th>Discount Value</th>
                <th>Min. Order</th>
                <th>Validity Period</th>
                <th>Usage Progress</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading discount rules...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
                    <Tag size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700 }}>No discount codes created yet.</div>
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          background: 'rgba(74, 30, 78, 0.08)',
                          color: 'var(--admin-plum)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          border: '1px dashed var(--admin-plum-light)',
                        }}
                      >
                        {d.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ fontWeight: 800, color: 'var(--admin-plum)' }}>
                      {d.value}
                      {d.type === 'percentage' ? '%' : ' USD'} OFF
                    </td>
                    <td>${d.minOrderValue.toLocaleString()}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                      {new Date(d.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                      {new Date(d.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', width: '80px', background: '#E8E1ED', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, (d.usageCount / d.usageLimit) * 100)}%`,
                              background: 'var(--admin-plum)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {d.usageCount} / {d.usageLimit}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${d.status.toLowerCase()}`}>{d.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleStatusToggle(d.id, d.status)}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        {d.status === 'ACTIVE' ? (
                          <>
                            <Pause size={14} />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Discount Modal */}
      {isCreateOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div
            className="admin-card"
            style={{ width: '100%', maxWidth: '540px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-plum)' }}>
                  Create Promotional Discount Code
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Validated securely on the backend
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Campaign Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  placeholder="e.g., VIP Autumn Luxury 20%"
                  value={newDiscount.name}
                  onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    placeholder="e.g., LUXURY20"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div>
                  <label className="admin-label">Discount Type</label>
                  <select
                    className="admin-select"
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($ USD)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Discount Value *</label>
                  <input
                    type="number"
                    className="admin-input"
                    required
                    min="1"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="admin-label">Min. Order Value ($)</label>
                  <input
                    type="number"
                    className="admin-input"
                    min="0"
                    value={newDiscount.minOrderValue}
                    onChange={(e) => setNewDiscount({ ...newDiscount, minOrderValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Total Usage Limit</label>
                  <input
                    type="number"
                    className="admin-input"
                    min="1"
                    value={newDiscount.usageLimit}
                    onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>

                <div>
                  <label className="admin-label">Max Discount Cap ($)</label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="Optional cap"
                    value={newDiscount.maxDiscount}
                    onChange={(e) => setNewDiscount({ ...newDiscount, maxDiscount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="admin-btn admin-btn-primary">
                  <Save size={16} />
                  <span>{isSaving ? 'Creating...' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
