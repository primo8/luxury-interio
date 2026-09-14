import React, { useState } from 'react';
import { Menu, ChevronDown, Flame } from 'lucide-react';
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
    <nav style={{
      backgroundColor: '#1d0b2b',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'relative',
      zIndex: 45
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Left: Shop by Categories Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              padding: '14px 22px',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              transition: 'background 0.2s ease',
            }}
            aria-expanded={showCategoryDropdown}
            aria-haspopup="true"
          >
            <Menu size={18} />
            <span>SHOP BY CATEGORIES</span>
            <ChevronDown size={14} style={{ transform: showCategoryDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>

          {/* Categories Dropdown Menu */}
          {showCategoryDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '260px',
              backgroundColor: '#ffffff',
              boxShadow: '0 15px 35px rgba(37, 13, 51, 0.25)',
              borderRadius: '0 0 10px 10px',
              border: '1px solid rgba(59, 24, 79, 0.1)',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease'
            }}>
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
                    fontSize: '0.86rem',
                    fontWeight: 500,
                    color: 'var(--color-text-main)',
                    transition: 'background 0.15s ease',
                  }}
                  className="dropdown-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>
                      {cat.roomKey === 'living' ? '🛋️' : cat.roomKey === 'bedroom' ? '🛏️' : cat.roomKey === 'dining' ? '🍽️' : cat.roomKey === 'office' ? '💼' : cat.roomKey === 'storage' ? '🗄️' : '🌿'}
                    </span>
                    <span>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-light)' }}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Main Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '26px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.6px',
          textTransform: 'uppercase'
        }} className="hidden-mobile">
          <button
            onClick={() => onSelectRoom('all')}
            style={{
              color: activeRoom === 'all' ? '#d4af37' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'all' ? '2px solid #d4af37' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            HOME
          </button>

          <button
            onClick={() => onSelectRoom('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#ffffff',
              padding: '14px 4px',
              transition: 'color 0.2s ease'
            }}
          >
            <span>SHOP</span>
            <ChevronDown size={13} />
          </button>

          <button
            onClick={() => onSelectRoom('living')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeRoom === 'living' ? '#d4af37' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'living' ? '2px solid #d4af37' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <span>LIVING ROOM</span>
            <span className="badge-new">NEW</span>
          </button>

          <button
            onClick={() => onSelectRoom('bedroom')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: activeRoom === 'bedroom' ? '#d4af37' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'bedroom' ? '2px solid #d4af37' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <span>BEDROOM</span>
            <span className="badge-new">NEW</span>
          </button>

          <button
            onClick={() => onSelectRoom('dining')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: activeRoom === 'dining' ? '#d4af37' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'dining' ? '2px solid #d4af37' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <span>DINING ROOM</span>
            <ChevronDown size={13} />
          </button>

          <button
            onClick={() => onSelectRoom('office')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: activeRoom === 'office' ? '#d4af37' : '#ffffff',
              padding: '14px 4px',
              borderBottom: activeRoom === 'office' ? '2px solid #d4af37' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <span>OFFICE</span>
            <ChevronDown size={13} />
          </button>
        </div>

        {/* Right: Best Offers with Flame Icon */}
        <div>
          <button
            onClick={onSelectOffers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#d4af37',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Flame size={16} color="#d4af37" />
            <span>BEST OFFERS</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
