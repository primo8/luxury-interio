import { useState, useEffect } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { fetchAdminAuditLogs } from '../../utils/adminApi';

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (resourceFilter) params.resource = resourceFilter;

      const res = await fetchAdminAuditLogs(params);
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [resourceFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Privileged Security & Commerce Audit Trail
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Immutable server logs capturing all administrative events, status updates, and inventory changes
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              className="admin-select"
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="">All Resources</option>
              <option value="ORDERS">Orders</option>
              <option value="PAYMENTS">Payments</option>
              <option value="INVENTORY">Inventory</option>
              <option value="PRODUCTS">Products</option>
              <option value="DISCOUNTS">Discounts</option>
              <option value="REVIEWS">Reviews</option>
              <option value="AUTH">Authentication</option>
            </select>

            <button onClick={loadLogs} className="admin-btn admin-btn-secondary">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--admin-text-muted)' }}>
                    <History size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700 }}>No audit logs recorded for filter.</div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700 }}>{log.actorName}</td>
                    <td>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--admin-plum)' }}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: 'var(--admin-text-primary)' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-badge processing" style={{ fontSize: '0.65rem' }}>
                        {log.resource}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '300px' }}>{log.details}</td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--admin-text-muted)' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
