import React, { useState } from 'react';
import type { Product } from '../../types';
import { StarRating } from './StarRating';
import { Box, Eye, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { SafeImage } from '../common/SafeImage';

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
          borderRadius: '10px',
        }}
        onClick={() => onOpenQuickView(product)}
      >
        {/* Top-Left Editorial Badge */}
        {badge && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: badge.bg,
              color: badge.color,
              fontSize: '0.66rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              padding: '3px 8px',
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
            top: '10px',
            right: '10px',
            width: '34px',
            height: '34px',
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
          <Heart size={15} fill={isFavorited ? '#e63946' : 'none'} strokeWidth={isFavorited ? 2.5 : 2} />
        </button>

        {/* Product Image with Smooth Luxury Scale on Hover */}
        <SafeImage
          src={product.image}
          alt={product.name}
          fallbackSrc="/hero-chair.jpg"
          style={{
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Floating Quick Action Bar (3D & Quick View) - visible on hover for desktop */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: isHovered ? 'translate(-50%, 0)' : 'translate(-50%, 14px)',
            opacity: isHovered ? 1 : 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '4px 8px',
            borderRadius: '30px',
            boxShadow: '0 8px 24px rgba(37, 13, 51, 0.18)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 15,
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
          className="hidden-mobile"
        >
          <button
            onClick={() => onOpen3D(product)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
            }}
            title="Inspect in 3D Studio"
            aria-label={`View ${product.name} in 3D Studio`}
          >
            <Box size={12} />
            <span>3D</span>
          </button>

          <button
            onClick={() => onOpenQuickView(product)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '20px',
              backgroundColor: '#f1eaf6',
              color: 'var(--color-plum-900)',
              fontSize: '0.68rem',
              fontWeight: 600,
            }}
            title="Quick Details"
            aria-label={`Quick details for ${product.name}`}
          >
            <Eye size={12} />
            <span>PREVIEW</span>
          </button>
        </div>
      </div>

      {/* 2. Product Meta & Information */}
      <div style={{ padding: '12px 10px 12px 10px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Category & Room Eyebrow */}
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--color-text-light)',
              marginBottom: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.category}
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onOpenQuickView(product)}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(0.88rem, 2.8vw, 1rem)',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              marginBottom: '4px',
              cursor: 'pointer',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
            }}
          >
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              ({product.reviewsCount})
            </span>
          </div>

          {/* Pricing Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '1.05rem',
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
                  fontSize: '0.8rem',
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
        <div className="product-card-actions">
          {/* Action 1: ADD TO CART */}
          <button
            onClick={handleAddToCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px 6px',
              borderRadius: '8px',
              backgroundColor: '#f4edf8',
              color: 'var(--color-plum-900)',
              border: '1px solid rgba(59, 24, 79, 0.12)',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              minHeight: '36px',
            }}
            className="product-card-btn-text"
            title="Add item to shopping bag"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={13} />
            <span>ADD TO CART</span>
          </button>

          {/* Action 2: BUY NOW (Direct Fast Checkout) */}
          <button
            onClick={handleBuyNow}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px 6px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 13, 51, 0.18)',
              minHeight: '36px',
            }}
            className="product-card-btn-text"
            title="Buy this piece immediately"
            aria-label={`Buy ${product.name} now`}
          >
            <span>BUY NOW</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

