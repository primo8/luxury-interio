import React, { useState } from 'react';
import type { Product } from '../../types';
import { StarRating } from './StarRating';
import { Box, Eye, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onOpen3D: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onToast?: (toast: { title: string; description?: string; type?: 'cart' | 'wishlist' }) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpen3D,
  onOpenQuickView,
  onBuyNow,
  onToast,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    if (onToast) {
      onToast({
        title: 'Added to your showroom cart',
        description: `${product.name} (1 unit) added.`,
        type: 'cart',
      });
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    if (onToast) {
      onToast({
        title: isFavorited ? 'Removed from Wishlist' : 'Saved to Wishlist',
        description: product.name,
        type: 'wishlist',
      });
    }
  };

  // Badge logic
  const getBadge = () => {
    if (product.discountPercent) {
      return { text: `SAVE ${product.discountPercent}%`, bg: 'var(--color-plum-900)', color: '#ffffff' };
    }
    if (product.badge) {
      return { text: product.badge.toUpperCase(), bg: 'var(--color-gold)', color: '#160620' };
    }
    if (product.isNew) {
      return { text: 'NEW ARRIVAL', bg: 'var(--color-plum-800)', color: '#ffffff' };
    }
    if (product.isBestSeller) {
      return { text: 'BESTSELLER', bg: 'rgba(212, 175, 55, 0.9)', color: '#1a0d24' };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-surface-white)',
        borderRadius: '16px',
        border: '1px solid rgba(59, 24, 79, 0.07)',
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
        boxShadow: isHovered
          ? '0 18px 40px -8px rgba(37, 13, 51, 0.12)'
          : '0 4px 16px rgba(37, 13, 51, 0.03)',
        borderColor: isHovered ? 'rgba(59, 24, 79, 0.18)' : 'rgba(59, 24, 79, 0.07)',
        position: 'relative',
        height: '100%',
      }}
    >
      {/* 1. Large Image Area with Neutral Luxury Backdrop */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: '#f8f6f9',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => onOpenQuickView(product)}
      >
        {/* Top-Left Editorial Badge */}
        {badge && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: badge.bg,
              color: badge.color,
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.6px',
              padding: '4px 9px',
              borderRadius: '6px',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {badge.text}
          </div>
        )}

        {/* Top-Right Wishlist Floating Button */}
        <button
          onClick={handleWishlistToggle}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isFavorited ? '#fff1f2' : 'rgba(255, 255, 255, 0.92)',
            color: isFavorited ? '#e63946' : 'var(--color-plum-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
            zIndex: 10,
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
          aria-label={isFavorited ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart size={16} fill={isFavorited ? '#e63946' : 'none'} strokeWidth={isFavorited ? 2.5 : 2} />
        </button>

        {/* Product Image with Smooth Luxury Scale on Hover */}
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          }}
          loading="lazy"
        />

        {/* Floating Quick Action Bar (3D & Quick View) */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: isHovered ? 'translate(-50%, 0)' : 'translate(-50%, 14px)',
            opacity: isHovered ? 1 : 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(10px)',
            padding: '5px 10px',
            borderRadius: '30px',
            boxShadow: '0 8px 24px rgba(37, 13, 51, 0.18)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 15,
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onOpen3D(product)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
              transition: 'opacity 0.15s ease',
            }}
            title="Inspect in 3D Studio"
            aria-label={`View ${product.name} in 3D Studio`}
          >
            <Box size={13} />
            <span>3D VIEW</span>
          </button>

          <button
            onClick={() => onOpenQuickView(product)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: '#f1eaf6',
              color: 'var(--color-plum-900)',
              fontSize: '0.72rem',
              fontWeight: 600,
              transition: 'background-color 0.15s ease',
            }}
            title="Quick Details"
            aria-label={`Quick details for ${product.name}`}
          >
            <Eye size={13} />
            <span>PREVIEW</span>
          </button>
        </div>
      </div>

      {/* 2. Product Meta & Information */}
      <div style={{ padding: '16px 16px 14px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Category & Room Eyebrow */}
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: 'var(--color-text-light)',
              marginBottom: '4px',
            }}
          >
            {product.category} · {product.room}
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onOpenQuickView(product)}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.02rem',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              marginBottom: '6px',
              cursor: 'pointer',
              lineHeight: 1.35,
              transition: 'color 0.2s ease',
            }}
          >
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              ({product.reviewsCount})
            </span>
          </div>

          {/* Pricing Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-plum-900)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              ${product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--color-text-light)',
                  textDecoration: 'line-through',
                }}
              >
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* 3. TWO DISTINCT PURCHASE ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px' }}>
          {/* Action 1: ADD TO CART */}
          <button
            onClick={handleAddToCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 8px',
              borderRadius: '8px',
              backgroundColor: '#f4edf8',
              color: 'var(--color-plum-900)',
              border: '1px solid rgba(59, 24, 79, 0.12)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            title="Add item to shopping bag"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={14} />
            <span>ADD TO CART</span>
          </button>

          {/* Action 2: BUY NOW (Direct Fast Checkout) */}
          <button
            onClick={handleBuyNow}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 8px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 13, 51, 0.18)',
            }}
            title="Buy this piece immediately"
            aria-label={`Buy ${product.name} now`}
          >
            <span>BUY NOW</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
