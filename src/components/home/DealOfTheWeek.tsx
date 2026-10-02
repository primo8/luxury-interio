import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../data/products';
import type { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { Clock, Sparkles } from 'lucide-react';

interface DealOfTheWeekProps {
  onOpen3D: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onToast?: (toast: { title: string; description?: string; type?: 'cart' | 'wishlist' }) => void;
}

export const DealOfTheWeek: React.FC<DealOfTheWeekProps> = ({
  onOpen3D,
  onOpenQuickView,
  onBuyNow,
  onToast,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 28,
    seconds: 45,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const dealProducts = PRODUCTS.filter((p) => p.discountPercent && p.discountPercent >= 10);

  return (
    <section id="deal-of-the-week" style={{ padding: '40px 0 60px 0', backgroundColor: '#fcfaff' }}>
      <div className="container">
        {/* Section Header with Countdown Timer */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-plum-800)',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: '6px',
            }}
          >
            <Sparkles size={14} color="var(--color-gold)" />
            <span>EXCLUSIVITY & LIMITED PROMOTION</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.7rem, 3.8vw, 2.3rem)',
              fontWeight: 700,
              color: 'var(--color-plum-950)',
              marginBottom: '6px',
            }}
          >
            Curated Deal Of The Week
          </h2>

          <p style={{ fontSize: 'clamp(0.82rem, 2vw, 0.9rem)', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
            Handpicked signature designs available for a limited curation period.
          </p>

          {/* Countdown Clock HUD */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'clamp(8px, 2.5vw, 14px)',
              background: 'var(--color-plum-950)',
              padding: '8px clamp(12px, 3.5vw, 22px)',
              borderRadius: '40px',
              boxShadow: '0 8px 24px rgba(37, 13, 51, 0.22)',
              maxWidth: '100%',
            }}
          >
            <Clock size={16} color="var(--color-gold)" style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 'clamp(6px, 2vw, 12px)', color: '#ffffff', fontWeight: 700, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.1rem)', color: 'var(--color-gold)' }}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.58rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Days</span>
              </div>
              <span style={{ color: 'var(--color-gold)', opacity: 0.6, fontSize: '0.85rem' }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.1rem)', color: 'var(--color-gold)' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.58rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Hours</span>
              </div>
              <span style={{ color: 'var(--color-gold)', opacity: 0.6, fontSize: '0.85rem' }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.1rem)', color: 'var(--color-gold)' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.58rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Mins</span>
              </div>
              <span style={{ color: 'var(--color-gold)', opacity: 0.6, fontSize: '0.85rem' }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.1rem)', color: 'var(--color-gold)' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.58rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Product Grid */}
        <div className="deals-grid">
          {dealProducts.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen3D={onOpen3D}
              onOpenQuickView={onOpenQuickView}
              onBuyNow={onBuyNow}
              onToast={onToast}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

