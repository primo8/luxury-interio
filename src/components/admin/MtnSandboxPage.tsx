import React, { useState, useEffect } from 'react';
import {
  Zap,
  Send,
  RefreshCw,
  Server,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  triggerTestPayment,
  fetchPaymentStatus,
  fetchPaymentDiagnostics,
  simulatePaymentStatus,
} from '../../utils/payment';

export function MtnSandboxPage() {
  const { showAdminToast, refreshDashboardStats } = useAdmin();
  const [phoneNumber, setPhoneNumber] = useState('0788123456');
  const [amount, setAmount] = useState('100');
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [activeTestPayment, setActiveTestPayment] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [pollStatus, setPollStatus] = useState<string>('');
  const [pollingCount, setPollingCount] = useState<number>(0);

  const loadDiagnostics = async () => {
    try {
      const diag = await fetchPaymentDiagnostics();
      setDiagnostics(diag);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleSendTestPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsSending(true);
    setPollStatus('INITIATING');
    setActiveTestPayment(null);
    setPollingCount(0);

    try {
      const res = await triggerTestPayment(phoneNumber, parseFloat(amount) || 100);
      if (res.success && res.result) {
        setActiveTestPayment(res.result);
        setPollStatus(res.result.status);
        showAdminToast(`MTN RequestToPay initiated! Ref: ${res.result.referenceId}`, 'info');

        // Start real-time status polling for 12 seconds
        let count = 0;
        const interval = setInterval(async () => {
          count++;
          setPollingCount(count);
          const statusRes = await fetchPaymentStatus(res.result.referenceId);
          if (statusRes) {
            setPollStatus(statusRes.status);
            if (['SUCCESSFUL', 'FAILED', 'REJECTED', 'EXPIRED'].includes(statusRes.status)) {
              clearInterval(interval);
              loadDiagnostics();
              refreshDashboardStats();
              if (statusRes.status === 'SUCCESSFUL') {
                showAdminToast('MoMo Payment confirmed successfully!', 'success');
              } else {
                showAdminToast(`Payment ended in state: ${statusRes.status}`, 'warning');
              }
            }
          }

          if (count >= 15) {
            clearInterval(interval);
          }
        }, 1500);
      } else {
        showAdminToast(res.message || 'Payment initiation failed', 'error');
        setPollStatus('FAILED');
      }
    } catch (err: any) {
      showAdminToast('Error sending test payment', 'error');
      setPollStatus('FAILED');
    } finally {
      setIsSending(false);
    }
  };

  const handleManualSimulate = async (status: 'SUCCESSFUL' | 'FAILED' | 'REJECTED') => {
    if (!activeTestPayment?.referenceId) return;
    try {
      const res = await simulatePaymentStatus(activeTestPayment.referenceId, status);
      if (res.success) {
        setPollStatus(status);
        showAdminToast(`Simulated status changed to ${status}`, 'info');
        loadDiagnostics();
        refreshDashboardStats();
      }
    } catch (err) {
      showAdminToast('Simulation failed', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-plum)' }}>
              MTN MoMo Sandbox Test Center & API Diagnostics
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Verify RequestToPay prompts, USSD push notifications, status polling loops, and financial reconciliation
            </div>
          </div>

          <div className="admin-env-pill sandbox">
            SANDBOX ENVIRONMENT
          </div>
        </div>
      </div>

      {/* Grid: Diagnostics + Test Payment Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Gateway Connection Diagnostics */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Server size={18} color="var(--admin-amethyst)" />
              <span>Gateway Configuration Status</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--admin-bg)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>MTN API Base:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {diagnostics?.baseUrl || 'sandbox.momodeveloper.mtn.com'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--admin-bg)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Engine Mode:</span>
              <span style={{ fontWeight: 700, color: 'var(--admin-success)' }}>
                {diagnostics?.mode || 'SIMULATED_SANDBOX_DEV'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--admin-bg)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Target Environment:</span>
              <span style={{ fontWeight: 700, color: '#D97706' }}>
                {diagnostics?.environment?.toUpperCase() || 'SANDBOX'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--admin-bg)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Subscription Keys:</span>
              <span style={{ fontWeight: 700, color: diagnostics?.isConfigured ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>
                {diagnostics?.isConfigured ? 'CONNECTED (LIVE SANDBOX)' : 'SIMULATOR ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Trigger Test Payment Form */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Zap size={18} color="var(--admin-gold-dark)" />
              <span>Send Test RequestToPay</span>
            </div>
          </div>

          <form onSubmit={handleSendTestPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="admin-label">MTN MoMo Test Phone Number (MSISDN)</label>
              <input
                type="tel"
                className="admin-input"
                required
                placeholder="0788123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                Tip: End in "0000" to simulate Insufficient Balance, or "9999" to simulate User Declined.
              </div>
            </div>

            <div>
              <label className="admin-label">Amount ($ USD)</label>
              <input
                type="number"
                className="admin-input"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="admin-btn admin-btn-gold"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Send size={16} />
              <span>{isSending ? 'Sending RequestToPay...' : 'SEND TEST PAYMENT'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Real-Time Test Payment Polling Visualizer */}
      {pollStatus && (
        <div className="admin-card" style={{ border: '2px solid var(--admin-plum-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: 'var(--admin-plum)' }}>
              <RefreshCw size={18} className={pollStatus === 'PENDING' || pollStatus === 'INITIATING' ? 'animate-spin' : ''} />
              <span>Real-Time Status Poller (Poll #{pollingCount})</span>
            </div>

            <span className={`admin-status-badge ${pollStatus.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
              STATUS: {pollStatus}
            </span>
          </div>

          <div style={{ background: 'var(--admin-bg)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <strong>Reference UUID:</strong>{' '}
              <span style={{ fontFamily: 'monospace' }}>{activeTestPayment?.referenceId || 'N/A'}</span>
            </div>
            <div>
              <strong>Order ID:</strong> #{activeTestPayment?.orderId || 'N/A'}
            </div>
            <div>
              <strong>Phone:</strong> {activeTestPayment?.phoneNumberMasked || phoneNumber}
            </div>
          </div>

          {/* Quick Simulation Trigger Buttons */}
          {pollStatus === 'PENDING' && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Simulate Customer Action:</span>
              <button
                onClick={() => handleManualSimulate('SUCCESSFUL')}
                className="admin-btn admin-btn-sm"
                style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
              >
                Approve (Success)
              </button>
              <button
                onClick={() => handleManualSimulate('FAILED')}
                className="admin-btn admin-btn-sm"
                style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
              >
                Fail (Insufficient Funds)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
