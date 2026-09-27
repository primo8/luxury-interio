import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchAdminCategories } from '../../utils/adminApi';

export function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Catalog Categories ({categories.length})</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Organize storefront collections, room keys, and SEO metadata
            </div>
          </div>
          <button onClick={loadCategories} className="admin-btn admin-btn-secondary">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {categories.map((cat) => (
          <div key={cat.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '160px' }}>
              <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span
                className="admin-status-badge active"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                {cat.productCount} Products
              </span>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-amethyst)', textTransform: 'uppercase' }}>
                Room Key: {cat.roomKey}
              </div>
              <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>{cat.name}</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', marginBottom: '1rem' }}>
                {cat.description}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Order: #{cat.displayOrder}
                </span>
                <span className="admin-status-badge active">Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
