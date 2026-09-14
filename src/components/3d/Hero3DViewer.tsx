import React, { useEffect, useRef, useState } from 'react';
import { Furniture3DScene } from './ThreeFurnitureScene';
import { RotateCw, Layers, Compass, Sparkles, Check } from 'lucide-react';

interface Hero3DViewerProps {
  onExploreFull?: () => void;
}

const FABRIC_SWATCHES = [
  { name: 'Royal Plum Velvet', hex: '#3B184F', threeColor: 0x3b184f },
  { name: 'Emerald Forest', hex: '#1B4332', threeColor: 0x1b4332 },
  { name: 'Warm Oatmeal', hex: '#EAE4D9', threeColor: 0xeae4d9 },
  { name: 'Obsidian Midnight', hex: '#212529', threeColor: 0x212529 },
];

export const Hero3DViewer: React.FC<Hero3DViewerProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Furniture3DScene | null>(null);
  const [activeColor, setActiveColor] = useState(FABRIC_SWATCHES[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new Furniture3DScene(containerRef.current, {
      modelType: 'sofa',
      primaryColor: activeColor.threeColor,
      autoRotate: prefersReducedMotion ? false : autoRotate,
      wireframe: wireframe,
    });

    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const handleColorChange = (swatch: typeof FABRIC_SWATCHES[0]) => {
    setActiveColor(swatch);
    if (sceneRef.current) {
      sceneRef.current.updatePrimaryColor(swatch.threeColor);
    }
  };

  const toggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    if (sceneRef.current) {
      sceneRef.current.setAutoRotate(next);
    }
  };

  const toggleWireframe = () => {
    const next = !wireframe;
    setWireframe(next);
    if (sceneRef.current) {
      sceneRef.current.setWireframe(next);
    }
  };

  const handleResetCamera = () => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px', borderRadius: '16px', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', cursor: 'grab', position: 'relative' }} 
        aria-label="Interactive 3D Furniture Visualizer - Drag to rotate, scroll to zoom"
      />

      {/* Floating 3D Interaction Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(59, 24, 79, 0.82)',
        backdropFilter: 'blur(12px)',
        color: '#ffffff',
        padding: '6px 14px',
        borderRadius: '30px',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.5px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        pointerEvents: 'none'
      }}>
        <Sparkles size={14} color="#d4af37" />
        <span>3D STUDIO INTERACTIVE</span>
      </div>

      {/* Floating Controls Bar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        gap: '8px',
        zIndex: 10
      }}>
        <button
          onClick={toggleAutoRotate}
          title={autoRotate ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: autoRotate ? 'var(--color-plum-800)' : 'rgba(255, 255, 255, 0.85)',
            color: autoRotate ? '#ffffff' : 'var(--color-plum-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(59, 24, 79, 0.15)'
          }}
          aria-label="Toggle 3D auto rotation"
        >
          <RotateCw size={16} />
        </button>

        <button
          onClick={toggleWireframe}
          title={wireframe ? "Solid Render Mode" : "Wireframe Mode"}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: wireframe ? 'var(--color-plum-800)' : 'rgba(255, 255, 255, 0.85)',
            color: wireframe ? '#ffffff' : 'var(--color-plum-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(59, 24, 79, 0.15)'
          }}
          aria-label="Toggle 3D wireframe mode"
        >
          <Layers size={16} />
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.85)',
            color: 'var(--color-plum-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(59, 24, 79, 0.15)'
          }}
          aria-label="Reset camera orientation"
        >
          <Compass size={16} />
        </button>
      </div>

      {/* Interactive Hotspots Overlay */}
      <div style={{
        position: 'absolute',
        top: '52%',
        left: '32%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
      title="High-Resilience Pocket Springs & Velvet"
      >
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'rgba(142, 45, 226, 0.9)',
          border: '2px solid #ffffff',
          boxShadow: '0 0 16px rgba(142, 45, 226, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 800,
        }}>
          +
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '22%',
        right: '28%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
      title="Turned Brass Steel Leg Detailing"
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(212, 175, 55, 0.95)',
          border: '2px solid #ffffff',
          boxShadow: '0 0 12px rgba(212, 175, 55, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1a0824',
          fontSize: '10px',
          fontWeight: 800
        }}>
          ★
        </div>
      </div>

      {/* Material Color Selector Pill */}
      <div style={{
        position: 'absolute',
        bottom: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        padding: '8px 16px',
        borderRadius: '30px',
        boxShadow: '0 8px 24px rgba(37, 13, 51, 0.16)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid rgba(59, 24, 79, 0.12)',
        zIndex: 10
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-plum-900)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Fabric Color:
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {FABRIC_SWATCHES.map((swatch) => {
            const isSelected = activeColor.name === swatch.name;
            return (
              <button
                key={swatch.name}
                onClick={() => handleColorChange(swatch)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: swatch.hex,
                  border: isSelected ? '2.5px solid #d4af37' : '2px solid #ffffff',
                  boxShadow: isSelected ? '0 0 8px rgba(212, 175, 55, 0.6)' : '0 2px 4px rgba(0,0,0,0.1)',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={swatch.name}
                aria-label={`Select ${swatch.name}`}
              >
                {isSelected && <Check size={12} color={swatch.hex === '#EAE4D9' ? '#1a0824' : '#ffffff'} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
