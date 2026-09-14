import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';

interface WishlistDrawerProps {
  onOpenProduct3D: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = () => {
  const { items, isOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(22, 6, 32, 0.65)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '420px',
        maxWidth: '90vw',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.25)',
        animation: 'slideDown 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f0ebf5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#faf7fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color="#e63946" fill="#e63946" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
              Saved Wishlist ({items.length})
            </h3>
          </div>
          <button
            onClick={closeWishlist}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2d9eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-plum-900)'
            }}
            aria-label="Close wishlist"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              <Heart size={48} color="#d4c9de" style={{ margin: '0 auto 16px auto' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Your wishlist is empty</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>Tap the heart icon on any product to save it for later.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #f2ecf6',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#faf7fc' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                      {item.product.name}
                    </h4>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-plum-900)', marginBottom: '8px' }}>
                      ${item.product.price}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          addToCart(item.product, 1);
                          removeFromWishlist(item.product.id);
                        }}
                        style={{
                          backgroundColor: 'var(--color-plum-800)',
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ShoppingBag size={12} />
                        <span>Move to Cart</span>
                      </button>

                      <button
                        onClick={() => removeFromWishlist(item.product.id)}
                        style={{
                          color: 'var(--color-text-light)',
                          padding: '4px 6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ebf5', backgroundColor: '#faf7fc' }}>
            <button
              onClick={() => {
                items.forEach((it) => addToCart(it.product, 1));
                clearWishlist();
                closeWishlist();
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-plum-700)',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              MOVE ALL TO CART
            </button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} onClick={closeWishlist} />
    </div>
  );
};
