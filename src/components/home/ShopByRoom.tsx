import React from 'react';
import { CATEGORIES } from '../../data/categories';
import type { RoomType } from '../../types';

interface ShopByRoomProps {
  onSelectRoom: (room: RoomType) => void;
  activeRoom: RoomType;
}

export const ShopByRoom: React.FC<ShopByRoomProps> = ({ onSelectRoom, activeRoom }) => {
  return (
    <section id="shop-by-room" style={{ padding: '70px 0 50px 0', backgroundColor: '#ffffff' }}>
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.3rem',
            fontWeight: 700,
            color: 'var(--color-plum-900)',
            marginBottom: '8px'
          }}>
            Shop By Room
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-muted)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Find the perfect pieces for every space in your home
          </p>
        </div>

        {/* 6 Circular Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
        }} className="shop-by-room-grid">
          {CATEGORIES.map((cat) => {
            const isSelected = activeRoom === cat.roomKey;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectRoom(cat.roomKey)}
                className="category-circle-wrapper"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  width: '100%'
                }}
                aria-label={`Shop ${cat.name}, ${cat.count} products`}
              >
                {/* Circular Image Container */}
                <div 
                  className="category-circle-img-container"
                  style={{
                    borderColor: isSelected ? 'var(--color-plum-600)' : 'transparent',
                    boxShadow: isSelected ? '0 0 0 3px rgba(142, 45, 226, 0.35)' : 'none'
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Name */}
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: isSelected ? 'var(--color-plum-700)' : 'var(--color-text-main)',
                  marginBottom: '2px',
                  transition: 'color 0.2s ease'
                }}>
                  {cat.name}
                </div>

                {/* Count */}
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-text-light)',
                  fontWeight: 500
                }}>
                  {cat.count} Products
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
