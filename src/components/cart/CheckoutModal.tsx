import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, CheckCircle, CreditCard, Smartphone, Building2, Truck, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { total, clearCart } = useCart();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kigali',
    country: 'Rwanda',
    deliveryMethod: 'white-glove',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    momoNumber: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert('Please fill in all shipping details');
      return;
    }
    setStep('payment');
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
    clearCart();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const orderNumber = `FUR-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(22, 6, 32, 0.8)',
      backdropFilter: 'blur(10px)',
      padding: '20px',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #f0ebf5',
          backgroundColor: 'var(--color-plum-900)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px' }}>
              FURNITURA
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}>
              100% SECURE ENCRYPTED CHECKOUT
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px', flex: 1 }}>
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-plum-900)', marginBottom: '18px' }}>
                1. Shipping & Contact Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Marie Claire Uwase"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8d0e0', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. marie@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8d0e0', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+250 788 123 456"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8d0e0', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    City / Province *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Kigali, Nyarugenge"
                    value={formData.city}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8d0e0', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Street Delivery Address & Landmark *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="KG 548 St, Villa 12, Gacuriro"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d8d0e0', fontSize: '0.88rem' }}
                />
              </div>

              {/* Delivery Option */}
              <div style={{ backgroundColor: '#f8f4fa', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #eee6f3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-plum-900)', marginBottom: '8px' }}>
                  <Truck size={16} color="var(--color-plum-700)" />
                  <span>Delivery Method: Premium White-Glove In-Home Setup</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Our uniformed technicians will deliver, unbox, assemble, and place your furniture in your room of choice, and remove all packing materials.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-plum-800)',
                    color: '#ffffff',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  <span>CONTINUE TO PAYMENT (${total.toFixed(2)})</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handleCompleteOrder}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-plum-700)', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Shipping</span>
                </button>
              </div>

              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-plum-900)', marginBottom: '18px' }}>
                2. Select Secure Payment Method
              </h3>

              {/* Payment Method Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '22px' }}>
                {[
                  { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
                  { id: 'momo', name: 'MTN / Airtel MoMo', icon: <Smartphone size={18} /> },
                  { id: 'bank', name: 'Direct Bank Wire', icon: <Building2 size={18} /> }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: formData.paymentMethod === pm.id ? '2px solid var(--color-plum-700)' : '1px solid #d8d0e0',
                      backgroundColor: formData.paymentMethod === pm.id ? '#f6f0f9' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      color: formData.paymentMethod === pm.id ? 'var(--color-plum-900)' : 'var(--color-text-muted)'
                    }}
                  >
                    {pm.icon}
                    <span>{pm.name}</span>
                  </button>
                ))}
              </div>

              {formData.paymentMethod === 'card' && (
                <div style={{ backgroundColor: '#faf8fc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #ece4f2' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Card Number</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d8d0e0' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d8d0e0' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>CVC / CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={formData.cardCvc}
                        onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d8d0e0' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'momo' && (
                <div style={{ backgroundColor: '#faf8fc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #ece4f2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Mobile Money Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0788 000 000 / 0730 000 000"
                    value={formData.momoNumber || formData.phone}
                    onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d8d0e0' }}
                  />
                  <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                    You will receive a USSD push prompt on your handset to approve payment of <strong>${total.toFixed(2)}</strong>.
                  </p>
                </div>
              )}

              {formData.paymentMethod === 'bank' && (
                <div style={{ backgroundColor: '#faf8fc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #ece4f2', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-plum-900)', marginBottom: '6px' }}>Bank Wire Information:</div>
                  <div>Bank: Bank of Kigali (BK) / Equity Bank</div>
                  <div>Account Name: FURNITURA LUXURY LIVING LTD</div>
                  <div>Account Number: 00045-098234-11 (USD)</div>
                  <div>Swift Code: BKIGRWRW</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-plum-900)' }}>
                  Total to Pay: ${total.toFixed(2)}
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#2a9d8f',
                    color: '#ffffff',
                    padding: '14px 32px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(42, 157, 143, 0.4)'
                  }}
                >
                  AUTHORIZE & PLACE ORDER
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.4s ease' }}>
              <CheckCircle size={64} color="#2a9d8f" style={{ margin: '0 auto 18px auto' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-plum-900)', marginBottom: '8px' }}>
                Thank You For Your Order!
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                Order <strong>#{orderNumber}</strong> has been confirmed. A formal receipt and white-glove tracking schedule has been sent to <strong>{formData.email}</strong>.
              </p>

              <div style={{ backgroundColor: '#faf7fc', padding: '20px', borderRadius: '12px', maxWidth: '460px', margin: '0 auto 30px auto', textAlign: 'left', border: '1px solid #eee6f3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                  <span>Customer:</span>
                  <strong>{formData.fullName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                  <span>Delivery Address:</span>
                  <strong>{formData.address}, {formData.city}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                  <span>Payment Status:</span>
                  <span style={{ color: '#2a9d8f', fontWeight: 700 }}>PAID / CONFIRMED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--color-plum-900)', paddingTop: '8px', borderTop: '1px solid #e0d8e8' }}>
                  <span>Grand Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  backgroundColor: 'var(--color-plum-800)',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                RETURN TO FURNITURA STORE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
