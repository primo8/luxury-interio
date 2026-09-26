import React, { useState } from 'react';
import { Truck, ChevronDown, Globe, Terminal } from 'lucide-react';

interface TopAnnouncementProps {
  onShopDeals?: () => void;
  onOpenSandboxPanel?: () => void;
}

export const TopAnnouncement: React.FC<TopAnnouncementProps> = ({ onShopDeals, onOpenSandboxPanel }) => {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'RWF'>('USD');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-plum-950)',
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: '0.78rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '7px 0',
        position: 'relative',
        zIndex: 60,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Announcement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={14} color="var(--color-gold)" />
          <span>
            Complimentary Delivery on Selected Orders{' '}
            <button
              onClick={onShopDeals}
              style={{
                color: 'var(--color-gold)',
                fontWeight: 700,
                textDecoration: 'underline',
                marginLeft: '4px',
                letterSpacing: '0.4px',
              }}
            >
              EXPLORE
            </button>
          </span>
        </div>

        {/* Right: Editorial Navigation & Currency */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="hidden-mobile">
          <a href="#about" style={{ opacity: 0.85, transition: 'opacity 0.2s' }}>About</a>
          <span style={{ opacity: 0.3 }}>·</span>
          <a href="#journal" style={{ opacity: 0.85, transition: 'opacity 0.2s' }}>Journal</a>
          <span style={{ opacity: 0.3 }}>·</span>
          <a href="#contact" style={{ opacity: 0.85, transition: 'opacity 0.2s' }}>Contact</a>
          <span style={{ opacity: 0.3 }}>·</span>
          <a href="#help" style={{ opacity: 0.85, transition: 'opacity 0.2s' }}>Help</a>
          <span style={{ opacity: 0.3 }}>·</span>

          {/* Developer Sandbox Panel Trigger */}
          {onOpenSandboxPanel && (
            <>
              <button
                onClick={onOpenSandboxPanel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--color-gold)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                <Terminal size={12} />
                <span>MoMo Sandbox</span>
              </button>
              <span style={{ opacity: 0.3 }}>·</span>
            </>
          )}

          {/* Currency / Region Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
              aria-label="Select currency"
            >
              <Globe size={13} color="var(--color-gold)" />
              <span>{currency}</span>
              <ChevronDown size={12} />
            </button>

            {showCurrencyMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  backgroundColor: 'var(--color-plum-900)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '4px 0',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  minWidth: '110px',
                  zIndex: 100,
                }}
              >
                {(['USD', 'EUR', 'RWF'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      setShowCurrencyMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      textAlign: 'left',
                      color: currency === curr ? 'var(--color-gold)' : '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: currency === curr ? 700 : 400,
                      display: 'block',
                    }}
                  >
                    {curr} {curr === 'USD' ? '($)' : curr === 'EUR' ? '(€)' : '(FRW)'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
