import { useState } from 'react';
import {
  X,
  Printer,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  Send,
  Ban,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { updateAdminOrderStatus, addAdminOrderNote, cancelAdminOrder } from '../../utils/adminApi';
import { PrintableInvoice } from './PrintableInvoice';

export function OrderDetailModal({
  order,
  payment,
  customerProfile,
  onClose,
  onOrderUpdated,
}: {
  order: any;
  payment?: any;
  customerProfile?: any;
  onClose: () => void;
  onOrderUpdated: () => void;
}) {
  const { showAdminToast } = useAdmin();
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [staffNote, setStaffNote] = useState<string>(order.staffNotes || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);

  // Allowed transitions
  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
    PROCESSING: ['READY_FOR_DELIVERY', 'CANCELLED', 'REFUNDED'],
    READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'CANCELLED', 'REFUNDED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
    DELIVERED: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: [],
  };

  const nextTransitions = ALLOWED_TRANSITIONS[order.orderStatus] || [];

  const handleStatusUpdate = async () => {
    if (!selectedNewStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateAdminOrderStatus(order.id, selectedNewStatus, statusNote);
      if (res.success) {
        showAdminToast(`Order status transitioned to ${selectedNewStatus.replace(/_/g, ' ')}`, 'success');
        setSelectedNewStatus('');
        setStatusNote('');
        onOrderUpdated();
      } else {
        showAdminToast(res.message || res.error || 'Status update failed', 'error');
      }
    } catch (err) {
      showAdminToast('Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveStaffNote = async () => {
    if (!staffNote.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await addAdminOrderNote(order.id, staffNote);
      if (res.success) {
        showAdminToast('Staff note recorded successfully', 'success');
        onOrderUpdated();
      }
    } catch (err) {
      showAdminToast('Failed to save staff note', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Please provide a cancellation reason:');
    if (!reason) return;
    try {
      const res = await cancelAdminOrder(order.id, reason);
      if (res.success) {
        showAdminToast('Order has been cancelled.', 'warning');
        onOrderUpdated();
      } else {
        showAdminToast(res.error || 'Cancellation failed', 'error');
      }
    } catch (err) {
      showAdminToast('Error cancelling order', 'error');
    }
  };

  return (
    <div className="admin-drawer-backdrop" onClick={onClose}>
      <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--admin-plum)' }}>
                Order #{order.orderNumber}
              </h2>
              <span className={`admin-status-badge ${order.orderStatus.toLowerCase()}`}>
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsPrintingInvoice(true)}
              className="admin-btn admin-btn-sm admin-btn-secondary"
              title="Print Order Invoice"
            >
              <Printer size={16} />
              <span>Invoice</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--admin-text-muted)',
                padding: '0.25rem',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Workflow Action Box */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: 'var(--admin-shadow-sm)',
            }}
          >
            <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
              Order Status Transition Control
            </h4>

            {nextTransitions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    className="admin-select"
                    value={selectedNewStatus}
                    onChange={(e) => setSelectedNewStatus(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select next workflow state...</option>
                    {nextTransitions.map((st) => (
                      <option key={st} value={st}>
                        Advance to: {st.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleStatusUpdate}
                    disabled={!selectedNewStatus || isUpdatingStatus}
                    className="admin-btn admin-btn-primary"
                    style={{ opacity: selectedNewStatus ? 1 : 0.6 }}
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                </div>

                {selectedNewStatus && (
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Optional staff notes for this transition..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                This order is in a finalized terminal state ({order.orderStatus}).
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: 'var(--admin-shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <CreditCard size={18} color="var(--admin-gold-dark)" />
                <span>Payment Details</span>
              </div>
              <span className={`admin-status-badge ${order.paymentStatus.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.825rem' }}>
              <div>
                <span className="admin-label">Provider</span>
                <div style={{ fontWeight: 600 }}>MTN MoMo Sandbox</div>
              </div>
              <div>
                <span className="admin-label">Amount Paid</span>
                <div style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>
                  ${order.total.toLocaleString()} {order.currency}
                </div>
              </div>
              <div>
                <span className="admin-label">MTN Reference ID</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                  {order.paymentReferenceId || payment?.mtnReferenceId || 'N/A'}
                </div>
              </div>
              <div>
                <span className="admin-label">Customer MoMo Phone</span>
                <div style={{ fontWeight: 600 }}>
                  {payment?.phoneNumberMasked || order.customer.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: 'var(--admin-shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <User size={18} color="var(--admin-amethyst)" />
                <span>Customer & Delivery Destination</span>
              </div>
              {customerProfile?.status === 'VIP' && (
                <span className="admin-status-badge" style={{ background: 'var(--admin-gold-light)', color: '#664D03' }}>
                  VIP CLIENT
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.customer.fullName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-text-secondary)' }}>
                <Phone size={14} />
                <span>{order.customer.phone}</span>
                <span style={{ color: 'var(--admin-text-muted)' }}>•</span>
                <Mail size={14} />
                <span>{order.customer.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--admin-text-secondary)', marginTop: '0.25rem' }}>
                <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} color="var(--admin-plum)" />
                <div>
                  <div>{order.customer.address}</div>
                  {(order.customer.district || order.customer.province) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                      {order.customer.sector ? `${order.customer.sector}, ` : ''}
                      {order.customer.district ? `${order.customer.district}, ` : ''}
                      {order.customer.province || ''}
                    </div>
                  )}
                </div>
              </div>

              {order.customer.notes && (
                <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.85rem', background: 'var(--admin-bg)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                  <strong>Customer Instructions:</strong> {order.customer.notes}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: 'var(--admin-shadow-sm)',
            }}
          >
            <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', fontWeight: 700 }}>
              Order Items ({order.items.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0',
                    borderBottom: idx < order.items.length - 1 ? '1px solid var(--admin-border-light)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={item.image || '/hero-chair.jpg'}
                      alt={item.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                        SKU: {item.sku || 'FUR-GEN'} • Color: {item.colorName || 'Royal Plum'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      ${item.subtotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                      {item.quantity} x ${item.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary Breakdown */}
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--admin-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Subtotal</span>
                <span>${order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-success)' }}>
                  <span>Discount ({order.couponCode || 'Promo'})</span>
                  <span>-${order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Delivery Fee</span>
                <span>{order.shippingFee > 0 ? `$${order.shippingFee}` : 'Free'}</span>
              </div>
              {order.whiteGloveFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>White-Glove VIP Assembly</span>
                  <span>${order.whiteGloveFee}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: 'var(--admin-plum)',
                  marginTop: '0.35rem',
                  paddingTop: '0.35rem',
                  borderTop: '1px dashed var(--admin-border)',
                }}
              >
                <span>Total</span>
                <span>${order.total.toLocaleString()} {order.currency}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: 'var(--admin-shadow-sm)',
            }}
          >
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700 }}>
              Order Lifecycle Timeline
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '6px',
                  bottom: '6px',
                  left: '4px',
                  width: '2px',
                  background: 'var(--admin-border)',
                }}
              />

              {order.timeline.map((event: any, idx: number) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.45rem',
                      top: '3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: idx === order.timeline.length - 1 ? 'var(--admin-plum)' : 'var(--admin-gold)',
                      border: '2px solid #FFFFFF',
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{event.event}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--admin-text-muted)' }}>
                    {event.actor} • {new Date(event.timestamp).toLocaleString()}
                  </div>
                  {event.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>
                      "{event.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Staff Internal Notes */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: 'var(--admin-shadow-sm)',
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
              Internal Staff Notes
            </h4>
            <textarea
              className="admin-textarea"
              rows={3}
              placeholder="Add confidential customer or logistics notes..."
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSaveStaffNote}
                disabled={isAddingNote}
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                <Send size={14} />
                <span>Save Note</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
            <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelOrder}
                className="admin-btn admin-btn-sm admin-btn-danger"
              >
                <Ban size={14} />
                <span>Cancel Order</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Printable Invoice Modal Component */}
      {isPrintingInvoice && (
        <PrintableInvoice order={order} payment={payment} onClose={() => setIsPrintingInvoice(false)} />
      )}
    </div>
  );
}
