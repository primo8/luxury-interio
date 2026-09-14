import React, { useState } from 'react';
import { Mail, Check, Sparkles, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export const NewsletterVIP: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FURNITURA10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section style={{
      background: 'linear-gradient(135deg, #250d33 0%, #3b184f 100%)',
      color: '#ffffff',
      padding: '70px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#d4af37',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            <Sparkles size={14} />
            <span>FURNITURA VIP CONCIERGE</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
            fontWeight: 700,
            marginBottom: '14px',
            lineHeight: 1.2
          }}>
            Join The Inner Circle & Receive 10% Off
          </h2>

          <p style={{
            fontSize: '0.94rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '32px',
            lineHeight: 1.5
          }}>
            Be the first to preview new collections, private showroom events, and editorial interior inspirations.
          </p>

          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                maxWidth: '520px',
                margin: '0 auto',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '30px',
                padding: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '16px' }}>
                <Mail size={18} color="rgba(255, 255, 255, 0.6)" style={{ marginRight: '10px' }} />
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                  aria-label="Email address for newsletter"
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#d4af37',
                  color: '#1a0824',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '12px 24px',
                  borderRadius: '24px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease'
                }}
              >
                JOIN NOW
              </button>
            </form>
          ) : (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              margin: '0 auto',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#d4af37', fontWeight: 700, marginBottom: '10px' }}>
                <Check size={20} />
                <span>WELCOME TO FURNITURA VIP</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#ffffff', marginBottom: '14px' }}>
                Use your private discount code at checkout for 10% off your entire order:
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#160620',
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1px dashed #d4af37'
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 800, color: '#d4af37', letterSpacing: '1px' }}>
                  FURNITURA10
                </span>
                <button
                  onClick={handleCopyCode}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
