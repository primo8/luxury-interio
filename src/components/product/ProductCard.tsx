import React, { useState } from 'react';
import type { Product } from '../../types';
import { StarRating } from './StarRating';
import { Box, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onOpen3D: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpen3D,
  onOpenQuickView,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      {/* Top Image Container */}
      <div className="product-card-img-wrap">
        {/* Discount Badge */}
        {product.discountPercent && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'var(--color-plum-800)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '4px',
            zIndex: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            -{product.discountPercent}%
          </div>
        )}

        {/* New Badge if applicable */}
        {product.isNew && !product.discountPercent && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'var(--color-violet-vibrant)',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
            zIndex: 10
          }}>
            NEW
          </div>
        )}

        {/* Main Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />

        {/* Hover Action Buttons */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: isHovered ? 'translate(-50%, 0)' : 'translate(-50%, 15px)',
          opacity: isHovered ? 1 : 0,
          display: 'flex',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
          borderRadius: '24px',
          boxShadow: '0 6px 20px rgba(37, 13, 51, 0.18)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 15
        }}>
          {/* 3D Visualizer Trigger */}
          <button
            onClick={() => onOpen3D(product)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease'
            }}
            title="View in 3D"
            aria-label={`View ${product.name} in 3D`}
          >
            <Box size={16} />
          </button>

          {/* Quick View Trigger */}
          <button
            onClick={() => onOpenQuickView(product)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f2ecf6',
              color: 'var(--color-plum-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease'
            }}
            title="Quick Preview"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye size={16} />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isFavorited ? '#ffeff0' : '#f2ecf6',
              color: isFavorited ? '#e63946' : 'var(--color-plum-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease'
            }}
            title="Add to Wishlist"
            aria-label={`Add ${product.name} to wishlist`}
          >
            <Heart size={16} fill={isFavorited ? '#e63946' : 'none'} />
          </button>

          {/* Quick Add to Cart */}
          <button
            onClick={() => addToCart(product, 1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-plum-700)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease'
            }}
            title="Add to Cart"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>

      {/* Product Details matching reference */}
      <div style={{ textAlign: 'center', padding: '0 4px 6px 4px' }}>
        <h4 
          onClick={() => onOpenQuickView(product)}
          style={{
            fontSize: '0.94rem',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            marginBottom: '6px',
            cursor: 'pointer',
            lineHeight: 1.3,
            transition: 'color 0.2s ease'
          }}
          className="hover:text-plum"
        >
          {product.name}
        </h4>

        {/* Star Ratings */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <StarRating rating={product.rating} />
        </div>

        {/* Price Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {product.originalPrice ? (
            <>
              <span style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-light)',
                textDecoration: 'line-through'
              }}>
                ${product.originalPrice}
              </span>
              <span style={{
                fontSize: '0.96rem',
                fontWeight: 700,
                color: 'var(--color-plum-800)'
              }}>
                ${product.price}
              </span>
            </>
          ) : (
            <span style={{
              fontSize: '0.96rem',
              fontWeight: 700,
              color: 'var(--color-plum-800)'
            }}>
              ${product.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
