import React from 'react';
import { X, ChevronRight, Sparkles, Phone, MapPin, User } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { useUserAuth } from '../../context/UserAuthContext';
import type { RoomType } from '../../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (room: RoomType) => void;
  onSelectOffers: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onSelectRoom,
  onSelectOffers,
}) => {
  const { customer, openAuthModal } = useUserAuth();
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      backgroundColor: 'rgba(22, 6, 32, 0.65)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '320px',
        maxWidth: '85vw',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '8px 0 25px rgba(0,0,0,0.2)',
        animation: 'slideDown 0.25s ease-out'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px',
          backgroundColor: 'var(--color-plum-900)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '2px' }}>
              FURNITURA
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-gold)', letterSpacing: '2px' }}>
              LUXURY LIVING
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Account Quick Card */}
        <div style={{ padding: '14px 20px', backgroundColor: '#f9f6fa', borderBottom: '1px solid #ede4f2' }}>
          <button
            onClick={() => {
              openAuthModal();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
              border: '1px solid rgba(59,24,79,0.12)',
              borderRadius: '12px',
              padding: '10px 14px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-plum-900)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 700,
                border: '1px solid var(--color-gold)',
                flexShrink: 0,
              }}
            >
              {customer ? (customer.fullName || 'C')[0].toUpperCase() : <User size={16} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-plum-950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {customer ? customer.fullName : 'Sign In / Register'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {customer ? `${customer.totalOrders || 0} Orders · MongoDB Synced` : 'Access Orders & VIP Benefits'}
              </div>
            </div>
            <ChevronRight size={16} color="var(--color-text-light)" />
          </button>
        </div>

        {/* Categories List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          <div style={{ padding: '0 20px 8px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-plum-700)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Browse By Room
          </div>

          <button
            onClick={() => {
              onSelectRoom('all');
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: '1px solid #f2ecf6',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              textAlign: 'left'
            }}
          >
            <span>All Collections</span>
            <ChevronRight size={16} color="var(--color-text-light)" />
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectRoom(cat.roomKey);
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: '1px solid #f2ecf6',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--color-text-main)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{cat.name}</span>
                {cat.roomKey === 'living' || cat.roomKey === 'bedroom' ? (
                  <span className="badge-new">NEW</span>
                ) : null}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                {cat.count}
              </span>
            </button>
          ))}

          <div style={{ padding: '16px 20px' }}>
            <button
              onClick={() => {
                onSelectOffers();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-plum-800)',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <Sparkles size={16} color="#d4af37" />
              <span>EXPLORE SPECIAL DEALS</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer Contact Info */}
        <div style={{
          padding: '18px 20px',
          backgroundColor: '#fbf8fd',
          borderTop: '1px solid rgba(59,24,79,0.08)',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Phone size={14} color="var(--color-plum-700)" />
            <span>+250 788 000 111</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} color="var(--color-plum-700)" />
            <span>KG 7 Ave, Heights Luxury Plaza</span>
          </div>
        </div>
      </div>

      {/* Backdrop click dismiss */}
      <div style={{ flex: 1 }} onClick={onClose} />
    </div>
  );
};
