import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { isClientFirebaseConfigured } from '../../config/firebase';

export function AdminLogin() {
  const { login, loginWithGoogle } = useAdmin();
  const [email, setEmail] = useState('admin@furnitura.luxury');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');

    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setErrorMessage(result.message || 'Google authentication failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected Google authentication error occurred.');
    } finally {
      setIsGoogleLoading(false);
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
                  {isClientFirebaseConfigured ? 'Firebase Enterprise Auth' : 'Direct Staff RBAC (Local)'}
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
              {isClientFirebaseConfigured ? 'ACTIVE' : 'LOCAL'}
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

          {/* Google Single Sign-On Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            id="google-signin-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isLoading || isGoogleLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s, border-color 0.2s, transform 0.15s',
              boxSizing: 'border-box',
              marginBottom: '1.25rem',
            }}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                <span>Authenticating with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.25rem 0',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <span style={{ padding: '0 10px' }}>or staff credentials</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          </div>

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
              disabled={isLoading || isGoogleLoading}
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
                cursor: isLoading || isGoogleLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                transition: 'transform 0.15s, opacity 0.15s',
                opacity: isLoading || isGoogleLoading ? 0.75 : 1,
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
            Secured with Firebase Identity Verification & Strict Server-Side Role-Based Access Control (RBAC).
          </div>
        </div>
      </div>
    </div>
  );
}
