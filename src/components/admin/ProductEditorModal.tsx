import { useState } from 'react';
import {
  X,
  Save,
  Package,
  DollarSign,
  Layers,
  Image,
  Sliders,
  Box,
  Globe,
  Eye,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { createAdminProduct, updateAdminProduct } from '../../utils/adminApi';
import type { Product } from '../../types';

export function ProductEditorModal({
  product,
  onClose,
  onSaved,
}: {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showAdminToast } = useAdmin();
  const isEditing = Boolean(product?.id);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'pricing' | 'inventory' | 'media' | 'specs' | '3d' | 'seo' | 'preview'
  >('overview');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    subtitle: product?.subtitle || '',
    category: product?.category || 'Armchairs & Seating',
    room: product?.room || 'living',
    price: product?.price || 299,
    originalPrice: product?.originalPrice || 349,
    discountPercent: product?.discountPercent || 14,
    stockCount: product?.stockCount || 10,
    inStock: product?.inStock !== undefined ? product.inStock : true,
    sku: product?.sku || `FUR-LIV-${Math.floor(100 + Math.random() * 900)}`,
    image: product?.image || '/hero-chair.jpg',
    galleryImages: product?.galleryImages || ['/hero-chair.jpg'],
    description: product?.description || '',
    longDescription: product?.longDescription || '',
    dimensions: product?.dimensions || { width: '32 in', depth: '31 in', height: '34 in', unit: 'imperial' },
    materials: product?.materials || ['Royal Velvet Upholstery', 'Kiln-Dried Hardwood Frame', 'Brushed Brass Legs'],
    colors: product?.colors || [
      { name: 'Royal Plum', hex: '#4A1E6D', threeColor: 0x4a1e6d },
      { name: 'Warm Cream', hex: '#EAE4D9', threeColor: 0xeae4d9 },
    ],
    threeModelType: product?.threeModelType || 'chair',
    isBestSeller: product?.isBestSeller || false,
    isFeatured: product?.isFeatured || false,
    isNew: product?.isNew || false,
    isDealOfTheWeek: product?.isDealOfTheWeek || false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showAdminToast('Please fill in product name and base price', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && product) {
        const res = await updateAdminProduct(product.id, formData);
        if (res.success) {
          showAdminToast(`Product "${formData.name}" updated successfully!`, 'success');
          onSaved();
          onClose();
        } else {
          showAdminToast(res.message || 'Failed to update product', 'error');
        }
      } else {
        const res = await createAdminProduct(formData);
        if (res.success) {
          showAdminToast(`New product "${formData.name}" created!`, 'success');
          onSaved();
          onClose();
        } else {
          showAdminToast(res.message || 'Failed to create product', 'error');
        }
      }
    } catch (err) {
      showAdminToast('Server error saving product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="admin-card"
        style={{
          width: '100%',
          maxWidth: '920px',
          padding: 0,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              {isEditing ? `Edit Product: ${product?.name}` : 'Create New Luxury Product'}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
              Multi-attribute configuration synchronized with storefront and 3D studio
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid var(--admin-border)',
            padding: '0 1rem',
            background: '#FFFFFF',
          }}
        >
          {[
            { id: 'overview', label: 'Overview', icon: <Package size={15} /> },
            { id: 'pricing', label: 'Pricing', icon: <DollarSign size={15} /> },
            { id: 'inventory', label: 'Inventory', icon: <Layers size={15} /> },
            { id: 'media', label: 'Media & Gallery', icon: <Image size={15} /> },
            { id: 'specs', label: 'Specifications', icon: <Sliders size={15} /> },
            { id: '3d', label: '3D Studio Model', icon: <Box size={15} /> },
            { id: 'seo', label: 'SEO & Meta', icon: <Globe size={15} /> },
            { id: 'preview', label: 'Store Preview', icon: <Eye size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.85rem 1rem',
                fontSize: '0.825rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? 'var(--admin-plum)' : 'var(--admin-text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--admin-plum)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="admin-label">Product Title *</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  placeholder="e.g., Sapphire Velvet Accent Chair"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="admin-label">Subtitle / Editorial Headline</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g., Sculptural luxury barrel armchair with tapered solid wood legs"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Room Category</label>
                  <select
                    className="admin-select"
                    value={formData.room || 'living'}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value as any })}
                  >
                    <option value="living">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="dining">Dining Room</option>
                    <option value="office">Office & Study</option>
                    <option value="storage">Storage & Buffets</option>
                    <option value="outdoor">Patio & Outdoor</option>
                  </select>
                </div>

                <div>
                  <label className="admin-label">Subcategory Tag</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g., Armchairs & Seating"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Short Description</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  placeholder="Concise overview for quick view modal..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="admin-label">Long Editorial Story & Craftsmanship</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  placeholder="In-depth narrative on materials, artisan joinery, and styling..."
                  value={formData.longDescription || ''}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING */}
          {activeTab === 'pricing' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div>
                <label className="admin-label">Selling Base Price ($ USD) *</label>
                <input
                  type="number"
                  className="admin-input"
                  required
                  min="1"
                  step="1"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="admin-label">Original Compare-at Price ($ USD)</label>
                <input
                  type="number"
                  className="admin-input"
                  min="0"
                  step="1"
                  placeholder="e.g., 349"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="admin-label">Discount Badge Percent (%)</label>
                <input
                  type="number"
                  className="admin-input"
                  min="0"
                  max="90"
                  placeholder="e.g., 15"
                  value={formData.discountPercent || ''}
                  onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div>
                <label className="admin-label">Product Badge Text</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g., NEW, -20%, LUXURY"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div>
                <label className="admin-label">Stock Keeping Unit (SKU) *</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div>
                <label className="admin-label">Current Stock Units *</label>
                <input
                  type="number"
                  className="admin-input"
                  required
                  min="0"
                  value={formData.stockCount || 0}
                  onChange={(e) => {
                    const count = parseInt(e.target.value, 10) || 0;
                    setFormData({ ...formData, stockCount: count, inStock: count > 0 });
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Available for Purchase (In Stock)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mark as Best Seller</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Feature on Homepage</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & GALLERY */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="admin-label">Primary Image URL</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="https://... or /hero-chair.jpg"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              {formData.image && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--admin-bg)', padding: '1rem', borderRadius: '8px' }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)' }}>
                    Primary card showcase image
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Width</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.dimensions?.width || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions!, width: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">Depth</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.dimensions?.depth || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions!, depth: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="admin-label">Height</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.dimensions?.height || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions!, height: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Materials List (Comma-separated)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.materials?.join(', ') || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      materials: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* TAB 6: 3D STUDIO CONFIG */}
          {activeTab === '3d' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="admin-label">Three.js 3D Geometry Model</label>
                <select
                  className="admin-select"
                  value={formData.threeModelType || 'chair'}
                  onChange={(e) => setFormData({ ...formData, threeModelType: e.target.value as any })}
                >
                  <option value="chair">Sculptural Accent Chair</option>
                  <option value="sofa">Modular Velvet Sectional Sofa</option>
                  <option value="table">Architectural Walnut Dining Table</option>
                  <option value="bed">Channel Tufted Upholstered Bed</option>
                  <option value="sideboard">Fluted Tambour Credenza Sideboard</option>
                  <option value="desk">Executive Oak Writing Desk</option>
                  <option value="shelf">Minimalist Open Bookshelf</option>
                </select>
              </div>

              <div style={{ background: 'var(--admin-bg)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>3D WebGL Features Enabled</div>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', color: 'var(--admin-text-secondary)' }}>
                  <li>Real-time material shader color swapping with memory retention</li>
                  <li>OrbitControls with physical damping and luxury lighting presets</li>
                  <li>Dimensions caliper overlay for customer space planning</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 7: SEO */}
          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="admin-label">SEO Meta Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={`${formData.name || ''} | FURNITURA Luxury Furniture`}
                  readOnly
                />
              </div>

              <div>
                <label className="admin-label">Meta Description</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 8: PREVIEW */}
          {activeTab === 'preview' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
              <div
                style={{
                  width: '320px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid var(--admin-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--admin-shadow-md)',
                }}
              >
                <img
                  src={formData.image || '/hero-chair.jpg'}
                  alt="Product"
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-amethyst)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {formData.category || 'Luxury'}
                  </div>
                  <h4 style={{ margin: '0.25rem 0', fontSize: '1.05rem', fontWeight: 800 }}>{formData.name || 'Untitled Piece'}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginBottom: '0.75rem' }}>
                    {formData.subtitle}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--admin-plum)' }}>
                      ${formData.price?.toLocaleString()}
                    </div>
                    <span className="admin-status-badge in_stock">In Stock ({formData.stockCount})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--admin-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="admin-btn admin-btn-primary">
              <Save size={16} />
              <span>{isSaving ? 'Saving Product...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
