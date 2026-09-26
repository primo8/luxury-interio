import React, { useState } from 'react';
import { Menu, ChevronDown, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import type { RoomType } from '../../types';

interface NavigationBarProps {
  activeRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
  onSelectOffers: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeRoom,
  onSelectRoom,
  onSelectOffers,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  return (
    <nav
      style={{
        backgroundColor: '#1a0928',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        zIndex: 45,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left: Shop by Categories Mega Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              padding: '13px 20px',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              transition: 'background 0.2s ease',
            }}
            aria-expanded={showCategoryDropdown}
            aria-haspopup="true"
          >
            <Menu size={16} />
            <span>COLLECTIONS</span>
            <ChevronDown
              size={13}
              style={{
                transform: showCategoryDropdown ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* Categories Dropdown Menu */}
          {showCategoryDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '280px',
                backgroundColor: '#ffffff',
                boxShadow: '0 18px 40px rgba(37, 13, 51, 0.25)',
                borderRadius: '0 0 12px 12px',
                border: '1px solid rgba(59, 24, 79, 0.1)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectRoom(cat.roomKey);
                    setShowCategoryDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    textAlign: 'left',
                    borderBottom: '1px solid #f6f1f9',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    color: 'var(--color-text-main)',
                    transition: 'background 0.15s ease',
                  }}
                  className="dropdown-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>
                      {cat.roomKey === 'living'
                        ? '🛋️'
                        : cat.roomKey === 'bedroom'
                        ? '🛏️'
                        : cat.roomKey === 'dining'
                        ? '🍽️'
                        : cat.roomKey === 'office'
                        ? '💼'
                        : cat.roomKey === 'storage'
                        ? '🗄️'
                        : '🌿'}
                    </span>
                    <span>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                    {cat.count} pieces
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Main Editorial Navigation Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '22px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
          }}
          className="hidden-mobile"
        >
          <button
            onClick={() => onSelectRoom('all')}
            style={{
              color: activeRoom === 'all' ? 'var(--color-gold)' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'all' ? '2px solid var(--color-gold)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            SHOP
          </button>

          <button
            onClick={() => onSelectRoom('living')}
            style={{
              color: activeRoom === 'living' ? 'var(--color-gold)' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'living' ? '2px solid var(--color-gold)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            LIVING
          </button>

          <button
            onClick={() => onSelectRoom('bedroom')}
            style={{
              color: activeRoom === 'bedroom' ? 'var(--color-gold)' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'bedroom' ? '2px solid var(--color-gold)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            BEDROOM
          </button>

          <button
            onClick={() => onSelectRoom('dining')}
            style={{
              color: activeRoom === 'dining' ? 'var(--color-gold)' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'dining' ? '2px solid var(--color-gold)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            DINING
          </button>

          <button
            onClick={() => onSelectRoom('office')}
            style={{
              color: activeRoom === 'office' ? 'var(--color-gold)' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'office' ? '2px solid var(--color-gold)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            OFFICE
          </button>

          <button
            onClick={() => onSelectRoom('outdoor')}
            style={{
              color: activeRoom === 'outdoor' ? 'var(--color-gold)' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'outdoor' ? '2px solid var(--color-gold)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            OUTDOOR
          </button>

          <button
            onClick={() => onSelectRoom('all')}
            style={{
              color: '#ffffff',
              padding: '14px 4px',
              opacity: 0.9,
              transition: 'opacity 0.2s',
            }}
          >
            NEW ARRIVALS
          </button>
        </div>

        {/* Right: Subtle Gold Best Offers */}
        <div>
          <button
            onClick={onSelectOffers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-gold)',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              padding: '7px 14px',
              borderRadius: '20px',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={13} color="var(--color-gold)" />
            <span>BEST OFFERS</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
