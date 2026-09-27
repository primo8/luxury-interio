import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchAdminStaff } from '../../utils/adminApi';

export function StaffManager() {
  const [staff, setStaff] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminStaff();
      if (res.success) {
        setStaff(res.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Staff Accounts & Role-Based Access Control (RBAC)
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Enforce server-side least-privilege permissions across commerce operations
            </div>
          </div>

          <button onClick={loadStaff} className="admin-btn admin-btn-secondary">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Staff Users Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {staff.map((member) => (
          <div key={member.id} className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={member.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--admin-plum)' }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{member.name}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{member.email}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>{member.phone}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'var(--admin-bg)', borderRadius: '8px' }}>
              <span className="admin-label" style={{ margin: 0 }}>Role</span>
              <span className="admin-status-badge active" style={{ fontWeight: 800 }}>
                {member.role.replace('_', ' ')}
              </span>
            </div>

            {/* Permissions Pill Cloud */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Assigned Permissions ({member.permissions.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                {member.permissions.map((p: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.675rem',
                      background: '#FFFFFF',
                      border: '1px solid var(--admin-border)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      color: 'var(--admin-text-secondary)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              <span>Last Login:</span>
              <span>{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
