import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    couponCode,
    discountPercent,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    progressToFreeShipping,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponFeedback(res);
    if (res.success) setInputCoupon('');
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

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
        width: '450px',
        maxWidth: '92vw',
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
            <ShoppingBag size={20} color="var(--color-plum-800)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
              Your Shopping Cart ({items.length})
            </h3>
          </div>
          <button
            onClick={closeCart}
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
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#f6f0f9',
          borderBottom: '1px solid #eee6f3'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-plum-900)', fontWeight: 600, marginBottom: '6px' }}>
            <Truck size={16} color="#7b2cbf" />
            {amountNeededForFreeShipping === 0 ? (
              <span style={{ color: '#2a9d8f' }}>🎉 Congratulations! You qualify for Free White-Glove Delivery!</span>
            ) : (
              <span>Add <strong>${amountNeededForFreeShipping.toFixed(0)}</strong> more to unlock <strong>FREE Delivery</strong></span>
            )}
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2d5eb', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressToFreeShipping}%`,
              height: '100%',
              backgroundColor: progressToFreeShipping >= 100 ? '#2a9d8f' : 'var(--color-plum-700)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              <ShoppingBag size={48} color="#d4c9de" style={{ margin: '0 auto 16px auto' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>Explore our curated collection to add timeless furniture.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor.name}`}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #f2ecf6'
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '76px', height: '76px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#faf7fc' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: 1.3 }}>
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedColor.name)}
                        style={{ color: '#c4b5d0', padding: '2px', transition: 'color 0.2s' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: '4px 0 8px 0' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.selectedColor.hex, display: 'inline-block', border: '1px solid #d4af37' }} />
                      <span>{item.selectedColor.name}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0d8e8', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.quantity - 1)}
                          style={{ padding: '2px 8px', fontSize: '0.85rem', fontWeight: 'bold' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0 6px' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.quantity + 1)}
                          style={{ padding: '2px 8px', fontSize: '0.85rem', fontWeight: 'bold' }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
                        ${(item.product.price * item.quantity).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid #f0ebf5',
            backgroundColor: '#faf7fc'
          }}>
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', border: '1px solid #e0d8e8', borderRadius: '6px', padding: '0 10px' }}>
                <Tag size={14} color="#8f8599" style={{ marginRight: '6px' }} />
                <input
                  type="text"
                  placeholder="Promo code (e.g. FURNITURA10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '8px 14px',
                  borderRadius: '6px'
                }}
              >
                APPLY
              </button>
            </form>

            {couponFeedback && (
              <div style={{ fontSize: '0.75rem', marginBottom: '10px', color: couponFeedback.success ? '#2a9d8f' : '#e63946' }}>
                {couponFeedback.message}
              </div>
            )}

            {couponCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#efe8f5', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-plum-800)' }}>Code: {couponCode} (-{discountPercent}%)</span>
                <button onClick={removeCoupon} style={{ color: '#e63946', fontWeight: 600 }}>Remove</button>
              </div>
            )}

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2a9d8f' }}>
                  <span>Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#2a9d8f' }}>FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e2d5eb', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-plum-900)' }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                closeCart();
                onProceedToCheckout();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-plum-800)',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 14px rgba(59, 24, 79, 0.3)'
              }}
            >
              <span>PROCEED TO SECURE CHECKOUT</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div style={{ flex: 1 }} onClick={closeCart} />
    </div>
  );
};
