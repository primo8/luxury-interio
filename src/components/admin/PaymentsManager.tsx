import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  Download,
  Eye,
  ShieldCheck,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  fetchAdminPayments,
  fetchAdminPaymentDetail,
  reconcileAdminPayment,
  getExportDownloadUrl,
} from '../../utils/adminApi';

export function PaymentsManager() {
  const { selectedPaymentId, setSelectedPaymentId, showAdminToast, navigateToTab } = useAdmin();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Active Payment Detail State
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await fetchAdminPayments(params);
      if (res.success) {
        setPayments(res.payments || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [search, statusFilter, page]);

  useEffect(() => {
    if (selectedPaymentId) {
      fetchAdminPaymentDetail(selectedPaymentId).then((res) => {
        if (res.success && res.payment) {
          setSelectedPayment(res.payment);
        }
      });
    }
  }, [selectedPaymentId]);

  const handleOpenPayment = async (paymentId: string) => {
    try {
      const res = await fetchAdminPaymentDetail(paymentId);
      if (res.success && res.payment) {
        setSelectedPayment(res.payment);
      }
    } catch (err) {
      console.error('Failed to load payment detail:', err);
    }
  };

  const handleReconcile = async () => {
    if (!selectedPayment) return;
    setIsReconciling(true);
    try {
      const res = await reconcileAdminPayment(selectedPayment.paymentId);
      if (res.success) {
        showAdminToast(res.message || 'Payment reconciled with MTN Gateway', 'success');
        setSelectedPayment(res.payment);
        loadPayments();
      } else {
        showAdminToast(res.message || 'Reconciliation failed', 'error');
      }
    } catch (err) {
      showAdminToast('Server error during reconciliation', 'error');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Filter Bar */}
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
              placeholder="Search by Payment ID, Order ID, MTN Ref, Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: '180px' }}
            >
              <option value="">All Payment Statuses</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <a
              href={getExportDownloadUrl('payments')}
              download
              className="admin-btn admin-btn-secondary"
              title="Export payments to CSV"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </a>

            <button onClick={loadPayments} className="admin-btn admin-btn-secondary" title="Refresh list">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            MTN MoMo Transactions
          </div>
          <div className="admin-env-pill sandbox" style={{ fontSize: '0.7rem' }}>
            MTN SANDBOX GATEWAY ACTIVE
          </div>
        </div>

        <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>MTN Reference ID</th>
                <th>Amount</th>
                <th>Phone (Masked)</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
                    <CreditCard size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>No payment transactions found.</div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.paymentId} onClick={() => handleOpenPayment(p.paymentId)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>{p.paymentId}</td>
                    <td style={{ fontWeight: 600 }}>{p.orderId}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                      {p.mtnReferenceId.slice(0, 18)}...
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                      ${p.amount.toLocaleString()} {p.currency}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{p.phoneNumberMasked}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706', background: '#FEF3C7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        MTN MoMo
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPayment(p.paymentId);
                        }}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Page {page} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Detail Modal / Drawer */}
      {selectedPayment && (
        <div className="admin-drawer-backdrop" onClick={() => { setSelectedPayment(null); setSelectedPaymentId?.(null); }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--admin-plum)' }}>
                    {selectedPayment.paymentId}
                  </h3>
                  <span className={`admin-status-badge ${selectedPayment.status.toLowerCase()}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                  Order #{selectedPayment.orderId} • {selectedPayment.provider}
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Payment Reconciliation Action Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 30, 78, 0.04) 0%, rgba(212, 175, 55, 0.06) 100%)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--admin-plum)' }}>
                  <ShieldCheck size={18} />
                  <span>Server-Side Payment Reconciliation</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', margin: '0 0 1rem' }}>
                  Query the live MTN MoMo Collection status endpoint securely via backend without exposing API secrets to the browser.
                </p>

                <button
                  onClick={handleReconcile}
                  disabled={isReconciling}
                  className="admin-btn admin-btn-gold"
                  style={{ width: '100%' }}
                >
                  <RefreshCw size={16} className={isReconciling ? 'animate-spin' : ''} />
                  <span>{isReconciling ? 'Querying MTN Gateway...' : 'CHECK PAYMENT STATUS / RECONCILE'}</span>
                </button>
              </div>

              {/* Transaction Technical Metadata */}
              <div className="admin-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                  Transaction Parameters
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.825rem' }}>
                  <div>
                    <span className="admin-label">Amount & Currency</span>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-plum)' }}>
                      ${selectedPayment.amount.toLocaleString()} {selectedPayment.currency}
                    </div>
                  </div>

                  <div>
                    <span className="admin-label">Target Environment</span>
                    <div style={{ fontWeight: 600 }}>SANDBOX (momodeveloper.mtn.com)</div>
                  </div>

                  <div>
                    <span className="admin-label">Masked MSISDN</span>
                    <div style={{ fontWeight: 600 }}>{selectedPayment.phoneNumberMasked}</div>
                  </div>

                  <div>
                    <span className="admin-label">Financial Transaction ID</span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--admin-success)' }}>
                      {selectedPayment.financialTransactionId || 'Pending Gateway ID'}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span className="admin-label">MTN UUID Reference ID (X-Reference-Id)</span>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        background: 'var(--admin-bg)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        wordBreak: 'break-all',
                        fontSize: '0.75rem',
                      }}
                    >
                      {selectedPayment.mtnReferenceId}
                    </div>
                  </div>

                  {selectedPayment.failureReason && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span className="admin-label" style={{ color: 'var(--admin-error)' }}>
                        Gateway Failure Reason
                      </span>
                      <div
                        style={{
                          background: 'var(--admin-error-bg)',
                          border: '1px solid #FECACA',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          color: '#991B1B',
                          fontSize: '0.8rem',
                        }}
                      >
                        {selectedPayment.failureReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Order Jump */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Linked Order #{selectedPayment.orderId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>
                    Items: {selectedPayment.itemsSummary || 'Luxury Furniture Collection'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigateToTab('orders', selectedPayment.orderId);
                    setSelectedPayment(null);
                  }}
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                >
                  <span>Open Order</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
