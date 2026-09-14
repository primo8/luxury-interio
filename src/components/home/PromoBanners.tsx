import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PROMO_BANNERS } from '../../data/products';
import type { RoomType } from '../../types';

interface PromoBannersProps {
  onSelectRoom: (room: RoomType) => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({ onSelectRoom }) => {
  return (
    <section style={{ padding: '30px 0 60px 0', backgroundColor: '#ffffff' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px'
        }} className="promo-banners-grid">
          {PROMO_BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                background: index === 0 
                  ? 'linear-gradient(145deg, #371549 0%, #4a1e6d 100%)' 
                  : index === 1 
                  ? 'linear-gradient(145deg, #2b0f3a 0%, #3e1858 100%)' 
                  : 'linear-gradient(145deg, #421b5f 0%, #592283 100%)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(37, 13, 51, 0.12)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              className="promo-card-hover"
            >
              {/* Text Header Area */}
              <div style={{ padding: '28px 26px 16px 26px', position: 'relative', zIndex: 5 }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  color: '#e0aaff',
                  marginBottom: '10px'
                }}>
                  {banner.tag}
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  marginBottom: '8px',
                  color: '#ffffff'
                }}>
                  {banner.title}
                </h3>

                <p style={{
                  fontSize: '0.84rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: '18px',
                  lineHeight: 1.4
                }}>
                  {banner.subtitle}
                </p>

                <button
                  onClick={() => onSelectRoom(banner.roomFilter)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    padding: '8px 0',
                    borderBottom: '1.5px solid #d4af37',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:text-gold"
                >
                  <span>{banner.buttonText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Image Preview Container */}
              <div style={{
                height: '180px',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                marginTop: 'auto'
              }}>
                <img
                  src={banner.image}
                  alt={banner.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'transform 0.5s ease'
                  }}
                  className="promo-img"
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(37, 13, 51, 0.4) 0%, transparent 60%)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
