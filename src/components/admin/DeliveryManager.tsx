import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchAdminDeliveryZones } from '../../utils/adminApi';

export function DeliveryManager() {
  const [zones, setZones] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  const loadZones = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDeliveryZones();
      if (res.success) {
        setZones(res.zones || []);
      }
    } catch (err) {
      console.error('Failed to load delivery zones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Rwanda Regional Delivery Zones & White-Glove Logistics
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Configure district routing, freight rates, free shipping thresholds, and white-glove assembly
            </div>
          </div>
          <button onClick={loadZones} className="admin-btn admin-btn-secondary">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {zones.map((zone) => (
          <div key={zone.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-plum)', textTransform: 'uppercase' }}>
                  {zone.region}
                </div>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.05rem', fontWeight: 800 }}>{zone.name}</h4>
              </div>
              <span className="admin-status-badge in_stock">Active</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
              {zone.description}
            </p>

            {/* Rates & Transit Breakdown */}
            <div style={{ background: 'var(--admin-bg)', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-muted)' }}>Standard Freight Rate:</span>
                <span style={{ fontWeight: 700, color: 'var(--admin-plum)' }}>${zone.fee} USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-muted)' }}>Estimated Delivery:</span>
                <span style={{ fontWeight: 600 }}>{zone.estimatedDays}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-muted)' }}>Free Shipping Over:</span>
                <span style={{ fontWeight: 600 }}>${zone.freeShippingThreshold} USD</span>
              </div>
              {zone.whiteGloveAvailable && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-amethyst)', fontWeight: 600 }}>
                  <span>White Glove Assembly:</span>
                  <span>+${zone.whiteGloveFee} USD</span>
                </div>
              )}
            </div>

            {/* Districts List */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Covered Districts ({zone.districts.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {zone.districts.map((d: string) => (
                  <span
                    key={d}
                    style={{
                      fontSize: '0.7rem',
                      background: '#FFFFFF',
                      border: '1px solid var(--admin-border)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      color: 'var(--admin-text-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
