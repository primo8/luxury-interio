import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  Grid,
  List,
  Edit2,
  Trash2,
  Download,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminProducts, deleteAdminProduct, getExportDownloadUrl } from '../../utils/adminApi';
import { ProductEditorModal } from './ProductEditorModal';
import type { Product } from '../../types';

export function ProductsManager() {
  const { showAdminToast } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('');

  // Editor Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (roomFilter !== 'all') params.room = roomFilter;
      if (stockFilter) params.stockLevel = stockFilter;

      const res = await fetchAdminProducts(params);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, roomFilter, stockFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to archive "${name}" from the active catalog?`)) {
      return;
    }
    try {
      const res = await deleteAdminProduct(id);
      if (res.success) {
        showAdminToast(`Product "${name}" archived successfully!`, 'success');
        loadProducts();
      }
    } catch (err) {
      showAdminToast('Failed to archive product', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Controls Bar */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }}
            />
            <input
              type="text"
              className="admin-input"
              placeholder="Search products by title, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Filters & Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="admin-select"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="all">All Rooms</option>
              <option value="living">Living Room</option>
              <option value="bedroom">Bedroom</option>
              <option value="dining">Dining Room</option>
              <option value="office">Office & Study</option>
              <option value="storage">Storage</option>
              <option value="outdoor">Outdoor</option>
            </select>

            <select
              className="admin-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="">All Stock Levels</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            {/* View Toggle */}
            <div style={{ display: 'flex', background: 'var(--admin-bg)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.35rem 0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'table' ? 'var(--admin-plum)' : 'var(--admin-text-muted)',
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.35rem 0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--admin-plum)' : 'var(--admin-text-muted)',
                }}
              >
                <Grid size={16} />
              </button>
            </div>

            <a
              href={getExportDownloadUrl('products')}
              download
              className="admin-btn admin-btn-secondary"
              title="Export Products CSV"
            >
              <Download size={16} />
            </a>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsEditorOpen(true);
              }}
              className="admin-btn admin-btn-primary"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Display (Table or Grid) */}
      {viewMode === 'table' ? (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Room & Category</th>
                  <th>Price</th>
                  <th>Stock Units</th>
                  <th>3D Model</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                      Loading catalog...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
                      <Package size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>No products found matching filters.</div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700 }}>{product.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                              {product.colors.length} color variants
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{product.sku}</td>
                      <td>
                        <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{product.room}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{product.category}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>
                        ${product.price.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{product.stockCount} units</div>
                        {product.stockCount <= 10 && product.stockCount > 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--admin-warning)', fontWeight: 700 }}>
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: 'var(--admin-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                          {product.threeModelType}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-badge ${product.inStock ? 'active' : 'out_of_stock'}`}>
                          {product.inStock ? 'ACTIVE' : 'OUT OF STOCK'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditorOpen(true);
                            }}
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                            title="Archive Product"
                            style={{ color: 'var(--admin-error)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {products.map((product) => (
            <div
              key={product.id}
              className="admin-card"
              style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'relative', height: '180px' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className={`admin-status-badge ${product.inStock ? 'active' : 'out_of_stock'}`}
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                  {product.inStock ? 'ACTIVE' : 'OUT OF STOCK'}
                </span>
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--admin-amethyst)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {product.category}
                </div>
                <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1rem', fontWeight: 800 }}>{product.name}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.85rem' }}>
                  SKU: {product.sku} • Stock: {product.stockCount}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-light)' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--admin-plum)' }}>
                    ${product.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsEditorOpen(true);
                    }}
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Editor Multi-Tab Modal */}
      {isEditorOpen && (
        <ProductEditorModal
          product={editingProduct}
          onClose={() => setIsEditorOpen(false)}
          onSaved={loadProducts}
        />
      )}
    </div>
  );
}
