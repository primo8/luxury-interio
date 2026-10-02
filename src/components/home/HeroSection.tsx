import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Box, ChevronLeft, ChevronRight, Pause, Play, Eye } from 'lucide-react';
import { Hero3DViewer } from '../3d/Hero3DViewer';
import { SafeImage } from '../common/SafeImage';
import type { RoomType } from '../../types';

interface HeroSectionProps {
  onShopNow: (room?: RoomType) => void;
  onOpen3DStudio: () => void;
}

interface HeroSlide {
  id: string;
  image: string;
  tag: string;
  title: string;
  highlightText: string;
  subtitle: string;
  room: RoomType;
  accentBadge: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-sapphire-chair',
    image: '/hero-slide-1.jpg',
    tag: 'NEW ARRIVAL • 2026 EDITORIAL',
    title: 'Sapphire Velvet Accent Chair',
    highlightText: 'Modern Sculptural Luxury',
    subtitle: 'Iconic barrel silhouette with handcrafted solid oak legs and ultra-dense royal blue velvet cushioning.',
    room: 'living',
    accentBadge: '★ FEATURED HIGHLIGHT'
  },
  {
    id: 'slide-emerald-sectional',
    image: '/hero-slide-2.jpg',
    tag: 'SIGNATURE LIVING • 20% OFF',
    title: 'Emerald Velvet Modular Sectional',
    highlightText: 'Grand Architectural Comfort',
    subtitle: 'High-resilience down filling, solid kiln-dried interior hardwood, and Italian jewel-toned velvet.',
    room: 'living',
    accentBadge: '🔥 BESTSELLER'
  },
  {
    id: 'slide-oak-dining',
    image: '/hero-slide-3.jpg',
    tag: 'MINIMALIST DINING • HANDCRAFTED',
    title: 'Nordic White Oak Oval Dining Set',
    highlightText: 'Timeless Scandinavian Craft',
    subtitle: 'FSC-certified solid oak paired with ergonomic curved dining chairs and ambient pendant harmony.',
    room: 'dining',
    accentBadge: '🌿 FSC-CERTIFIED'
  },
  {
    id: 'slide-master-bedroom',
    image: '/hero-slide-4.jpg',
    tag: 'SERENE SUITE • LUXURY COLLECTION',
    title: 'Master Skyline Bedroom & Lounge',
    highlightText: 'Elevated Rest & Relaxation',
    subtitle: 'Deep upholstered headboard, bouclé accent seating, and warm brass nightstand detailing.',
    room: 'bedroom',
    accentBadge: '✨ 10-YR WARRANTY'
  }
];

