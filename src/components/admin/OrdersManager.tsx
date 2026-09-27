import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Download,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminOrders, fetchAdminOrderDetail, getExportDownloadUrl } from '../../utils/adminApi';
import { OrderDetailModal } from './OrderDetailModal';

export function OrdersManager() {
  const { selectedOrderId, setSelectedOrderId } = useAdmin();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Order Detail Modal State
  const [activeOrderDetail, setActiveOrderDetail] = useState<{
    order: any;
    payment?: any;
    customerProfile?: any;
  } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      };
      if (search.trim()) params.search = search.trim();
      if (orderStatus) params.orderStatus = orderStatus;
      if (paymentStatus) params.paymentStatus = paymentStatus;

      const res = await fetchAdminOrders(params);
      if (res.success) {
        setOrders(res.orders || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, orderStatus, paymentStatus, page]);

  // Open detail if selectedOrderId is set
  useEffect(() => {
    if (selectedOrderId) {
      fetchAdminOrderDetail(selectedOrderId).then((res) => {
        if (res.success && res.order) {
          setActiveOrderDetail({
            order: res.order,
            payment: res.payment,
            customerProfile: res.customerProfile,
          });
        }
      });
    }
  }, [selectedOrderId]);

  const handleOpenOrder = async (orderId: string) => {
    try {
      const res = await fetchAdminOrderDetail(orderId);
      if (res.success && res.order) {
        setActiveOrderDetail({
          order: res.order,
          payment: res.payment,
          customerProfile: res.customerProfile,
        });
      }
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Filter Bar */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }}
            />
            <input
              type="text"
              className="admin-input"
              placeholder="Search by order #, customer name, phone, MTN ref..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="admin-select"
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: '180px' }}
            >
              <option value="">All Order Statuses</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            <select
              className="admin-select"
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: '170px' }}
            >
              <option value="">All Payments</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Export CSV Button */}
            <a
              href={getExportDownloadUrl('orders')}
              download
              className="admin-btn admin-btn-secondary"
              title="Export filtered orders to CSV"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </a>

            <button onClick={loadOrders} className="admin-btn admin-btn-secondary" title="Refresh list">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Orders List ({totalCount})
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            Showing page {page} of {totalPages || 1}
          </div>
        </div>

        <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items Ordered</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Workflow Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
                    <ShoppingBag size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-text-primary)' }}>
                      No orders match your filters.
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Try clearing search parameters or adjusting status filters.
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOpenOrder(order.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>
                      #{order.orderNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.customer.fullName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                      {order.customer.phone}
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                      ${order.total.toLocaleString()} {order.currency}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOrder(order.id);
                        }}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        <Eye size={14} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--admin-border)',
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {activeOrderDetail && (
        <OrderDetailModal
          order={activeOrderDetail.order}
          payment={activeOrderDetail.payment}
          customerProfile={activeOrderDetail.customerProfile}
          onClose={() => {
            setActiveOrderDetail(null);
            setSelectedOrderId(null);
          }}
          onOrderUpdated={() => {
            loadOrders();
            if (activeOrderDetail?.order?.id) {
              handleOpenOrder(activeOrderDetail.order.id);
            }
          }}
        />
      )}
    </div>
  );
}
