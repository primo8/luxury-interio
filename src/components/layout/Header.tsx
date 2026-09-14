import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { PRODUCTS } from '../../data/products';
import type { Product, RoomType } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectRoom: (room: RoomType) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onSelectProduct }) => {
  const { openCart, totalItemsCount, total } = useCart();
  const { openWishlist, totalWishlistCount } = useWishlist();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filtered = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.room.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ).slice(0, 5);

    setSearchResults(filtered);
  }, [searchQuery]);

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

  const handleProductClick = (product: Product) => {
    onSelectProduct(product);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <header style={{
      backgroundColor: 'var(--color-surface-white)',
      borderBottom: '1px solid rgba(59, 24, 79, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(37, 13, 51, 0.03)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 320px',
        alignItems: 'center',
        paddingTop: '18px',
        paddingBottom: '18px',
        gap: '20px'
      }}>
        {/* Left: Search Bar */}
        <div ref={searchContainerRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f5f0f8',
            borderRadius: '24px',
            padding: '8px 16px',
            border: isSearchFocused ? '1px solid var(--color-plum-600)' : '1px solid transparent',
            boxShadow: isSearchFocused ? '0 0 0 3px rgba(142, 45, 226, 0.15)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <Search size={16} color="var(--color-plum-700)" style={{ marginRight: '8px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.85rem',
                color: 'var(--color-text-main)',
                fontFamily: 'inherit'
              }}
              aria-label="Search luxury furniture products"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ color: 'var(--color-text-light)', padding: '2px', display: 'flex' }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(59, 24, 79, 0.12)',
              boxShadow: '0 12px 32px rgba(37, 13, 51, 0.16)',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-plum-700)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f0ebf5' }}>
                Found {searchResults.length} Products
              </div>
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f9f6fc',
                    transition: 'background 0.15s ease'
                  }}
                  className="search-item-hover"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      {p.category}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
                    ${p.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: Brand Logo */}
        <div style={{ textAlign: 'center' }}>
          <a href="#" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <div style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '1.9rem',
              fontWeight: 700,
              letterSpacing: '3.5px',
              color: 'var(--color-plum-900)',
              lineHeight: 1
            }}>
              FURNITURA
            </div>
            <div style={{
              fontSize: '0.62rem',
              letterSpacing: '4px',
              fontWeight: 600,
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}>
              FURNITURE STORE
            </div>
          </a>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px' }}>
          {/* User Account */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-plum-900)',
              padding: '6px',
              transition: 'color 0.2s ease'
            }}
            aria-label="User Account"
            title="Account / Sign In"
          >
            <User size={21} />
          </button>

          {/* Wishlist */}
          <button
            onClick={openWishlist}
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              color: 'var(--color-plum-900)',
              padding: '6px',
              transition: 'color 0.2s ease'
            }}
            aria-label={`Wishlist, ${totalWishlistCount} items`}
            title="Wishlist"
          >
            <Heart size={21} />
            {totalWishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0px',
                right: '-4px',
                backgroundColor: 'var(--color-plum-700)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                {totalWishlistCount}
              </span>
            )}
          </button>

          {/* Cart with Live Price */}
          <button
            onClick={openCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--color-plum-900)',
              padding: '6px',
              transition: 'opacity 0.2s ease'
            }}
            aria-label={`Shopping Cart, ${totalItemsCount} items, total $${total.toFixed(2)}`}
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={22} />
              {totalItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-5px',
                  backgroundColor: '#8e2de2',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {totalItemsCount}
                </span>
              )}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.15 }} className="hidden-mobile">
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>My Cart</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
                ${total.toFixed(2)}
              </div>
            </div>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={onOpenMobileMenu}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-plum-900)',
              padding: '6px'
            }}
            className="show-mobile-hamburger"
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
