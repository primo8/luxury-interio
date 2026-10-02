import React, { useEffect, useRef, useState } from 'react';
import type { Product, ColorOption } from '../../types';
import { Furniture3DScene } from './ThreeFurnitureScene';
import { X, RotateCw, Layers, Sliders, Box, Check, ShoppingBag, Heart, ShieldCheck, Ruler } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useModalPhoneBack } from '../../hooks/useModalPhoneBack';

interface Product3DModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Product3DModal: React.FC<Product3DModalProps> = ({ product, isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Furniture3DScene | null>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Phone Back Button Interception
  useModalPhoneBack({
    isOpen,
    onBack: onClose,
    modalKey: 'product-3d-inspector',
  });

  useEffect(() => {
    if (!product || !isOpen) return;

    setSelectedColor(product.colors[0] || { name: 'Default', hex: '#4A1E6D', threeColor: 0x4a1e6d });
    setQuantity(1);
    setExploded(false);
    setWireframe(false);
  }, [product, isOpen]);

  useEffect(() => {
    if (!isOpen || !product || !containerRef.current) return;

    const initialColor = selectedColor?.threeColor || product.colors[0]?.threeColor || 0x4a1e6d;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new Furniture3DScene(containerRef.current, {
      modelType: product.threeModelType,
      primaryColor: initialColor,
      autoRotate: prefersReducedMotion ? false : autoRotate,
      wireframe: wireframe,
      exploded: exploded,
    });

    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleColorChange = (color: ColorOption) => {
    setSelectedColor(color);
    if (sceneRef.current) {
      sceneRef.current.updatePrimaryColor(color.threeColor);
    }
  };

  const handleToggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    if (sceneRef.current) {
      sceneRef.current.setAutoRotate(next);
    }
  };

  const handleToggleWireframe = () => {
    const next = !wireframe;
    setWireframe(next);
    if (sceneRef.current) {
      sceneRef.current.setWireframe(next);
    }
  };

  const handleToggleExploded = () => {
    const next = !exploded;
    setExploded(next);
    if (sceneRef.current) {
      sceneRef.current.setExplodedView(next);
    }
  };

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
        backgroundColor: 'rgba(22, 6, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} 3D Interactive Inspector`}
    >
      <div 
        className="product-3d-modal-grid"
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '90vh',
          maxHeight: '740px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'grid',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(59, 24, 79, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-plum-900)',
            transition: 'all 0.2s ease',
          }}
          aria-label="Close 3D modal"
        >
          <X size={20} />
        </button>

        {/* 3D Canvas Viewport Side */}
        <div style={{ position: 'relative', backgroundColor: '#f9f6fc', minHeight: '320px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Top Bar Controls */}
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            right: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <div style={{
              background: 'rgba(59, 24, 79, 0.9)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '24px',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Box size={13} color="#d4af37" />
              <span>3D INSPECTOR</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
              <button
                onClick={handleToggleAutoRotate}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  backgroundColor: autoRotate ? 'var(--color-plum-800)' : 'rgba(255,255,255,0.9)',
                  color: autoRotate ? '#ffffff' : 'var(--color-plum-900)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(59,24,79,0.12)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <RotateCw size={12} />
                <span>Rotate</span>
              </button>

              <button
                onClick={handleToggleExploded}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  backgroundColor: exploded ? 'var(--color-plum-800)' : 'rgba(255,255,255,0.9)',
                  color: exploded ? '#ffffff' : 'var(--color-plum-900)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(59,24,79,0.12)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <Sliders size={12} />
                <span>Explode</span>
              </button>

              <button
                onClick={handleToggleWireframe}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  backgroundColor: wireframe ? 'var(--color-plum-800)' : 'rgba(255,255,255,0.9)',
                  color: wireframe ? '#ffffff' : 'var(--color-plum-900)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(59,24,79,0.12)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <Layers size={12} />
                <span>Wireframe</span>
              </button>
            </div>
          </div>

          {/* Three.js DOM Container */}
          <div ref={containerRef} style={{ flex: 1, minHeight: '300px', width: '100%', cursor: 'grab' }} />

          {/* Bottom Guidance */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '14px',
            color: 'var(--color-text-muted)',
            fontSize: '0.7rem',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            padding: '3px 10px',
            borderRadius: '10px',
            pointerEvents: 'none'
          }}>
            🖱️ Drag to rotate • 📜 Scroll/pinch to zoom
          </div>
        </div>

        {/* Product Details & Customizer Panel */}
        <div style={{
          padding: 'clamp(18px, 4vw, 32px) clamp(16px, 3.5vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
          borderLeft: '1px solid rgba(59, 24, 79, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-plum-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>SKU: {product.sku}</span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', color: 'var(--color-plum-900)', lineHeight: '1.2', marginBottom: '10px' }}>
              {product.name}
            </h2>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '18px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
                ${product.price}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                  ${product.originalPrice}
                </span>
              )}
              {product.discountPercent && (
                <span className="badge-discount">SAVE {product.discountPercent}%</span>
              )}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              {product.description}
            </p>

            {/* Custom Color Selector */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Finish / Material Color: <span style={{ color: 'var(--color-plum-700)', fontWeight: 700 }}>{selectedColor?.name}</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.colors.map((c) => {
                  const isSel = selectedColor?.name === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleColorChange(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: isSel ? '2.5px solid #d4af37' : '2px solid #e0d8e8',
                        boxShadow: isSel ? '0 0 8px rgba(212, 175, 55, 0.7)' : 'none',
                        transform: isSel ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={c.name}
                      aria-label={`Select ${c.name}`}
                    >
                      {isSel && <Check size={14} color={c.hex === '#EAE4D9' || c.hex === '#E5DCC5' ? '#1a0824' : '#ffffff'} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimensions Specifications */}
            <div style={{
              background: '#f8f4fa',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid rgba(59,24,79,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-plum-900)', marginBottom: '6px' }}>
                <Ruler size={14} color="#7b2cbf" />
                <span>Dimensions & Specs</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <div><strong>Width:</strong> {product.dimensions.width}</div>
                <div><strong>Depth:</strong> {product.dimensions.depth}</div>
                <div><strong>Height:</strong> {product.dimensions.height}</div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid rgba(59, 24, 79, 0.2)',
                borderRadius: '8px',
                background: '#ffffff',
                padding: '4px'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span style={{ width: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                >
                  +
                </button>
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
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '12px 20px',
                  transition: 'background 0.2s ease',
                  boxShadow: '0 4px 14px rgba(59, 24, 79, 0.3)'
                }}
              >
                <ShoppingBag size={18} />
                <span>ADD TO CART • ${(product.price * quantity).toFixed(0)}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 24, 79, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isFavorited ? '#fdedee' : '#ffffff',
                  color: isFavorited ? '#e63946' : 'var(--color-plum-800)',
                }}
                aria-label="Wishlist toggle"
              >
                <Heart size={20} fill={isFavorited ? '#e63946' : 'none'} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--color-text-light)' }}>
              <ShieldCheck size={14} color="#2a9d8f" />
              <span>10-Year Master Craftsmanship Warranty • Free In-Home Setup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
