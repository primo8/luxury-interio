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
    <section id="deal-of-the-week" style={{ padding: '60px 0 80px 0', backgroundColor: '#fcfaff' }}>
      <div className="container">
        {/* Section Header with Countdown Timer */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-plum-800)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: '6px',
            }}
          >
            <Sparkles size={15} color="var(--color-gold)" />
            <span>EXCLUSIVITY & LIMITED PROMOTION</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.3rem',
              fontWeight: 700,
              color: 'var(--color-plum-950)',
              marginBottom: '8px',
            }}
          >
            Curated Deal Of The Week
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '22px' }}>
            Handpicked signature designs available for a limited curation period.
          </p>

          {/* Countdown Clock HUD */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              background: 'var(--color-plum-950)',
              padding: '10px 24px',
              borderRadius: '40px',
              boxShadow: '0 8px 24px rgba(37, 13, 51, 0.22)',
            }}
          >
            <Clock size={18} color="var(--color-gold)" />
            <div style={{ display: 'flex', gap: '12px', color: '#ffffff', fontWeight: 700 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Days</span>
              </div>
              <span style={{ color: 'var(--color-gold)', opacity: 0.6 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Hours</span>
              </div>
              <span style={{ color: 'var(--color-gold)', opacity: 0.6 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Mins</span>
              </div>
              <span style={{ color: 'var(--color-gold)', opacity: 0.6 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Product Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
          className="deals-grid"
        >
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
