import React, { useState, useEffect } from 'react';
import type { Product, ColorOption } from '../../types';
import { X, Check, ShoppingBag, Heart, Box, ShieldCheck, Truck } from 'lucide-react';
import { StarRating } from './StarRating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpen3D: (product: Product) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
  onOpen3D,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || null);
      setSelectedImage(product.image);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (selectedColor) {
      addToCart(product, quantity, selectedColor);
      onClose();
    }
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(22, 6, 32, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} Quick View`}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
        }}
        className="quickview-modal-grid"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f2ecf6',
            color: 'var(--color-plum-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Left: Gallery View */}
        <div style={{ padding: '28px', backgroundColor: '#faf7fc', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            height: '320px',
            width: '100%',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '14px',
            backgroundColor: '#ffffff'
          }}>
            <img
              src={selectedImage || product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[product.image, ...product.galleryImages].slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: selectedImage === img ? '2px solid var(--color-plum-700)' : '1px solid #e0d8e8',
                  flexShrink: 0
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          {/* 3D Visualizer Trigger */}
          <button
            onClick={() => {
              onClose();
              onOpen3D(product);
            }}
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.82rem'
            }}
          >
            <Box size={16} color="#d4af37" />
            <span>INTERACT IN 3D STUDIO</span>
          </button>
        </div>

        {/* Right: Product Specs & Actions */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-plum-700)', textTransform: 'uppercase', marginBottom: '6px' }}>
              {product.category}
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-plum-900)', marginBottom: '8px' }}>
              {product.name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <StarRating rating={product.rating} showCount count={product.reviewsCount} />
              <span style={{ fontSize: '0.75rem', color: '#2a9d8f', fontWeight: 600 }}>• In Stock ({product.stockCount} left)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
                ${product.price}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              {product.longDescription || product.description}
            </p>

            {/* Colors */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Color Finish: <span style={{ color: 'var(--color-plum-700)' }}>{selectedColor?.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: selectedColor?.name === c.name ? '2px solid #d4af37' : '1.5px solid #d8d0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {selectedColor?.name === c.name && (
                      <Check size={12} color={c.hex === '#EAE4D9' ? '#1a0824' : '#ffffff'} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div style={{ background: '#f8f4fa', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <strong>Dimensions:</strong> {product.dimensions.width} W × {product.dimensions.depth} D × {product.dimensions.height} H
            </div>
          </div>

          {/* Actions */}
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d8d0e0', borderRadius: '8px', padding: '2px 8px' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '4px 6px', fontWeight: 'bold' }}>-</button>
                <span style={{ padding: '0 8px', fontSize: '0.88rem', fontWeight: 600 }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '4px 6px', fontWeight: 'bold' }}>+</button>
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem'
                }}
              >
                <ShoppingBag size={16} />
                <span>ADD TO CART • ${(product.price * quantity).toFixed(0)}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid #d8d0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isFavorited ? '#ffeff0' : '#ffffff',
                  color: isFavorited ? '#e63946' : 'var(--color-plum-900)'
                }}
              >
                <Heart size={18} fill={isFavorited ? '#e63946' : 'none'} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={13} color="#2a9d8f" />
                <span>Free delivery over $999</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="#2a9d8f" />
                <span>10-Yr Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
