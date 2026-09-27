import { Printer, X } from 'lucide-react';

export function PrintableInvoice({
  order,
  payment,
  onClose,
}: {
  order: any;
  payment?: any;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="admin-card"
        style={{
          width: '100%',
          maxWidth: '800px',
          padding: '2.5rem',
          background: '#FFFFFF',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Print Bar (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--admin-border)',
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
            Printable Customer Invoice
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="admin-btn admin-btn-primary">
              <Printer size={16} />
              <span>Print Invoice</span>
            </button>
            <button onClick={onClose} className="admin-btn admin-btn-secondary">
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Invoice Printable Content */}
        <div id="invoice-content" style={{ color: '#1A1A1A', fontFamily: 'system-ui, sans-serif' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.1em', color: '#2B1030' }}>
                FURNITURA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                FURNITURA Rwanda Ltd. • Luxury Commerce
                <br />
                Boulevard de la Révolution, Kigali Heights Suite 402
                <br />
                Kigali, Rwanda • concierge@furnitura.luxury
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2B1030' }}>INVOICE</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>
                #{order.orderNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: order.paymentStatus === 'SUCCESSFUL' ? '#065F46' : '#92400E', marginTop: '4px' }}>
                PAYMENT: {order.paymentStatus}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '2px solid #E8E1ED', margin: '1.5rem 0' }} />

          {/* Billed To & Shipped To */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>
                BILLED TO / CUSTOMER:
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{order.customer.fullName}</div>
              <div style={{ color: '#444' }}>{order.customer.phone}</div>
              <div style={{ color: '#444' }}>{order.customer.email}</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>
                DELIVERY DESTINATION:
              </div>
              <div style={{ fontWeight: 600 }}>{order.customer.address}</div>
              {(order.customer.district || order.customer.province) && (
                <div style={{ color: '#444' }}>
                  {order.customer.sector ? `${order.customer.sector}, ` : ''}
                  {order.customer.district ? `${order.customer.district}, ` : ''}
                  {order.customer.province || ''}
                </div>
              )}
              {order.deliveryZoneName && (
                <div style={{ fontSize: '0.75rem', color: '#7B2CBF', fontWeight: 600, marginTop: '2px' }}>
                  Zone: {order.deliveryZoneName}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#FAF8FB', borderBottom: '2px solid #DDD' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Product Description</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>SKU</th>
                <th style={{ textAlign: 'center', padding: '0.75rem' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Unit Price</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                    {item.name}
                    {item.colorName && <span style={{ color: '#666', fontWeight: 400 }}> ({item.colorName})</span>}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#666' }}>{item.sku || 'N/A'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>${item.price.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700 }}>
                    ${item.subtotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Subtotal:</span>
                <span>${order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span>-${order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Delivery:</span>
                <span>{order.shippingFee > 0 ? `$${order.shippingFee}` : 'Free'}</span>
              </div>
              {order.whiteGloveFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>White-Glove Assembly:</span>
                  <span>${order.whiteGloveFee}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: '#2B1030',
                  paddingTop: '0.5rem',
                  borderTop: '2px solid #2B1030',
                }}
              >
                <span>Total:</span>
                <span>${order.total.toLocaleString()} {order.currency}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div style={{ background: '#FAF8FB', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E8E1ED', fontSize: '0.8rem', color: '#555' }}>
            <div style={{ fontWeight: 700, color: '#2B1030', marginBottom: '4px' }}>
              Payment Information
            </div>
            <div>
              Method: MTN MoMo Sandbox • Account: {payment?.phoneNumberMasked || order.customer.phone}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '2px' }}>
              Ref: {order.paymentReferenceId || payment?.mtnReferenceId || 'N/A'}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: '2rem' }}>
            Thank you for selecting FURNITURA. For inquiries, contact concierge@furnitura.luxury.
          </div>
        </div>
      </div>
    </div>
  );
}
