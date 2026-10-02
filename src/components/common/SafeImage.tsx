import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  containerStyle?: React.CSSProperties;
}

// Built-in luxury SVG placeholder data URL when network is unavailable or image fails
const LUXURY_FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
  <rect width="600" height="600" fill="#250D33"/>
  <circle cx="300" cy="300" r="180" fill="url(#grad)" opacity="0.4"/>
  <path d="M220 380 L300 240 L380 380 Z" stroke="#D4AF37" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="rgba(212,175,55,0.1)"/>
  <circle cx="300" cy="270" r="28" stroke="#D4AF37" stroke-width="5" fill="none"/>
  <text x="300" y="440" font-family="'Cinzel', serif" font-size="22" font-weight="700" fill="#D4AF37" text-anchor="middle" letter-spacing="4">FURNITURA</text>
  <text x="300" y="470" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#E0AAFF" text-anchor="middle" letter-spacing="2">LUXURY COLLECTION</text>
  <defs>
    <radialGradient id="grad" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#8E2DE2"/>
      <stop offset="100%" stop-color="#250D33" stop-opacity="0"/>
    </radialGradient>
  </defs>
</svg>
`)}`;

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc = '/hero-chair.jpg',
  aspectRatio,
  style,
  containerStyle,
  className,
  loading = 'lazy',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (imgSrc !== fallbackSrc && fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        setImgSrc(LUXURY_FALLBACK_SVG);
      }
    } else if (imgSrc !== LUXURY_FALLBACK_SVG) {
      setImgSrc(LUXURY_FALLBACK_SVG);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        backgroundColor: '#f6f1f9',
        ...(aspectRatio ? { aspectRatio } : {}),
        ...containerStyle,
      }}
    >
      {/* Shimmer Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f0e9f5 0%, #faf6fc 50%, #f0e9f5 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 1,
          }}
        />
      )}

      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isLoaded || hasError ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.4s ease',
          ...style,
        }}
        className={className}
        {...props}
      />
    </div>
  );
};
