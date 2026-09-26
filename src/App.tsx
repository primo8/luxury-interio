import { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { TopAnnouncement } from './components/layout/TopAnnouncement';
import { Header } from './components/layout/Header';
import { NavigationBar } from './components/layout/NavigationBar';
import { MobileFloatingDock } from './components/layout/MobileFloatingDock';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { HeroSection } from './components/home/HeroSection';
import { ShopByRoom } from './components/home/ShopByRoom';
import { PromoBanners } from './components/home/PromoBanners';
import { PopularProducts } from './components/home/PopularProducts';
import { ValuePropsBar } from './components/home/ValuePropsBar';
import { DealOfTheWeek } from './components/home/DealOfTheWeek';
import { NewsletterVIP } from './components/home/NewsletterVIP';
import { Footer } from './components/layout/Footer';
import { Product3DModal } from './components/3d/Product3DModal';
import { ProductQuickView } from './components/product/ProductQuickView';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { MtnSandboxTestPanel } from './components/admin/MtnSandboxTestPanel';
import { ToastContainer, type ToastMessage } from './components/common/Toast';
import type { Product, RoomType, DirectBuyItem, ColorOption } from './types';
import { PRODUCTS } from './data/products';

export function AppContent() {
  const { openCart } = useCart();
  const [activeRoom, setActiveRoom] = useState<RoomType>('all');
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'categories' | '3d' | 'wishlist' | 'cart'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSandboxTestOpen, setIsSandboxTestOpen] = useState(false);

  // Direct Buy Now Item State (Bypasses cart when Buy Now is clicked)
  const [directBuyItem, setDirectBuyItem] = useState<DirectBuyItem | null>(null);

  // 3D Inspector Modal State
  const [selected3DProduct, setSelected3DProduct] = useState<Product | null>(null);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  // Quick View Modal State
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: { title: string; description?: string; type?: 'cart' | 'wishlist' }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpen3D = (product: Product) => {
    setSelected3DProduct(product);
    setIs3DModalOpen(true);
  };

  const handleOpenQuickView = (product: Product) => {
    setSelectedQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleOpenHero3D = () => {
    // Open flagship modular sofa in full 3D inspector
    const heroProduct = PRODUCTS.find((p) => p.id === 'prod-7') || PRODUCTS[0];
    handleOpen3D(heroProduct);
  };

  const handleSelectRoom = (room: RoomType) => {
    setActiveRoom(room);
    const popularSec = document.getElementById('popular-products');
    if (popularSec) {
      popularSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectOffers = () => {
    const dealsSec = document.getElementById('deal-of-the-week');
    if (dealsSec) {
      dealsSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct Buy Now handler from ProductCard
  const handleBuyNowFromCard = (product: Product) => {
    const defaultColor = product.colors[0] || { name: 'Royal Plum', hex: '#3B184F', threeColor: 0x3b184f };
    setDirectBuyItem({
      product,
      quantity: 1,
      selectedColor: defaultColor,
    });
    setIsCheckoutOpen(true);
  };

  // Direct Buy Now handler from QuickView modal
  const handleBuyNowFromQuickView = (product: Product, quantity: number, selectedColor: ColorOption) => {
    setDirectBuyItem({
      product,
      quantity,
      selectedColor,
    });
    setIsCheckoutOpen(true);
  };

  // Standard cart checkout handler
  const handleProceedFromCartDrawer = () => {
    setDirectBuyItem(null); // Use standard cart items
    setIsCheckoutOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Top Announcement Bar */}
      <TopAnnouncement
        onShopDeals={handleSelectOffers}
        onOpenSandboxPanel={() => setIsSandboxTestOpen(true)}
      />

      {/* 2. Main Header with Search, Logo, Cart */}
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onSelectProduct={(p) => handleOpenQuickView(p)}
        onSelectRoom={handleSelectRoom}
        onOpenSandboxPanel={() => setIsSandboxTestOpen(true)}
      />

      {/* 3. Navigation Bar (Mega Menu & Room Links) */}
      <NavigationBar
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        onSelectOffers={handleSelectOffers}
      />

      {/* Main Page Sections */}
      <main style={{ flex: 1 }}>
        {/* 4. Hero Section with Cinematic Lookbook & 3D Studio */}
        <HeroSection
          onShopNow={(room) => handleSelectRoom(room || 'living')}
          onOpen3DStudio={handleOpenHero3D}
        />

        {/* 5. Shop By Room Circular Category Row */}
        <ShopByRoom
          activeRoom={activeRoom}
          onSelectRoom={handleSelectRoom}
        />

        {/* 6. Trio Curated Promotional Feature Cards */}
        <PromoBanners
          onSelectRoom={handleSelectRoom}
        />

        {/* 7. Popular Products Section with Tab Filters */}
        <PopularProducts
          activeRoom={activeRoom}
          onSelectRoom={setActiveRoom}
          onOpen3D={handleOpen3D}
          onOpenQuickView={handleOpenQuickView}
          onBuyNow={handleBuyNowFromCard}
          onToast={addToast}
        />

        {/* 8. Value Proposition Dark Pill Bar */}
        <ValuePropsBar />

        {/* 9. Deal Of The Week Countdown & Sale Grid */}
        <DealOfTheWeek
          onOpen3D={handleOpen3D}
          onOpenQuickView={handleOpenQuickView}
          onBuyNow={handleBuyNowFromCard}
          onToast={addToast}
        />

        {/* 10. VIP Newsletter Subscription with Promo Code */}
        <NewsletterVIP />
      </main>

      {/* 11. Footer */}
      <Footer
        onSelectRoom={handleSelectRoom}
        onOpenSandboxPanel={() => setIsSandboxTestOpen(true)}
      />

      {/* 12. Floating Glassmorphic Mobile Dock */}
      <MobileFloatingDock
        activeTab={activeMobileTab}
        onSelectTab={setActiveMobileTab}
        onOpen3DStudio={handleOpenHero3D}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelectRoom={handleSelectRoom}
        onSelectOffers={handleSelectOffers}
      />

      {/* 3D Interactive Product Inspector Modal */}
      <Product3DModal
        isOpen={is3DModalOpen}
        product={selected3DProduct}
        onClose={() => setIs3DModalOpen(false)}
      />

      {/* Product Quick View Modal */}
      <ProductQuickView
        isOpen={isQuickViewOpen}
        product={selectedQuickViewProduct}
        onClose={() => setIsQuickViewOpen(false)}
        onOpen3D={handleOpen3D}
        onBuyNow={handleBuyNowFromQuickView}
        onToast={addToast}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={handleProceedFromCartDrawer}
        onExploreProducts={() => handleSelectRoom('all')}
      />

      {/* Slide-out Wishlist Drawer */}
      <WishlistDrawer
        onOpenProduct3D={handleOpen3D}
      />

      {/* Multi-step Checkout Modal with MTN MoMo Sandbox Gateway */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectBuyItem(null);
        }}
        directBuyItem={directBuyItem}
        onClearDirectBuy={() => setDirectBuyItem(null)}
        onOpenTestPanel={() => setIsSandboxTestOpen(true)}
      />

      {/* Developer MTN MoMo Sandbox Diagnostic & Testing Panel */}
      <MtnSandboxTestPanel
        isOpen={isSandboxTestOpen}
        onClose={() => setIsSandboxTestOpen(false)}
      />

      {/* Floating Luxury Toasts */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onOpenCart={openCart}
      />
    </div>
  );
}

export default function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </WishlistProvider>
  );
}
