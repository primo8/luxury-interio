import React from 'react';
import { Phone, Mail, MapPin, Terminal } from 'lucide-react';
import type { RoomType } from '../../types';

interface FooterProps {
  onSelectRoom: (room: RoomType) => void;
  onOpenSandboxPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectRoom, onOpenSandboxPanel }) => {
  return (
    <footer
      id="about"
      style={{
        backgroundColor: '#160620',
        color: 'rgba(255, 255, 255, 0.75)',
        padding: '70px 0 30px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.88rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
            gap: '40px',
            marginBottom: '50px',
          }}
          className="footer-grid"
        >
          {/* Col 1: Brand Info */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '1.8rem',
                fontWeight: 700,
                letterSpacing: '3px',
                color: '#ffffff',
                marginBottom: '4px',
              }}
            >
              FURNITURA
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                letterSpacing: '3px',
                color: 'var(--color-gold)',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              LUXURY FURNITURE STORE
            </div>

            <p style={{ lineHeight: '1.6', marginBottom: '22px', fontSize: '0.84rem' }}>
              Crafting timeless luxury furniture for discerning homes and modern spaces. Handcrafted materials, ergonomic engineering, and interactive 3D studio visualizations.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Instagram', text: 'IG' },
                { label: 'Facebook', text: 'FB' },
                { label: 'Pinterest', text: 'PIN' },
                { label: 'LinkedIn', text: 'IN' },
              ].map((soc, idx) => (
                <a
                  key={idx}
                  href="#"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                  }}
                  aria-label={soc.label}
                >
                  {soc.text}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Shop By Room
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button onClick={() => onSelectRoom('living')} style={{ color: 'inherit', textAlign: 'left' }} className="hover:text-white">
                  Living Room Collections
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRoom('bedroom')} style={{ color: 'inherit', textAlign: 'left' }} className="hover:text-white">
                  Bedroom Suites & Beds
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRoom('dining')} style={{ color: 'inherit', textAlign: 'left' }} className="hover:text-white">
                  Dining Tables & Chairs
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRoom('office')} style={{ color: 'inherit', textAlign: 'left' }} className="hover:text-white">
                  Executive Office Furniture
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRoom('storage')} style={{ color: 'inherit', textAlign: 'left' }} className="hover:text-white">
                  Sideboards & Credenzas
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRoom('outdoor')} style={{ color: 'inherit', textAlign: 'left' }} className="hover:text-white">
                  Teak Outdoor & Patio
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div id="faqs">
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Customer Care
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><a href="#faqs" className="hover:text-white">White-Glove Delivery</a></li>
              <li><a href="#faqs" className="hover:text-white">10-Year Craftsmanship Warranty</a></li>
              <li><a href="#faqs" className="hover:text-white">30-Day In-Home Trial</a></li>
              <li><a href="#faqs" className="hover:text-white">Care & Velvet Maintenance</a></li>
              <li><a href="#faqs" className="hover:text-white">Trade & Interior Design Program</a></li>
              {onOpenSandboxPanel && (
                <li>
                  <button
                    onClick={onOpenSandboxPanel}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--color-gold)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                    }}
                  >
                    <Terminal size={13} />
                    <span>MTN MoMo Sandbox Diagnostics</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Flagship Showroom */}
          <div id="contact">
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Flagship Showroom
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>KG 7 Ave, Kigali Heights Luxury Plaza, 2nd Floor, Kigali, Rwanda</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={18} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <span>+250 788 000 111 / +250 730 000 222</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                <span>concierge@furnitura-luxury.com</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                Open Mon – Sat: 8:00 AM – 8:00 PM CAT
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '25px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.78rem',
          }}
        >
          <div>
            © 2026 FURNITURA Luxury Furniture Store. All Rights Reserved.
          </div>

          {/* Secure Payment Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Official Payment Gateway:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: '#ffcc00',
                  color: '#000000',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                }}
              >
                MTN MOMO
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                256-BIT ENCRYPTED
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
