import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { isClientFirebaseConfigured } from '../../config/firebase';

export function AdminLogin() {
  const { login } = useAdmin();
  const [email, setEmail] = useState('admin@furnitura.luxury');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMessage(result.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #110419 0%, #1c0828 50%, #290d3b 100%)',
        padding: '1.5rem',
        color: '#FFFFFF',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'rgba(30, 11, 44, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Top Gold Accent Bar */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 50%, #D4AF37 100%)',
          }}
        />

        <div style={{ padding: '2.5rem 2.25rem' }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3B184F 0%, #1E0A1E 100%)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                marginBottom: '1rem',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.15)',
              }}
            >
              <ShieldCheck size={28} color="#D4AF37" />
            </div>

            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                margin: '0 0 0.35rem 0',
                color: '#FFFFFF',
              }}
            >
              FURNITURA
            </h1>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#D4AF37',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Admin Command Center
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.65)',
                margin: '0.5rem 0 0 0',
              }}
            >
              Privileged Enterprise Authentication & Role-Based Access
            </p>
          </div>

          {/* Auth State Notification */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: isClientFirebaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)',
              border: `1px solid ${isClientFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
              fontSize: '0.72rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color={isClientFirebaseConfigured ? '#34D399' : '#D4AF37'} />
              <span>
                Auth Engine:{' '}
                <strong>
                  {isClientFirebaseConfigured ? 'Firebase Authentication' : 'Direct RBAC Server Auth'}
                </strong>
              </span>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: isClientFirebaseConfigured ? '#059669' : 'rgba(212, 175, 55, 0.25)',
                color: isClientFirebaseConfigured ? '#FFFFFF' : '#D4AF37',
              }}
            >
              {isClientFirebaseConfigured ? 'ACTIVE' : 'DEV MODE'}
            </span>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lock size={15} color="#EF4444" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.02em',
                }}
              >
                Staff Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@furnitura.luxury"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(20, 6, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.02em',
                }}
              >
                Password / Access Key
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <KeyRound size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(20, 6, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.8rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                color: '#1A0B2E',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                transition: 'transform 0.15s, opacity 0.15s',
                opacity: isLoading ? 0.75 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin-animation" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Hint */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Secured with Firebase Token Verification & Strict Server-Side Role-Based Access Control (RBAC).
          </div>
        </div>
      </div>
    </div>
  );
}
