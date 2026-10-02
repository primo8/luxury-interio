import React from 'react';
import { PRODUCTS } from '../../data/products';
import type { Product, RoomType } from '../../types';
import { ProductCard } from '../product/ProductCard';

interface PopularProductsProps {
  onOpen3D: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onToast?: (toast: { title: string; description?: string; type?: 'cart' | 'wishlist' }) => void;
  activeRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
}

const TABS: { label: string; roomKey: RoomType }[] = [
  { label: 'All Pieces', roomKey: 'all' },
  { label: 'Living Room', roomKey: 'living' },
  { label: 'Bedroom', roomKey: 'bedroom' },
  { label: 'Dining Room', roomKey: 'dining' },
  { label: 'Executive Office', roomKey: 'office' },
  { label: 'Artisan Storage', roomKey: 'storage' },
  { label: 'Patio & Outdoor', roomKey: 'outdoor' },
];

export const PopularProducts: React.FC<PopularProductsProps> = ({
  onOpen3D,
  onOpenQuickView,
  onBuyNow,
  onToast,
  activeRoom,
  onSelectRoom,
}) => {
  // Filter products based on selected room
  const filteredProducts = activeRoom === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.room === activeRoom);

  return (
    <section id="popular-products" style={{ padding: '40px 0 60px 0', backgroundColor: '#faf9fc' }}>
      <div className="container">
        {/* Section Heading with Editorial Hierarchy */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.4px',
              color: 'var(--color-gold)',
              marginBottom: '4px',
            }}
          >
            Curated Showroom
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.7rem, 3.8vw, 2.4rem)',
              fontWeight: 700,
              color: 'var(--color-plum-950)',
              marginBottom: '16px',
            }}
          >
            Popular & Iconic Designs
          </h2>

          {/* Filter Tabs - Horizontal scroll on mobile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '6px 18px',
              borderBottom: '1px solid rgba(59, 24, 79, 0.1)',
              paddingBottom: '8px',
              overflowX: 'auto',
              maxWidth: '100%',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div style={{ display: 'flex', gap: '14px', margin: '0 auto', padding: '0 8px' }}>
              {TABS.map((tab) => {
                const isSelected = activeRoom === tab.roomKey;
                return (
                  <button
                    key={tab.roomKey}
                    onClick={() => onSelectRoom(tab.roomKey)}
                    style={{
                      fontSize: 'clamp(0.78rem, 2.2vw, 0.86rem)',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--color-plum-800)' : 'var(--color-text-muted)',
                      padding: '8px 4px',
                      position: 'relative',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    aria-pressed={isSelected}
                  >
                    {tab.label}
                    {isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-9px',
                          left: 0,
                          right: 0,
                          height: '2.5px',
                          backgroundColor: 'var(--color-plum-800)',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="popular-products-grid">
          {filteredProducts.slice(0, 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen3D={onOpen3D}
              onOpenQuickView={onOpenQuickView}
              onBuyNow={onBuyNow}
              onToast={onToast}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--color-text-muted)' }}>
            No products found for this category.
          </div>
        )}
      </div>
    </section>
  );
};

