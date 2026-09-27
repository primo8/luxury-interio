import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminCustomers, fetchAdminCustomerDetail, getExportDownloadUrl } from '../../utils/adminApi';

export function CustomersManager() {
  const { selectedCustomerId, setSelectedCustomerId } = useAdmin();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Customer Detail Drawer
  const [selectedCustomerData, setSelectedCustomerData] = useState<{
    customer: any;
    orders: any[];
  } | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await fetchAdminCustomers(params);
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchAdminCustomerDetail(selectedCustomerId).then((res) => {
        if (res.success && res.customer) {
          setSelectedCustomerData({ customer: res.customer, orders: res.orders || [] });
        }
      });
    }
  }, [selectedCustomerId]);

  const handleOpenCustomer = async (id: string) => {
    try {
      const res = await fetchAdminCustomerDetail(id);
      if (res.success && res.customer) {
        setSelectedCustomerData({ customer: res.customer, orders: res.orders || [] });
      }
    } catch (err) {
      console.error('Failed to open customer:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Export Bar */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }}
            />
            <input
              type="text"
              className="admin-input"
              placeholder="Search by customer name, email, phone, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="">All Customer Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="VIP">VIP</option>
            </select>

            <a
              href={getExportDownloadUrl('customers')}
              download
              className="admin-btn admin-btn-secondary"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Delivery Region</th>
                <th>Total Orders</th>
                <th>Lifetime Spend</th>
                <th>Customer Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700 }}>No customer records found.</div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} onClick={() => handleOpenCustomer(c.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{c.fullName}</div>
                      {c.tags && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                          {c.tags.map((t: string, idx: number) => (
                            <span key={idx} style={{ fontSize: '0.65rem', background: 'var(--admin-bg)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: 'var(--admin-text-secondary)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{c.phone}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>{c.email}</td>
                    <td>{c.province || c.district || 'Kigali'}</td>
                    <td style={{ fontWeight: 600 }}>{c.totalOrders} orders</td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>
                      ${c.totalSpent.toLocaleString()}
                    </td>
                    <td>
                      <span className={`admin-status-badge ${c.status === 'VIP' ? 'paid' : 'active'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomer(c.id);
                        }}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        <Eye size={14} />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomerData && (
        <div className="admin-drawer-backdrop" onClick={() => { setSelectedCustomerData(null); setSelectedCustomerId?.(null); }}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--admin-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FAF8FB',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-plum)' }}>
                  {selectedCustomerData.customer.fullName}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Customer Profile & Purchase History
                </div>
              </div>

              <button
                onClick={() => { setSelectedCustomerData(null); setSelectedCustomerId?.(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Profile Card */}
              <div className="admin-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span className="admin-label">Phone</span>
                    <div style={{ fontWeight: 600 }}>{selectedCustomerData.customer.phone}</div>
                  </div>
                  <div>
                    <span className="admin-label">Email</span>
                    <div style={{ fontWeight: 600 }}>{selectedCustomerData.customer.email}</div>
                  </div>
                  <div>
                    <span className="admin-label">Lifetime Value</span>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--admin-plum)' }}>
                      ${selectedCustomerData.customer.totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="admin-label">Total Orders</span>
                    <div style={{ fontWeight: 700 }}>{selectedCustomerData.customer.totalOrders} Completed</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span className="admin-label">Address</span>
                    <div>{selectedCustomerData.customer.address}</div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="admin-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                  Order History ({selectedCustomerData.orders.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedCustomerData.orders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid var(--admin-border-light)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--admin-plum)' }}>
                          #{o.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                          {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} items
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`admin-status-badge ${o.orderStatus.toLowerCase()}`}>
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>${o.total.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
