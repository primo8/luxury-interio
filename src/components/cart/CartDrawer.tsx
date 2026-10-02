import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Tag, ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { SafeImage } from '../common/SafeImage';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout, onExploreProducts }) => {
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(22, 6, 32, 0.65)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.28)',
          animation: 'slideDown 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f0ebf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#faf7fc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 24, 79, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={18} color="var(--color-plum-800)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                Your Showroom Cart
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                {items.length} {items.length === 1 ? 'piece' : 'pieces'} selected
              </span>
            </div>
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
              color: 'var(--color-plum-900)',
              transition: 'background-color 0.15s',
            }}
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f6f0f9',
            borderBottom: '1px solid #eee6f3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--color-plum-950)',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={15} color="var(--color-plum-700)" />
              {amountNeededForFreeShipping === 0 ? (
                <span style={{ color: '#2a9d8f', fontWeight: 700 }}>Complimentary Delivery Unlocked</span>
              ) : (
                <span>
                  Add <strong>${amountNeededForFreeShipping.toLocaleString()}</strong> for complimentary delivery
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              {progressToFreeShipping.toFixed(0)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2d5eb', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressToFreeShipping}%`,
                height: '100%',
                backgroundColor: progressToFreeShipping >= 100 ? '#2a9d8f' : 'var(--color-plum-800)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Item List or Empty State */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: '#f5f0f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <ShoppingBag size={28} color="var(--color-plum-800)" />
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--color-plum-950)',
                  marginBottom: '8px',
                }}
              >
                Your showroom is waiting for its first piece.
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', marginBottom: '24px', maxWidth: '280px' }}>
                Explore our curated designer sofas, dining tables, and bedroom collections.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  if (onExploreProducts) onExploreProducts();
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '30px',
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 15px rgba(37, 13, 51, 0.2)',
                }}
              >
                DISCOVER FURNITURE
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor.name}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '76px 1fr auto',
                    gap: '14px',
                    alignItems: 'center',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #f2ecf6',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#f8f4fa',
                      flexShrink: 0,
                    }}
                  >
                    <SafeImage
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-main)',
                        marginBottom: '3px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.product.name}
                    </h4>

                    {/* Variant and Price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: item.selectedColor.hex,
                          display: 'inline-block',
                          border: '1px solid #ccc',
                        }}
                      />
                      <span>{item.selectedColor.name}</span>
                      <span>·</span>
                      <strong style={{ color: 'var(--color-plum-900)' }}>${item.product.price.toLocaleString()}</strong>
                    </div>

                    {/* Quantity controls */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #e0d5eb',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        height: '28px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.quantity - 1)}
                        style={{ width: '26px', height: '100%', backgroundColor: '#faf7fc', fontSize: '0.85rem' }}
                      >
                        -
                      </button>
                      <span style={{ width: '28px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.quantity + 1)}
                        style={{ width: '26px', height: '100%', backgroundColor: '#faf7fc', fontSize: '0.85rem' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Delete */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedColor.name)}
                      style={{
                        color: 'var(--color-text-light)',
                        padding: '4px',
                        transition: 'color 0.15s',
                      }}
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Calculations and Checkout Trigger */}
        {items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              backgroundColor: '#faf7fc',
              borderTop: '1px solid #f0ebf5',
            }}
          >
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2d9eb',
                  borderRadius: '8px',
                  padding: '0 10px',
                }}
              >
                <Tag size={14} color="var(--color-plum-700)" style={{ marginRight: '6px' }} />
                <input
                  type="text"
                  placeholder="Promo Code (e.g. FURNITURA10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.78rem',
                    padding: '8px 0',
                    textTransform: 'uppercase',
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '0 14px',
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                APPLY
              </button>
            </form>

            {couponFeedback && (
              <div
                style={{
                  fontSize: '0.74rem',
                  marginBottom: '10px',
                  color: couponFeedback.success ? '#2a9d8f' : '#e63946',
                }}
              >
                {couponFeedback.message}
              </div>
            )}

            {couponCode && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(42, 157, 143, 0.1)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  color: '#2a9d8f',
                  marginBottom: '12px',
                }}
              >
                <span>Code <strong>{couponCode}</strong> ({discountPercent}% OFF)</span>
                <button onClick={removeCoupon} style={{ color: '#e63946', fontWeight: 600 }}>Remove</button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2a9d8f' }}>
                  <span>VIP Promotional Discount</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>White-Glove Delivery</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--color-plum-950)',
                  borderTop: '1px solid #e8dfef',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}
              >
                <span>Total Amount</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  closeCart();
                  onProceedToCheckout();
                }}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(37, 13, 51, 0.25)',
                }}
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={closeCart}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                CONTINUE SHOPPING
              </button>
            </div>

            {/* Subtle Trust Badge Footer */}
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                fontSize: '0.72rem',
                color: 'var(--color-text-light)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> 256-Bit Encrypted
              </span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Protected Payment
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
