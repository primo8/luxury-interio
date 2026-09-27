import { useState, useEffect } from 'react';
import { Save, Zap } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminSettings, updateAdminSettings } from '../../utils/adminApi';

export function SystemSettings() {
  const { showAdminToast } = useAdmin();
  const [settings, setSettings] = useState<any>(null);
  const [mtnDiagnostic, setMtnDiagnostic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminSettings();
      if (res.success) {
        setSettings(res.settings);
        setMtnDiagnostic(res.mtnDiagnostic);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await updateAdminSettings(settings);
      if (res.success) {
        showAdminToast('System settings successfully saved!', 'success');
      } else {
        showAdminToast('Failed to save settings', 'error');
      }
    } catch (err) {
      showAdminToast('Server error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !settings) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading system settings...</div>;
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Store Configuration & Gateway Settings</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Manage store profile, currencies, tax configurations, and inspect safe payment diagnostics
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="admin-btn admin-btn-primary">
            <Save size={16} />
            <span>{isSaving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Safe MTN MoMo Diagnostic Box (Never exposes secret keys) */}
      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={20} color="var(--admin-gold-dark)" />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--admin-plum)' }}>
            MTN MoMo Sandbox Gateway Status
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ background: 'var(--admin-bg)', padding: '0.85rem', borderRadius: '8px' }}>
            <span className="admin-label">Environment Target</span>
            <div style={{ fontWeight: 700, color: '#D97706' }}>
              {mtnDiagnostic?.environment?.toUpperCase() || 'SANDBOX'}
            </div>
          </div>

          <div style={{ background: 'var(--admin-bg)', padding: '0.85rem', borderRadius: '8px' }}>
            <span className="admin-label">Integration Engine</span>
            <div style={{ fontWeight: 700, color: 'var(--admin-success)' }}>
              {mtnDiagnostic?.mode || 'SIMULATED_SANDBOX_DEV'}
            </div>
          </div>

          <div style={{ background: 'var(--admin-bg)', padding: '0.85rem', borderRadius: '8px' }}>
            <span className="admin-label">Base Gateway URL</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
              {mtnDiagnostic?.baseUrl || 'https://sandbox.momodeveloper.mtn.com'}
            </div>
          </div>

          <div style={{ background: 'var(--admin-bg)', padding: '0.85rem', borderRadius: '8px' }}>
            <span className="admin-label">MoMo Currency</span>
            <div style={{ fontWeight: 700 }}>
              {mtnDiagnostic?.mtnCurrency || 'EUR'}
            </div>
          </div>
        </div>
      </div>

      {/* General Store Profile */}
      <div className="admin-card">
        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--admin-plum)' }}>
          Company & Commerce Information
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label className="admin-label">Brand Store Name</label>
            <input
              type="text"
              className="admin-input"
              value={settings.storeName || ''}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Legal Registered Entity</label>
            <input
              type="text"
              className="admin-input"
              value={settings.legalEntityName || ''}
              onChange={(e) => setSettings({ ...settings, legalEntityName: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Concierge Support Email</label>
            <input
              type="email"
              className="admin-input"
              value={settings.supportEmail || ''}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Support Phone</label>
            <input
              type="text"
              className="admin-input"
              value={settings.supportPhone || ''}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="admin-label">Flagship Showroom Address</label>
            <input
              type="text"
              className="admin-input"
              value={settings.storeAddress || ''}
              onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Commerce Rules */}
      <div className="admin-card">
        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--admin-plum)' }}>
          Order & Inventory Rules
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <label className="admin-label">Store Currency</label>
            <input
              type="text"
              className="admin-input"
              value={settings.currency || 'USD'}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            />
          </div>

          <div>
            <label className="admin-label">Free Delivery Threshold ($)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.freeShippingThreshold || 500}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="admin-label">Low Stock Alert Threshold (Units)</label>
            <input
              type="number"
              className="admin-input"
              value={settings.inventoryLowStockThreshold || 10}
              onChange={(e) => setSettings({ ...settings, inventoryLowStockThreshold: parseInt(e.target.value, 10) || 1 })}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
