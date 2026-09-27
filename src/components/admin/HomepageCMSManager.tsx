import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminCMS, updateAdminCMS } from '../../utils/adminApi';

export function HomepageCMSManager() {
  const { showAdminToast } = useAdmin();
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadCMS = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminCMS();
      if (res.success && res.cms) {
        setCms(res.cms);
      }
    } catch (err) {
      console.error('Failed to load CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCMS();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cms) return;

    setIsSaving(true);
    try {
      const res = await updateAdminCMS(cms);
      if (res.success) {
        showAdminToast('Storefront CMS homepage configuration updated!', 'success');
      } else {
        showAdminToast('Failed to update CMS', 'error');
      }
    } catch (err) {
      showAdminToast('Server error updating CMS', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !cms) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading CMS configuration...</div>;
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Storefront Content Management (CMS)
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Dynamically control hero lookbook, announcement bars, promotional banners, and featured showcases without source code changes
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="admin-btn admin-btn-primary">
            <Save size={16} />
            <span>{isSaving ? 'Publishing Changes...' : 'Publish to Storefront'}</span>
          </button>
        </div>
      </div>

      {/* Hero Lookbook Section */}
      <div className="admin-card">
        <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--admin-plum)' }}>
          Hero Cinematic Lookbook & Title
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="admin-label">Top Hero Badge</label>
            <input
              type="text"
              className="admin-input"
              value={cms.heroBadge || ''}
              onChange={(e) => setCms({ ...cms, heroBadge: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Main Hero Title</label>
            <input
              type="text"
              className="admin-input"
              value={cms.heroTitle || ''}
              onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Hero Editorial Subtitle Narrative</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={cms.heroSubtitle || ''}
              onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label className="admin-label">Primary CTA Button Text</label>
              <input
                type="text"
                className="admin-input"
                value={cms.heroPrimaryCtaText || ''}
                onChange={(e) => setCms({ ...cms, heroPrimaryCtaText: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Secondary CTA Button Text</label>
              <input
                type="text"
                className="admin-input"
                value={cms.heroSecondaryCtaText || ''}
                onChange={(e) => setCms({ ...cms, heroSecondaryCtaText: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Announcement Bar */}
      <div className="admin-card">
        <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--admin-plum)' }}>
          Top Global Announcement Ticker
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="admin-label">Announcement Banner Text</label>
            <input
              type="text"
              className="admin-input"
              value={cms.announcementText || ''}
              onChange={(e) => setCms({ ...cms, announcementText: e.target.value })}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={cms.announcementActive}
              onChange={(e) => setCms({ ...cms, announcementActive: e.target.checked })}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enable Announcement Bar on Storefront</span>
          </label>
        </div>
      </div>
    </form>
  );
}
