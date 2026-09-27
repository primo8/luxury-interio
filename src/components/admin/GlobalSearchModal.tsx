import { useState, useEffect, useRef } from 'react';
import { Search, X, ShoppingBag, Package, Users, CreditCard, Tag, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { globalAdminSearch } from '../../utils/adminApi';

export function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen, navigateToTab } = useAdmin();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    orders: any[];
    products: any[];
    customers: any[];
    payments: any[];
    discounts: any[];
  }>({ orders: [], products: [], customers: [], payments: [], discounts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ orders: [], products: [], customers: [], payments: [], discounts: [] });
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ orders: [], products: [], customers: [], payments: [], discounts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await globalAdminSearch(query);
        if (res.success && res.results) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const totalResultsCount =
    results.orders.length +
    results.products.length +
    results.customers.length +
    results.payments.length +
    results.discounts.length;

  return (
    <div className="admin-modal-backdrop" onClick={() => setIsSearchOpen(false)}>
      <div
        className="admin-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '0',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--admin-border)',
            background: '#FFFFFF',
          }}
        >
          <Search size={22} color="var(--admin-plum)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search orders, SKU, customer name, phone, MTN transaction ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--admin-text-primary)',
              background: 'transparent',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
            >
              <X size={18} />
            </button>
          )}
          <span className="admin-search-kbd">ESC</span>
        </div>

        {/* Results Area */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
              Searching live database...
            </div>
          )}

          {!isLoading && query && totalResultsCount === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--admin-text-muted)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>No records found matching "{query}"</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Try searching by Order Number, Product Name, Customer Phone, or MTN Reference ID.
              </p>
            </div>
          )}

          {!isLoading && !query && (
            <div style={{ padding: '1.5rem 0.5rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                Quick Jump Suggestions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    navigateToTab('orders');
                    setIsSearchOpen(false);
                  }}
                  className="admin-btn admin-btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.75rem' }}
                >
                  <ShoppingBag size={16} color="var(--admin-plum)" />
                  <span>Recent Orders</span>
                </button>
                <button
                  onClick={() => {
                    navigateToTab('payments');
                    setIsSearchOpen(false);
                  }}
                  className="admin-btn admin-btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.75rem' }}
                >
                  <CreditCard size={16} color="var(--admin-gold-dark)" />
                  <span>MTN Transactions</span>
                </button>
                <button
                  onClick={() => {
                    navigateToTab('products');
                    setIsSearchOpen(false);
                  }}
                  className="admin-btn admin-btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.75rem' }}
                >
                  <Package size={16} color="var(--admin-amethyst)" />
                  <span>Product Catalog</span>
                </button>
                <button
                  onClick={() => {
                    navigateToTab('mtn-sandbox');
                    setIsSearchOpen(false);
                  }}
                  className="admin-btn admin-btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '0.75rem' }}
                >
                  <Tag size={16} color="var(--admin-info)" />
                  <span>MTN Sandbox Testing</span>
                </button>
              </div>
            </div>
          )}

          {/* Orders Results */}
          {results.orders.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Orders ({results.orders.length})
              </div>
              {results.orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    navigateToTab('orders', o.id);
                    setIsSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF8FB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={16} color="var(--admin-plum)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{o.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{o.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--admin-text-muted)" />
                </div>
              ))}
            </div>
          )}

          {/* Products Results */}
          {results.products.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Products ({results.products.length})
              </div>
              {results.products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    navigateToTab('products', p.id);
                    setIsSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF8FB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={16} color="var(--admin-amethyst)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{p.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--admin-text-muted)" />
                </div>
              ))}
            </div>
          )}

          {/* Customers Results */}
          {results.customers.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Customers ({results.customers.length})
              </div>
              {results.customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    navigateToTab('customers', c.id);
                    setIsSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF8FB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} color="var(--admin-info)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{c.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--admin-text-muted)" />
                </div>
              ))}
            </div>
          )}

          {/* Payments Results */}
          {results.payments.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                MTN MoMo Transactions ({results.payments.length})
              </div>
              {results.payments.map((pay) => (
                <div
                  key={pay.id}
                  onClick={() => {
                    navigateToTab('payments', pay.id);
                    setIsSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF8FB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={16} color="var(--admin-warning)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{pay.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{pay.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--admin-text-muted)" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
