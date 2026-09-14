import React from 'react';
import { PRODUCTS } from '../../data/products';
import type { Product, RoomType } from '../../types';
import { ProductCard } from '../product/ProductCard';

interface PopularProductsProps {
  onOpen3D: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  activeRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
}

const TABS: { label: string; roomKey: RoomType }[] = [
  { label: 'All Items', roomKey: 'all' },
  { label: 'Living Room', roomKey: 'living' },
  { label: 'Bedroom', roomKey: 'bedroom' },
  { label: 'Dining Room', roomKey: 'dining' },
  { label: 'Office', roomKey: 'office' },
  { label: 'Storage', roomKey: 'storage' },
];

export const PopularProducts: React.FC<PopularProductsProps> = ({
  onOpen3D,
  onOpenQuickView,
  activeRoom,
  onSelectRoom,
}) => {
  // Filter products based on selected room
  const filteredProducts = activeRoom === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.room === activeRoom);

  return (
    <section id="popular-products" style={{ padding: '40px 0 70px 0', backgroundColor: '#ffffff' }}>
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: 'var(--color-plum-900)',
            marginBottom: '16px'
          }}>
            Popular Products
          </h2>

          {/* Filter Tabs matching Reference */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px 24px',
            borderBottom: '1px solid #eee6f3',
            paddingBottom: '8px'
          }}>
            {TABS.map((tab) => {
              const isSelected = activeRoom === tab.roomKey;
              return (
                <button
                  key={tab.roomKey}
                  onClick={() => onSelectRoom(tab.roomKey)}
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--color-plum-700)' : 'var(--color-text-muted)',
                    padding: '8px 4px',
                    position: 'relative',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  aria-pressed={isSelected}
                >
                  {tab.label}
                  {isSelected && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-9px',
                      left: 0,
                      right: 0,
                      height: '2.5px',
                      backgroundColor: 'var(--color-plum-700)',
                      borderRadius: '2px'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '20px',
        }} className="popular-products-grid">
          {filteredProducts.slice(0, 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen3D={onOpen3D}
              onOpenQuickView={onOpenQuickView}
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
