import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../data/products';
import type { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { Clock, Flame } from 'lucide-react';

interface DealOfTheWeekProps {
  onOpen3D: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export const DealOfTheWeek: React.FC<DealOfTheWeekProps> = ({
  onOpen3D,
  onOpenQuickView,
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
    <section id="deal-of-the-week" style={{ padding: '40px 0 80px 0', backgroundColor: '#fdfbff' }}>
      <div className="container">
        {/* Section Header with Countdown Timer */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-plum-700)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '6px'
          }}>
            <Flame size={16} color="#d4af37" />
            <span>FLASH PROMOTION</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.3rem',
            fontWeight: 700,
            color: 'var(--color-plum-900)',
            marginBottom: '6px'
          }}>
            Deal Of The Week
          </h2>

          <p style={{ fontSize: '0.94rem', color: 'var(--color-text-muted)', marginBottom: '22px' }}>
            Limited time offer you don't want to miss
          </p>

          {/* Countdown Clock HUD */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            background: 'var(--color-plum-900)',
            padding: '10px 24px',
            borderRadius: '40px',
            boxShadow: '0 8px 20px rgba(37, 13, 51, 0.16)'
          }}>
            <Clock size={18} color="#d4af37" />
            <div style={{ display: 'flex', gap: '12px', color: '#ffffff', fontWeight: 700 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: '#d4af37' }}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Days</span>
              </div>
              <span style={{ color: '#d4af37', opacity: 0.6 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: '#d4af37' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Hours</span>
              </div>
              <span style={{ color: '#d4af37', opacity: 0.6 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: '#d4af37' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Mins</span>
              </div>
              <span style={{ color: '#d4af37', opacity: 0.6 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: '#d4af37' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.62rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '20px',
        }} className="deals-grid">
          {dealProducts.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen3D={onOpen3D}
              onOpenQuickView={onOpenQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
