import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Play,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import type { PaymentDiagnostic, PaymentTransactionRecord, PaymentStatus } from '../../types';
import {
  fetchPaymentDiagnostics,
  fetchAllTransactions,
  triggerTestPayment,
  clearAllTransactions,
  simulatePaymentStatus,
  fetchPaymentStatus,
} from '../../utils/payment';

interface MtnSandboxTestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MtnSandboxTestPanel: React.FC<MtnSandboxTestPanelProps> = ({ isOpen, onClose }) => {
  const [diagnostic, setDiagnostic] = useState<PaymentDiagnostic | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('0788123456');
  const [testAmount, setTestAmount] = useState('150');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [diag, txs] = await Promise.all([
      fetchPaymentDiagnostics(),
      fetchAllTransactions(),
    ]);
    if (diag) setDiagnostic(diag);
    setTransactions(txs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestPayment = async () => {
    setIsLoading(true);
    const res = await triggerTestPayment(testPhone, parseFloat(testAmount) || 100);
    if (res.success) {
      setActionMessage({ type: 'success', text: `Test Payment Initiated! Ref: ${res.result?.referenceId}` });
    } else {
      setActionMessage({ type: 'error', text: res.message || 'Test payment creation failed.' });
    }
    await loadData();
    setIsLoading(false);
  };

  const handleSimulateStatus = async (referenceId: string, status: PaymentStatus) => {
    setIsLoading(true);
    const res = await simulatePaymentStatus(referenceId, status);
    if (res.success) {
      setActionMessage({ type: 'success', text: `Transaction ${referenceId} updated to ${status}` });
    }
    await loadData();
    setIsLoading(false);
  };

  const handlePollStatus = async (referenceId: string) => {
    setIsLoading(true);
    const res = await fetchPaymentStatus(referenceId);
    if (res) {
      setActionMessage({ type: 'success', text: `Polled Status: ${res.status} (Updated at ${new Date(res.updatedAt).toLocaleTimeString()})` });
    }
    await loadData();
    setIsLoading(false);
  };

  const handleClearTransactions = async () => {
    if (confirm('Clear all test transactions?')) {
      setIsLoading(true);
      await clearAllTransactions();
      setActionMessage({ type: 'success', text: 'All test transactions cleared.' });
      await loadData();
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCESSFUL':
        return <span style={{ backgroundColor: 'rgba(42, 157, 143, 0.15)', color: '#2a9d8f', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>SUCCESSFUL</span>;
      case 'PENDING':
        return <span style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#9e7300', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>PENDING</span>;
      case 'FAILED':
        return <span style={{ backgroundColor: 'rgba(230, 57, 70, 0.15)', color: '#e63946', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>FAILED</span>;
      case 'REJECTED':
        return <span style={{ backgroundColor: 'rgba(110, 40, 40, 0.15)', color: '#882222', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>REJECTED</span>;
      case 'EXPIRED':
        return <span style={{ backgroundColor: 'rgba(100, 100, 100, 0.15)', color: '#555', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>EXPIRED</span>;
      default:
        return <span style={{ backgroundColor: '#eee', color: '#666', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>{status}</span>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 7, 22, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="MTN MoMo Sandbox Developer Panel"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          backgroundColor: '#160d21',
          color: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0e0617',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#ffcc00',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.8rem',
              }}
            >
              MTN
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                MTN MoMo Collection — Sandbox Diagnostic & Test Panel
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Developer testing environment for RequestToPay, status polling, and simulated state machines.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={loadData}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Close Test Panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Message Banner */}
          {actionMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: actionMessage.type === 'success' ? 'rgba(42, 157, 143, 0.2)' : 'rgba(230, 57, 70, 0.2)',
                border: actionMessage.type === 'success' ? '1px solid #2a9d8f' : '1px solid #e63946',
                fontSize: '0.82rem',
                color: actionMessage.type === 'success' ? '#6be0cf' : '#ff9999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{actionMessage.text}</span>
              <button onClick={() => setActionMessage(null)} style={{ color: '#fff' }}><X size={14} /></button>
            </div>
          )}

          {/* Diagnostic Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {/* Environment Box */}
            <div style={{ backgroundColor: '#211432', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Target Environment
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                {diagnostic?.environment.toUpperCase() || 'SANDBOX'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                Currency: {diagnostic?.mtnCurrency} (Transport)
              </div>
            </div>

            {/* Status Mode Box */}
            <div style={{ backgroundColor: '#211432', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Gateway Mode
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.94rem', fontWeight: 700, color: diagnostic?.isConfigured ? '#2a9d8f' : '#e0a96d' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: diagnostic?.isConfigured ? '#2a9d8f' : '#e0a96d' }} />
                <span>{diagnostic?.mode === 'LIVE_SANDBOX' ? 'Live MTN Sandbox' : 'Simulated Dev Sandbox'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                {diagnostic?.isConfigured ? 'Connected with subscription keys' : 'Sandbox credentials unset (Simulating transitions)'}
              </div>
            </div>

            {/* Webhook & Callback Box */}
            <div style={{ backgroundColor: '#211432', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Status Polling & Callback
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                {diagnostic?.hasCallbackUrl ? 'Webhook + Polling' : 'Active Status Polling'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {diagnostic?.callbackUrl}
              </div>
            </div>
          </div>

          {/* Missing Keys Notice if unconfigured */}
          {diagnostic && !diagnostic.isConfigured && (
            <div
              style={{
                backgroundColor: 'rgba(224, 169, 109, 0.12)',
                border: '1px solid rgba(224, 169, 109, 0.3)',
                padding: '14px 18px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                color: '#f0c79f',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} />
                <span>Live Sandbox Keys Notice</span>
              </div>
              <span>
                To switch from Simulated Sandbox to Live MTN Developer Gateway, populate these in <code>.env</code>:
              </span>
              <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                {diagnostic.missingKeys.map((k) => (
                  <li key={k}><code>{k}</code></li>
                ))}
              </ul>
            </div>
          )}

          {/* Test Transaction Creator */}
          <div
            style={{
              backgroundColor: '#1b102b',
              padding: '18px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={15} color="var(--color-gold)" />
              <span>Trigger Test Sandbox RequestToPay</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                  Test Phone (078XXXXXXX)
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#11081b',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#11081b',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                  }}
                />
              </div>

              <button
                onClick={handleTestPayment}
                disabled={isLoading}
                style={{
                  height: '38px',
                  padding: '0 18px',
                  backgroundColor: 'var(--color-gold)',
                  color: '#160620',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>SEND TEST PROMPT</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Recent Sandbox Transactions ({transactions.length})
              </div>
              {transactions.length > 0 && (
                <button
                  onClick={handleClearTransactions}
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            <div
              style={{
                backgroundColor: '#1b102b',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflowX: 'auto',
              }}
            >
              {transactions.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.84rem' }}>
                  No transactions recorded yet. Initiate a checkout or click "Send Test Prompt" above.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.5)' }}>
                      <th style={{ padding: '12px 16px' }}>Reference</th>
                      <th style={{ padding: '12px 16px' }}>Order ID</th>
                      <th style={{ padding: '12px 16px' }}>Phone</th>
                      <th style={{ padding: '12px 16px' }}>Amount</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Created</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.mtnReferenceId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.74rem' }}>
                          {tx.mtnReferenceId.slice(0, 8)}...
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{tx.orderId}</td>
                        <td style={{ padding: '12px 16px' }}>{tx.phoneNumberMasked}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>${tx.amount} {tx.currency}</td>
                        <td style={{ padding: '12px 16px' }}>{getStatusBadge(tx.status)}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255, 255, 255, 0.6)' }}>
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handlePollStatus(tx.mtnReferenceId)}
                              title="Poll Status"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                color: '#fff',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                              }}
                            >
                              Poll
                            </button>
                            {tx.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleSimulateStatus(tx.mtnReferenceId, 'SUCCESSFUL')}
                                  title="Approve Prompt"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(42, 157, 143, 0.3)',
                                    color: '#2a9d8f',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleSimulateStatus(tx.mtnReferenceId, 'FAILED')}
                                  title="Decline Prompt"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(230, 57, 70, 0.3)',
                                    color: '#e63946',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
