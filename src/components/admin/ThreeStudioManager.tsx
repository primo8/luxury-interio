import { useState, useEffect, useRef } from 'react';
import { Sun, RefreshCw } from 'lucide-react';
import { fetchAdmin3DStudio } from '../../utils/adminApi';
import { Furniture3DScene } from '../3d/ThreeFurnitureScene';

export function ThreeStudioManager() {
  const [studioItems, setStudioItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedLighting, setSelectedLighting] = useState<string>('Studio Luxury');

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Furniture3DScene | null>(null);

  const loadStudio = async () => {
    try {
      const res = await fetchAdmin3DStudio();
      if (res.success && res.studioItems) {
        setStudioItems(res.studioItems);
        if (res.studioItems.length > 0) {
          setSelectedItem(res.studioItems[0]);
          setSelectedColor(res.studioItems[0].colors[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load 3D studio:', err);
    }
  };

  useEffect(() => {
    loadStudio();
  }, []);

  // Initialize or update Three.js scene
  useEffect(() => {
    if (!containerRef.current || !selectedItem) return;

    if (sceneRef.current) {
      sceneRef.current.dispose();
      sceneRef.current = null;
    }

    const scene = new Furniture3DScene(containerRef.current, {
      modelType: selectedItem.threeModelType || 'sofa',
      primaryColor: selectedColor?.threeColor || 0x4a1e6d,
      autoRotate: true,
      wireframe: false,
    });

    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [selectedItem]);

  const handleSelectProduct = (item: any) => {
    setSelectedItem(item);
    setSelectedColor(item.colors[0]);
  };

  const handleSelectColor = (col: any) => {
    setSelectedColor(col);
    if (sceneRef.current) {
      sceneRef.current.updatePrimaryColor(col.threeColor);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              3D WebGL Studio & Product Visualizer Pipeline
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Real-time WebGL shader previews, material maps, and ambient lighting presets
            </div>
          </div>
          <button onClick={loadStudio} className="admin-btn admin-btn-secondary">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Left: Product Selector List */}
        <div className="admin-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
            Catalog 3D Assets ({studioItems.length})
          </div>

          {studioItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectProduct(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedItem?.id === item.id ? 'var(--admin-sidebar-hover)' : 'transparent',
                color: selectedItem?.id === item.id ? '#FFFFFF' : 'var(--admin-text-primary)',
                border: selectedItem?.id === item.id ? '1px solid var(--admin-plum)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Model: {item.threeModelType}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Live Interactive Three.js Viewport & Controls */}
        {selectedItem && (
          <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Viewport Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{selectedItem.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  SKU: {selectedItem.sku} • Geometry: {selectedItem.threeModelType}
                </div>
              </div>

              {/* Lighting Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sun size={16} color="var(--admin-gold-dark)" />
                <select
                  className="admin-select"
                  value={selectedLighting}
                  onChange={(e) => setSelectedLighting(e.target.value)}
                  style={{ width: '190px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                >
                  <option value="Studio Luxury">Studio Luxury (Soft Key)</option>
                  <option value="Warm Evening">Warm Evening Sunset</option>
                  <option value="Kigali Daylight">Kigali Natural Daylight</option>
                  <option value="High Contrast Editorial">Editorial High Contrast</option>
                </select>
              </div>
            </div>

            {/* Three.js Canvas Container */}
            <div
              style={{
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                background: 'radial-gradient(circle at center, #2B1832 0%, #150A1A 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#FFFFFF',
                }}
              >
                Drag to orbit • Scroll to zoom • Active: {selectedColor?.name}
              </div>
            </div>

            {/* Materials & Colors Swapper */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Live Shader Material Swatches
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {selectedItem.colors.map((col: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectColor(col)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: selectedColor?.name === col.name ? '2px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                      background: selectedColor?.name === col.name ? 'rgba(212, 175, 55, 0.1)' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: col.hex,
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
