import React, { useState, useEffect } from 'react';
import type { Product, ColorOption } from '../../types';
import { X, Check, ShoppingBag, Heart, Box, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { StarRating } from './StarRating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpen3D: (product: Product) => void;
  onBuyNow?: (product: Product, quantity: number, selectedColor: ColorOption) => void;
  onToast?: (toast: { title: string; description?: string; type?: 'cart' | 'wishlist' }) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
  onOpen3D,
  onBuyNow,
  onToast,
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
      if (onToast) {
        onToast({
          title: 'Added to your showroom cart',
          description: `${quantity}x ${product.name} (${selectedColor.name})`,
          type: 'cart',
        });
      }
      onClose();
    }
  };

  const handleBuyNow = () => {
    if (selectedColor && onBuyNow) {
      onBuyNow(product, quantity, selectedColor);
      onClose();
    }
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(22, 6, 32, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} Luxury Preview`}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
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
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#f2ecf6',
            color: 'var(--color-plum-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          aria-label="Close Preview"
        >
          <X size={18} />
        </button>

        {/* Left Column: Visual Gallery & 3D Launcher */}
        <div
          style={{
            padding: '32px',
            backgroundColor: '#faf7fc',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(59, 24, 79, 0.06)',
          }}
        >
          {/* Main Visual */}
          <div
            style={{
              height: '360px',
              width: '100%',
              borderRadius: '14px',
              overflow: 'hidden',
              marginBottom: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              position: 'relative',
            }}
          >
            <img
              src={selectedImage || product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Floating 3D Badge on Main Image */}
            <button
              onClick={() => {
                onOpen3D(product);
                onClose();
              }}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(37, 13, 51, 0.88)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Box size={14} />
              <span>3D STUDIO</span>
            </button>
          </div>

          {/* Thumbnails */}
          {product.galleryImages && product.galleryImages.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              <div
                onClick={() => setSelectedImage(product.image)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImage === product.image ? '2px solid var(--color-plum-800)' : '2px solid transparent',
                  flexShrink: 0,
                }}
              >
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {product.galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === img ? '2px solid var(--color-plum-800)' : '2px solid transparent',
                    flexShrink: 0,
                  }}
                >
                  <img src={img} alt={`${product.name} detail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Quick Trust Highlights */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <Truck size={15} color="var(--color-plum-700)" />
              <span>Complimentary White-Glove delivery on orders $999+</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={15} color="#2a9d8f" />
              <span>10-Year Master Craftsman Warranty</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Product Details & Purchasing */}
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column' }}>
          {/* Category & Room */}
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--color-plum-700)',
              marginBottom: '6px',
            }}
          >
            {product.category} · {product.room.toUpperCase()}
          </div>

          {/* Title & Subtitle */}
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.65rem',
              fontWeight: 700,
              color: 'var(--color-plum-950)',
              lineHeight: 1.25,
              marginBottom: '8px',
            }}
          >
            {product.name}
          </h2>

          {product.subtitle && (
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              {product.subtitle}
            </p>
          )}

          {/* Rating & SKU */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StarRating rating={product.rating} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {product.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                ({product.reviewsCount} customer reviews)
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>
              SKU: {product.sku}
            </span>
          </div>

          {/* Price Bar */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#fbf9fc',
              borderRadius: '12px',
              border: '1px solid rgba(59, 24, 79, 0.08)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-plum-900)' }}>
              ${product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span style={{ fontSize: '1rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.discountPercent && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                SAVE {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--color-text-main)', marginBottom: '20px' }}>
            {product.description}
          </p>

          {/* Color Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'var(--color-text-main)',
                marginBottom: '8px',
              }}
            >
              Velvet Color: <strong>{selectedColor?.name}</strong>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: selectedColor?.name === c.name ? '3px solid var(--color-plum-800)' : '2px solid #e0d8e8',
                    boxShadow: selectedColor?.name === c.name ? '0 0 0 2px #ffffff inset' : 'none',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  title={c.name}
                  aria-label={`Select ${c.name}`}
                >
                  {selectedColor?.name === c.name && (
                    <Check size={14} color={c.hex === '#F8F4FA' ? '#160620' : '#ffffff'} style={{ margin: 'auto' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions and Materials Specs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#f8f4fa',
              borderRadius: '10px',
              fontSize: '0.78rem',
              marginBottom: '24px',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Dimensions</span>
              <strong>{product.dimensions.width}W × {product.dimensions.depth}D × {product.dimensions.height}H {product.dimensions.unit}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Materials</span>
              <strong>{product.materials.join(', ')}</strong>
            </div>
          </div>

          {/* Quantity & Purchasing Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            {/* Quantity Stepper */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #e2d9eb',
                borderRadius: '8px',
                overflow: 'hidden',
                height: '44px',
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: '36px', height: '100%', fontSize: '1.1rem', backgroundColor: '#faf7fc', color: 'var(--color-plum-900)' }}
              >
                -
              </button>
              <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{ width: '36px', height: '100%', fontSize: '1.1rem', backgroundColor: '#faf7fc', color: 'var(--color-plum-900)' }}
              >
                +
              </button>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#f3eaf7',
                color: 'var(--color-plum-900)',
                border: '1px solid rgba(59, 24, 79, 0.15)',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                letterSpacing: '0.4px',
              }}
            >
              <ShoppingBag size={16} />
              <span>ADD TO CART</span>
            </button>

            {/* BUY NOW */}
            <button
              onClick={handleBuyNow}
              style={{
                flex: 1,
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-plum-800)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                letterSpacing: '0.4px',
                boxShadow: '0 4px 14px rgba(37, 13, 51, 0.22)',
              }}
            >
              <span>BUY NOW</span>
              <ArrowRight size={15} />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: isFavorited ? '#fff1f2' : '#faf7fc',
                border: '1px solid #e2d9eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFavorited ? '#e63946' : 'var(--color-plum-900)',
              }}
              aria-label="Wishlist"
            >
              <Heart size={18} fill={isFavorited ? '#e63946' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
