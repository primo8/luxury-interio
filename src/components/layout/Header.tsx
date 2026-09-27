import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ArrowRight, Clock, Compass } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { PRODUCTS } from '../../data/products';
import type { Product, RoomType } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectRoom: (room: RoomType) => void;
  onOpenSandboxPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onSelectProduct,
  onSelectRoom,
}) => {
  const { openCart, totalItemsCount, total } = useCart();
  const { openWishlist, totalWishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Velvet Sofa', 'Marble Table', 'Executive Desk']);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter products for live search
  const q = searchQuery.trim().toLowerCase();
  const searchResults: Product[] = q
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.room.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q))
      ).slice(0, 6)
    : [];

  // Intelligent suggested products when query has no exact match
  const suggestedProducts = PRODUCTS.slice(0, 3);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside search dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleProductClick(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const handleProductClick = (product: Product) => {
    // Save to recent searches
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches((prev) => [searchQuery.trim(), ...prev.slice(0, 3)]);
    }
    onSelectProduct(product);
    setSearchQuery('');
    setIsSearchFocused(false);
    setSelectedIndex(-1);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    searchInputRef.current?.focus();
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface-white)',
        borderBottom: '1px solid rgba(59, 24, 79, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 14px rgba(37, 13, 51, 0.03)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 280px',
          alignItems: 'center',
          paddingTop: '16px',
          paddingBottom: '16px',
          gap: '24px',
        }}
      >
        {/* Left: Luxury Wordmark & Mobile Menu Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onOpenMobileMenu}
            style={{
              display: 'none',
              padding: '6px',
              color: 'var(--color-plum-950)',
            }}
            className="show-mobile-flex"
            aria-label="Open mobile navigation menu"
          >
            <Menu size={24} />
          </button>

          <a
            href="/"
            style={{
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '2.5px',
                color: 'var(--color-plum-950)',
                lineHeight: 1,
              }}
            >
              FURNITURA
            </span>
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                letterSpacing: '2px',
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              Luxury Showroom
            </span>
          </a>
        </div>

        {/* Center: Large Editorial Search Experience */}
        <div ref={searchContainerRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8f5fa',
              borderRadius: '28px',
              padding: '10px 18px',
              border: isSearchFocused
                ? '1px solid var(--color-plum-800)'
                : '1px solid rgba(59, 24, 79, 0.08)',
              boxShadow: isSearchFocused
                ? '0 0 0 3px rgba(59, 24, 79, 0.1), 0 4px 14px rgba(37, 13, 51, 0.06)'
                : 'none',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Search
              size={17}
              color={isSearchFocused ? 'var(--color-plum-800)' : 'var(--color-text-light)'}
              style={{ marginRight: '10px', flexShrink: 0 }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search handcrafted sofas, travertine tables, velvet chairs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.88rem',
                color: 'var(--color-text-main)',
              }}
              aria-label="Search luxury furniture catalog"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndex(-1);
                }}
                style={{
                  color: 'var(--color-text-light)',
                  padding: '2px',
                  display: 'flex',
                }}
                aria-label="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Search Dropdown / Live Results */}
          {isSearchFocused && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(59, 24, 79, 0.1)',
                boxShadow: '0 20px 45px rgba(37, 13, 51, 0.15)',
                padding: '16px',
                zIndex: 200,
                maxHeight: '440px',
                overflowY: 'auto',
                animation: 'fadeIn 0.18s ease-out',
              }}
            >
              {/* If no query entered yet: show Recent & Quick Room Categories */}
              {!searchQuery.trim() && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    <Clock size={13} />
                    <span>Recent Searches</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        style={{
                          backgroundColor: '#f6f0f9',
                          color: 'var(--color-plum-900)',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    <Compass size={13} />
                    <span>Browse by Atmosphere</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { name: 'Living Room', room: 'living' as RoomType },
                      { name: 'Dining Room', room: 'dining' as RoomType },
                      { name: 'Bedroom', room: 'bedroom' as RoomType },
                      { name: 'Executive Office', room: 'office' as RoomType },
                      { name: 'Artisan Storage', room: 'storage' as RoomType },
                      { name: 'Garden / Terrace', room: 'outdoor' as RoomType },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          onSelectRoom(item.room);
                          setIsSearchFocused(false);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#fbf9fc',
                          border: '1px solid rgba(59, 24, 79, 0.05)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                        }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* If query has matches: Show Catalog Live Results */}
              {searchQuery.trim() && searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                    Matching Catalog Pieces ({searchResults.length})
                  </div>
                  {searchResults.map((product, idx) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        backgroundColor: selectedIndex === idx ? '#f5eff8' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          {product.category} · {product.room}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* If query has NO matches: Intelligent suggestions (No dead empty state) */}
              {searchQuery.trim() && searchResults.length === 0 && (
                <div style={{ padding: '10px 4px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                    No exact match for "{searchQuery}"
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                    Explore our curated sofas, lounge chairs, and designer living collections:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {suggestedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleProductClick(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          backgroundColor: '#fbf9fc',
                          cursor: 'pointer',
                        }}
                      >
                        <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block' }}>{p.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>${p.price}</span>
                        </div>
                        <ArrowRight size={14} color="var(--color-plum-700)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Account, Wishlist, Cart Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '18px' }}>
          {/* Admin Command Center Access */}
          <button
            onClick={() => {
              if ((window as any).__toggleAdmin) {
                (window as any).__toggleAdmin();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1E0A1E 0%, #3B184F 100%)',
              color: 'var(--color-gold)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30, 10, 30, 0.15)',
            }}
            className="hidden-mobile"
            title="Switch to FURNITURA Admin Dashboard"
          >
            <span>Admin</span>
          </button>

          {/* Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} className="hidden-mobile">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#f6f0f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-plum-900)',
              }}
            >
              <User size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Client
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                Account
              </span>
            </div>
          </div>

          {/* Wishlist Button with Badge */}
          <button
            onClick={openWishlist}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f6f0f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-plum-900)',
              transition: 'background-color 0.2s',
            }}
            aria-label={`Wishlist containing ${totalWishlistCount} items`}
          >
            <Heart size={19} />
            {totalWishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#e63946',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {totalWishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger with Badge & Total */}
          <button
            onClick={openCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px 6px 10px',
              borderRadius: '30px',
              backgroundColor: 'var(--color-plum-800)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 13, 51, 0.2)',
              transition: 'transform 0.15s ease',
            }}
            aria-label={`Cart containing ${totalItemsCount} items with total $${total}`}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={18} color="var(--color-gold)" />
              {totalItemsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    backgroundColor: 'var(--color-gold)',
                    color: '#160620',
                    fontSize: '0.64rem',
                    fontWeight: 900,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {totalItemsCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="hidden-mobile">
              <span style={{ fontSize: '0.64rem', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Showroom Bag
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                ${total.toLocaleString()}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
