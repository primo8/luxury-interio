import React from 'react';
import { Home, Grid, Box, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileFloatingDockProps {
  activeTab: 'home' | 'categories' | '3d' | 'wishlist' | 'cart';
  onSelectTab: (tab: 'home' | 'categories' | '3d' | 'wishlist' | 'cart') => void;
  onOpen3DStudio: () => void;
}

export const MobileFloatingDock: React.FC<MobileFloatingDockProps> = ({
  activeTab,
  onSelectTab,
  onOpen3DStudio,
}) => {
  const { openCart, totalItemsCount } = useCart();
  const { openWishlist, totalWishlistCount } = useWishlist();

  return (
    <div className="mobile-dock" role="navigation" aria-label="Mobile Navigation Dock">
      {/* 1. Home */}
      <button
        className={`mobile-dock-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => {
          onSelectTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        aria-label="Navigate to Home"
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      {/* 2. Categories / Catalog */}
      <button
        className={`mobile-dock-item ${activeTab === 'categories' ? 'active' : ''}`}
        onClick={() => {
          onSelectTab('categories');
          const el = document.getElementById('shop-by-room');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="View Categories"
      >
        <Grid size={20} />
        <span>Explore</span>
      </button>

      {/* 3. Center FAB: 3D Studio Action */}
      <button
        className="mobile-dock-fab"
        onClick={() => {
          onOpen3DStudio();
        }}
        aria-label="Launch 3D Studio Visualizer"
        title="3D Studio"
      >
        <Box size={24} />
      </button>

      {/* 4. Wishlist */}
      <button
        className={`mobile-dock-item ${activeTab === 'wishlist' ? 'active' : ''}`}
        onClick={() => {
          openWishlist();
        }}
        aria-label={`Wishlist, ${totalWishlistCount} items`}
      >
        <div style={{ position: 'relative' }}>
          <Heart size={20} />
          {totalWishlistCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              backgroundColor: '#e63946',
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: 700,
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {totalWishlistCount}
            </span>
          )}
        </div>
        <span>Saved</span>
      </button>

      {/* 5. Cart */}
      <button
        className={`mobile-dock-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => {
          openCart();
        }}
        aria-label={`Shopping Cart, ${totalItemsCount} items`}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={20} />
          {totalItemsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              backgroundColor: 'var(--color-plum-700)',
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: 700,
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {totalItemsCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>
    </div>
  );
};