const SLIDE_DURATION = 4500; // 4.5 seconds per slide

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopNow, onOpen3DStudio }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'lookbook' | '3d'>('lookbook');
  const [progress, setProgress] = useState(0);
  const isHoveredRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Auto-slide effect with progress tracking
  useEffect(() => {
    if (!isPlaying || viewMode === '3d') return;

    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      if (!isHoveredRef.current) {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentSlideIndex((oldIndex) => (oldIndex + 1) % HERO_SLIDES.length);
            return 0;
          }
          return prev + step;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, viewMode, currentSlideIndex]);

  const handleNextSlide = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleSelectSlide = (index: number) => {
    setProgress(0);
    setCurrentSlideIndex(index);
  };

  // Touch Swipe Handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    // Threshold of 40px for swipe gesture
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      style={{
        position: 'relative',
        color: '#ffffff',
        minHeight: '520px',
        overflow: 'hidden',
        backgroundColor: '#160620',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Furniture Lookbook"
    >
      {/* Background Image Carousel Layer (High Clarity & Visibility) */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlideIndex;
        return (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 6s ease-out',
              transform: isActive ? 'scale(1.03)' : 'scale(1)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <SafeImage
              src={slide.image}
              alt={slide.title}
              fallbackSrc="/hero-chair.jpg"
              loading={index === 0 ? 'eager' : 'lazy'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 45%',
                filter: 'brightness(0.92) contrast(1.06)',
              }}
            />
          </div>
        );
      })}

      {/* Cinematic Gradient Mask: Keeps text crystal readable while the furniture image is bright and vivid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(18, 5, 26, 0.94) 0%, rgba(24, 7, 34, 0.82) 40%, rgba(30, 10, 42, 0.45) 70%, rgba(18, 5, 26, 0.2) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Radial Lighting Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '15%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(142, 45, 226, 0.22) 0%, rgba(59, 24, 79, 0) 70%)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Area */}
      <div className="container" style={{ position: 'relative', zIndex: 10, padding: '36px 16px 40px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === '3d' ? '1fr 1.15fr' : '1.15fr 0.85fr',
            gap: '28px',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column: Dynamic Hero Content for Active Slide */}
          <div style={{ maxWidth: '640px' }}>
            {/* Tag / Category Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(212, 175, 55, 0.18)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: 'var(--color-gold)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Sparkles size={13} />
                <span>THE NEW FURNITURA COLLECTION</span>
              </div>

              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.5px',
                }}
              >
                {currentSlide.accentBadge}
              </span>
            </div>

            {/* Slide Title */}
            <h1
              key={currentSlide.id + '-title'}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.9rem, 4.5vw, 3.6rem)',
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                marginBottom: '14px',
                color: '#ffffff',
                textShadow: '0 2px 18px rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.4s ease-out',
              }}
            >
              Elegant Furniture <br />
              <span style={{ color: 'var(--color-gold)', fontStyle: 'italic', fontWeight: 600 }}>
                for Modern Living
              </span>
            </h1>

            {/* Subtitle Description */}
            <p
              key={currentSlide.id + '-desc'}
              style={{
                fontSize: 'clamp(0.88rem, 2.5vw, 1.05rem)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                marginBottom: '24px',
                lineHeight: 1.55,
                maxWidth: '560px',
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
                animation: 'fadeIn 0.4s ease-out',
              }}
            >
              Timeless design, exceptional comfort, beautifully crafted for the way you live. Featuring our {currentSlide.title}.
            </p>

            {/* CTA Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }} className="hero-slide-btn-group">
              <button
                onClick={() => onShopNow(currentSlide.room)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  padding: '12px 26px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 8px 25px rgba(37, 13, 51, 0.5)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  if (viewMode === '3d') {
                    onOpen3DStudio();
                  } else {
                    setViewMode('3d');
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: viewMode === '3d' ? 'var(--color-plum-900)' : 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                <Box size={16} color="var(--color-gold)" />
                <span>{viewMode === '3d' ? 'FULLSCREEN 3D STUDIO' : 'EXPLORE 3D STUDIO'}</span>
              </button>

              {viewMode === '3d' && (
                <button
                  onClick={() => setViewMode('lookbook')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#d4af37',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    transition: 'all 0.25s ease',
                    minHeight: '44px',
                  }}
                >
                  <Eye size={15} />
                  <span>BACK TO LOOKBOOK</span>
                </button>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '26px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#d4af37' }}>5,000+</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Curated Pieces
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.18)' }} />
              <div>
                <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#d4af37' }}>10-Year</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Craft Guarantee
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.18)' }} />
              <div>
                <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#d4af37' }}>100%</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hand-Inspected
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Studio (in 3D mode) OR Featured Spotlight Overlay (in Lookbook mode) */}
          <div style={{ minHeight: '340px', position: 'relative' }} className="hidden-mobile">
            {viewMode === '3d' ? (
              <div style={{ minHeight: '380px', height: '100%' }}>
                <Hero3DViewer onExploreFull={onOpen3DStudio} />
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  height: '100%',
                  padding: '20px 0',
                }}
              >
                {/* Floating Glassmorphic Slide Card Badge */}
                <div
                  style={{
                    backgroundColor: 'rgba(26, 8, 36, 0.78)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    maxWidth: '340px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                    animation: 'fadeIn 0.4s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d4af37', letterSpacing: '1px' }}>
                      COLLECTION 0{currentSlideIndex + 1} / 0{HERO_SLIDES.length}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#e0aaff', background: 'rgba(142, 45, 226, 0.3)', padding: '2px 8px', borderRadius: '10px' }}>
                      AUTO-SCROLL
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '3px' }}>
                    {currentSlide.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.4 }}>
                    Photographed in high architectural fidelity with true-to-life lighting.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Carousel Controls & Slide Indicator Pills */}
        <div
          style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Left: Prev / Pause / Next Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrevSlide}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
              title="Previous slide"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isPlaying ? 'rgba(255, 255, 255, 0.12)' : 'var(--color-plum-700)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
              title={isPlaying ? 'Pause Auto-Scroll' : 'Resume Auto-Scroll'}
              aria-label={isPlaying ? 'Pause Auto-Scroll' : 'Resume Auto-Scroll'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <button
              onClick={handleNextSlide}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
              title="Next slide"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>

            <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)', marginLeft: '4px' }}>
              {currentSlideIndex + 1} / {HERO_SLIDES.length}
            </span>
          </div>

          {/* Center / Right: Interactive Slide Thumbnail Pills with Live Progress Bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px' }}>
            {HERO_SLIDES.map((slide, idx) => {
              const isCurrent = idx === currentSlideIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => handleSelectSlide(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: isCurrent ? '1.5px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.72rem',
                    fontWeight: isCurrent ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                >
                  {/* Progress filler bar for current slide */}
                  {isCurrent && isPlaying && viewMode === 'lookbook' && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${progress}%`,
                        backgroundColor: 'rgba(212, 175, 55, 0.3)',
                        transition: 'width 50ms linear',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? '#d4af37' : 'rgba(255, 255, 255, 0.4)',
                    }}
                  />
                  <span style={{ position: 'relative', zIndex: 2 }}>{slide.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};


