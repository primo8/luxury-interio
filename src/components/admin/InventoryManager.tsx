import { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  History,
  RefreshCw,
  X,
  Save,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminInventory, adjustAdminInventory } from '../../utils/adminApi';

export function InventoryManager() {
  const { showAdminToast } = useAdmin();
  const [inventory, setInventory] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('');

  // Stock Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState<any>(null);
  const [quantityDelta, setQuantityDelta] = useState<number>(5);
  const [adjustmentType, setAdjustmentType] = useState<string>('RESTOCK');
  const [reasonText, setReasonText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminInventory();
      if (res.success) {
        setInventory(res.inventory || []);
        setRecentLogs(res.recentLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenAdjust = (item: any) => {
    setAdjustingItem(item);
    setQuantityDelta(5);
    setAdjustmentType('RESTOCK');
    setReasonText('');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || !quantityDelta) return;

    setIsSubmitting(true);
    try {
      const res = await adjustAdminInventory({
        productId: adjustingItem.id,
        quantityChange: quantityDelta,
        adjustmentType,
        reason: reasonText,
      });

      if (res.success) {
        showAdminToast(res.message || 'Inventory updated successfully!', 'success');
        setAdjustingItem(null);
        loadInventory();
      } else {
        showAdminToast(res.message || 'Adjustment failed', 'error');
      }
    } catch (err) {
      showAdminToast('Server error adjusting stock', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      !filterStock ||
      (filterStock === 'low' && item.status === 'LOW_STOCK') ||
      (filterStock === 'out' && item.status === 'OUT_OF_STOCK') ||
      (filterStock === 'in' && item.status === 'IN_STOCK');
    return matchesSearch && matchesFilter;
  });

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
              placeholder="Search by product name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              className="admin-select"
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              style={{ width: '170px' }}
            >
              <option value="">All Stock Statuses</option>
              <option value="low">Low Stock Only</option>
              <option value="out">Out of Stock Only</option>
              <option value="in">In Stock Only</option>
            </select>

            <button onClick={loadInventory} className="admin-btn admin-btn-secondary" title="Refresh inventory">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Product Stock Levels ({filteredItems.length})
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
            Threshold for Low Stock: 10 Units
          </div>
        </div>

        <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Available Units</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading stock metrics...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
                    <Layers size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>No inventory records match filters.</div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 700 }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.sku}</td>
                    <td style={{ color: 'var(--admin-text-secondary)' }}>{item.category}</td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>${item.price.toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: item.currentStock <= 10 ? 'var(--admin-warning)' : 'var(--admin-text-primary)' }}>
                        {item.currentStock} units
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${item.status.toLowerCase()}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                      >
                        <span>Adjust Stock</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Audit Log Section */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <History size={18} color="var(--admin-amethyst)" />
            <span>Stock Adjustment Audit History</span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Qty Delta</th>
                <th>Previous → New</th>
                <th>Reason / Context</th>
                <th>Authorized Actor</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.slice(0, 10).map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.productName}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--admin-bg)' }}>
                      {log.adjustmentType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: log.quantityChange > 0 ? 'var(--admin-success)' : 'var(--admin-error)' }}>
                    {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                    {log.previousStock} → {log.newStock}
                  </td>
                  <td style={{ fontSize: '0.8rem', maxWidth: '240px' }}>{log.reason}</td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.actor}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="admin-modal-backdrop" onClick={() => setAdjustingItem(null)}>
          <div
            className="admin-card"
            style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-plum)' }}>
                  Adjust Stock Quantity
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  {adjustingItem.name} ({adjustingItem.sku})
                </div>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--admin-bg)', padding: '0.85rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Current Stock Level:</span>
                <span style={{ fontWeight: 800 }}>{adjustingItem.currentStock} Units</span>
              </div>

              <div>
                <label className="admin-label">Adjustment Type *</label>
                <select
                  className="admin-select"
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                >
                  <option value="RESTOCK">RESTOCK (Container / Supplier Shipment Arrival)</option>
                  <option value="SALE">SALE (Manual In-Store Showroom Sale)</option>
                  <option value="DAMAGE">DAMAGE (Showroom Transit / Handling Defect)</option>
                  <option value="RETURN">RETURN (Customer Exchange Returned)</option>
                  <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT (Audit Reconciliation)</option>
                </select>
              </div>

              <div>
                <label className="admin-label">Quantity Change (+ or -) *</label>
                <input
                  type="number"
                  className="admin-input"
                  required
                  value={quantityDelta}
                  onChange={(e) => setQuantityDelta(parseInt(e.target.value, 10) || 0)}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  Projected new stock: {Math.max(0, adjustingItem.currentStock + quantityDelta)} units
                </div>
              </div>

              <div>
                <label className="admin-label">Reason / Shipment Reference</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g., Container #RW-8821 from Milan Atelier arrived"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || quantityDelta === 0}
                  className="admin-btn admin-btn-primary"
                >
                  <Save size={16} />
                  <span>{isSubmitting ? 'Recording Audit...' : 'Confirm Stock Adjustment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
