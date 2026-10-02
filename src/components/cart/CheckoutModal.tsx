import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useUserAuth } from '../../context/UserAuthContext';
import type { CustomerDetails, DirectBuyItem, PaymentDiagnostic } from '../../types';
import {
  X,
  CheckCircle,
  Smartphone,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  AlertCircle,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SafeImage } from '../common/SafeImage';
import {
  submitCheckoutAndPay,
  fetchPaymentStatus,
  fetchPaymentDiagnostics,
  type PaymentStatusCheckResponse,
} from '../../utils/payment';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  directBuyItem?: DirectBuyItem | null;
  onClearDirectBuy?: () => void;
  onOpenTestPanel?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  directBuyItem,
  onClearDirectBuy,
  onOpenTestPanel,
}) => {
  const {
    items: cartItems,
    subtotal: cartSubtotal,
    discountAmount: cartDiscount,
    couponCode: cartCoupon,
    clearCart,
  } = useCart();

  // Determine active checkout items (Direct Buy item takes precedence if active)
  const isDirectBuy = Boolean(directBuyItem);
  const [directQty, setDirectQty] = useState(directBuyItem?.quantity || 1);

  useEffect(() => {
    if (directBuyItem) {
      setDirectQty(directBuyItem.quantity || 1);
    }
  }, [directBuyItem]);

  const itemsToCheckout = isDirectBuy && directBuyItem
    ? [{ product: directBuyItem.product, quantity: directQty, selectedColor: directBuyItem.selectedColor }]
    : cartItems;

  const subtotal = isDirectBuy && directBuyItem
    ? directBuyItem.product.price * directQty
    : cartSubtotal;

  const discountAmount = isDirectBuy ? 0 : cartDiscount;
  const shippingFee = subtotal >= 999 || itemsToCheckout.length === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const { customer: authCustomer } = useUserAuth();

  // Stepper state: 'customer' | 'delivery' | 'payment'
  const [step, setStep] = useState<'customer' | 'delivery' | 'payment'>('customer');

  // Customer Form Data
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    email: '',
    phone: '',
    firebaseUid: undefined,
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kacyiru',
    address: '',
    city: 'Kigali',
    country: 'Rwanda',
    paymentMethod: 'momo',
    notes: '',
  });

  // Auto-fill from authenticated MongoDB customer profile
  useEffect(() => {
    if (authCustomer && isOpen) {
      setCustomer((prev) => ({
        ...prev,
        fullName: prev.fullName || authCustomer.fullName || '',
        email: prev.email || authCustomer.email || '',
        phone: prev.phone || authCustomer.phone || '',
        firebaseUid: authCustomer.firebaseUid,
        address: prev.address || authCustomer.address || (authCustomer.addresses && authCustomer.addresses[0]?.streetAddress) || '',
        province: prev.province || authCustomer.province || (authCustomer.addresses && authCustomer.addresses[0]?.province) || 'Kigali City',
        district: prev.district || authCustomer.district || (authCustomer.addresses && authCustomer.addresses[0]?.district) || 'Gasabo',
      }));
      if (authCustomer.phone && !momoPhone) {
        setMomoPhone(authCustomer.phone);
      }
    }
  }, [authCustomer, isOpen]);

  // MTN Phone Number
  const [momoPhone, setMomoPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment Execution State
  const [paymentState, setPaymentState] = useState<{
    status: 'IDLE' | 'INITIATING' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'EXPIRED';
    referenceId?: string;
    orderId?: string;
    maskedPhone?: string;
    amount?: number;
    currency?: string;
    message?: string;
    errorReason?: string;
    isSimulated?: boolean;
    financialTransactionId?: string;
  }>({ status: 'IDLE' });

  // Sandbox diagnostics
  const [diagnostic, setDiagnostic] = useState<PaymentDiagnostic | null>(null);

  const pollIntervalRef = useRef<number | null>(null);

  // Load diagnostics when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentDiagnostics().then((diag) => {
        if (diag) setDiagnostic(diag);
      });
    }
  }, [isOpen]);

  // Clean up polling interval
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // Validation functions
  const validateCustomerStep = () => {
    const errors: Record<string, string> = {};
    if (!customer.fullName.trim()) errors.fullName = 'Full name is required';
    if (!customer.email.trim() || !/\S+@\S+\.\S+/.test(customer.email)) {
      errors.email = 'Please provide a valid email address';
    }
    if (!customer.phone.trim()) {
      errors.phone = 'Contact phone number is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDeliveryStep = () => {
    const errors: Record<string, string> = {};
    if (!customer.address.trim()) {
      errors.address = 'Street address or residence detail is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextToDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCustomerStep()) {
      if (!momoPhone) setMomoPhone(customer.phone);
      setStep('delivery');
    }
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDeliveryStep()) {
      setStep('payment');
    }
  };

  // Payment polling runner
  const startPaymentPolling = (referenceId: string) => {
    if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);

    let attempts = 0;
    const maxAttempts = 40; // 40 * 2.5s = 100 seconds max poll

    pollIntervalRef.current = window.setInterval(async () => {
      attempts++;
      const result: PaymentStatusCheckResponse | null = await fetchPaymentStatus(referenceId);

      if (result) {
        if (result.status === 'SUCCESSFUL') {
          if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
          setPaymentState({
            status: 'SUCCESSFUL',
            referenceId: result.referenceId,
            orderId: result.orderId,
            amount: result.amount,
            currency: result.currency,
            maskedPhone: result.phoneNumberMasked,
            financialTransactionId: result.financialTransactionId,
            isSimulated: result.isSimulated,
            message: 'Payment Confirmed! Your luxury furniture order has been received.',
          });

          // Trigger celebratory confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3B184F', '#D4AF37', '#8E2DE2', '#2A9D8F'],
          });

          // Clear cart if standard cart checkout
          if (!isDirectBuy) {
            clearCart();
          }
        } else if (['FAILED', 'REJECTED', 'EXPIRED'].includes(result.status)) {
          if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
          setPaymentState((prev) => ({
            ...prev,
            status: result.status as any,
            errorReason: result.failureReason || 'Payment prompt was not approved.',
            message: result.failureReason || 'The payment could not be completed on your phone.',
          }));
        }
      }

      if (attempts >= maxAttempts) {
        if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
        setPaymentState((prev) => ({
          ...prev,
          status: 'EXPIRED',
          errorReason: 'Payment request timed out. Please try again.',
        }));
      }
    }, 2500);
  };

  // Trigger MTN MoMo Payment Request
  const handleInitiateMtnPayment = async () => {
    setPhoneError('');
    const cleanedPhone = momoPhone.replace(/[\s\-+()]/g, '');

    if (!cleanedPhone || cleanedPhone.length < 8) {
      setPhoneError('Please enter a valid MTN MoMo phone number (e.g. 0788123456)');
      return;
    }

    setPaymentState({ status: 'INITIATING' });

    const payload = {
      items: itemsToCheckout.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        colorName: i.selectedColor.name,
        image: i.product.image,
      })),
      customer,
      couponCode: isDirectBuy ? undefined : cartCoupon,
      phoneNumber: cleanedPhone,
    };

    const res = await submitCheckoutAndPay(payload);

    if (res.success && res.payment) {
      setPaymentState({
        status: 'PENDING',
        referenceId: res.payment.referenceId,
        orderId: res.order?.id,
        amount: res.payment.amount,
        currency: res.payment.currency,
        maskedPhone: res.payment.phoneNumberMasked,
        isSimulated: res.payment.isSimulated,
        message: res.payment.message,
      });

      // Start asynchronous polling for customer approval
      startPaymentPolling(res.payment.referenceId);
    } else {
      setPaymentState({
        status: 'FAILED',
        errorReason: res.message || 'Unable to initiate MTN payment request.',
      });
    }
  };

  const handleResetToPaymentRetry = () => {
    if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
    setPaymentState({ status: 'IDLE' });
  };

  const handleCloseModal = () => {
    if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
    if (onClearDirectBuy) onClearDirectBuy();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(22, 6, 32, 0.82)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        animation: 'fadeIn 0.22s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="FURNITURA Luxury Checkout"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          overflowY: 'auto',
          boxShadow: '0 25px 65px rgba(0,0,0,0.38)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '18px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'var(--color-plum-950)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '2px',
                color: '#ffffff',
              }}
            >
              FURNITURA
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--color-gold)',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              <Lock size={12} />
              <span>SECURE CHECKOUT</span>
            </div>
            {isDirectBuy && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                DIRECT BUY NOW
              </span>
            )}
          </div>

          <button
            onClick={handleCloseModal}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s',
            }}
            aria-label="Close checkout"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Main Content (Split Grid on Desktop) */}
        <div
          style={{
            display: 'grid',
            flex: 1,
            minHeight: '480px',
          }}
          className="checkout-modal-grid"
        >
          {/* Left / Main Section: Step Flow & Payment States */}
          <div style={{ padding: 'clamp(16px, 3.5vw, 32px)', display: 'flex', flexDirection: 'column' }}>
            {/* Step Indicators (Hidden on Success) */}
            {paymentState.status !== 'SUCCESSFUL' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '28px',
                }}
              >
                {/* Step 1 */}
                <div
                  onClick={() => paymentState.status === 'IDLE' && setStep('customer')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: paymentState.status === 'IDLE' ? 'pointer' : 'default',
                    opacity: step === 'customer' ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: step === 'customer' ? 'var(--color-plum-800)' : '#e2d8ea',
                      color: step === 'customer' ? '#ffffff' : 'var(--color-plum-900)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    1
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: step === 'customer' ? 700 : 500 }}>
                    Customer
                  </span>
                </div>

                <div style={{ width: '20px', height: '1px', backgroundColor: '#d8cde2' }} />

                {/* Step 2 */}
                <div
                  onClick={() => paymentState.status === 'IDLE' && customer.fullName && setStep('delivery')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: paymentState.status === 'IDLE' ? 'pointer' : 'default',
                    opacity: step === 'delivery' ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: step === 'delivery' ? 'var(--color-plum-800)' : '#e2d8ea',
                      color: step === 'delivery' ? '#ffffff' : 'var(--color-plum-900)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    2
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: step === 'delivery' ? 700 : 500 }}>
                    Delivery
                  </span>
                </div>

                <div style={{ width: '20px', height: '1px', backgroundColor: '#d8cde2' }} />

                {/* Step 3 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: step === 'payment' ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: step === 'payment' ? 'var(--color-plum-800)' : '#e2d8ea',
                      color: step === 'payment' ? '#ffffff' : 'var(--color-plum-900)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    3
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: step === 'payment' ? 700 : 500 }}>
                    Payment
                  </span>
                </div>
              </div>
            )}

            {/* STEP 1: CUSTOMER DETAILS */}
            {step === 'customer' && paymentState.status === 'IDLE' && (
              <form onSubmit={handleNextToDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'var(--color-plum-950)',
                    marginBottom: '4px',
                  }}
                >
                  Customer Information
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Please enter your contact information for order confirmation and delivery notifications.
                </p>

                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jean-Luc Mugisha"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: formErrors.fullName ? '1px solid #e63946' : '1px solid #dcd3e5',
                      outline: 'none',
                      fontSize: '0.88rem',
                    }}
                  />
                  {formErrors.fullName && (
                    <span style={{ fontSize: '0.74rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {formErrors.fullName}
                    </span>
                  )}
                </div>

                {/* Email and Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@luxury.rw"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: formErrors.email ? '1px solid #e63946' : '1px solid #dcd3e5',
                        outline: 'none',
                        fontSize: '0.88rem',
                      }}
                    />
                    {formErrors.email && (
                      <span style={{ fontSize: '0.74rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0788 123 456"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: formErrors.phone ? '1px solid #e63946' : '1px solid #dcd3e5',
                        outline: 'none',
                        fontSize: '0.88rem',
                      }}
                    />
                    {formErrors.phone && (
                      <span style={{ fontSize: '0.74rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                        {formErrors.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{
                      height: '46px',
                      padding: '0 24px',
                      backgroundColor: 'var(--color-plum-800)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>CONTINUE TO DELIVERY</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: DELIVERY DETAILS */}
            {step === 'delivery' && paymentState.status === 'IDLE' && (
              <form onSubmit={handleNextToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'var(--color-plum-950)',
                    marginBottom: '4px',
                  }}
                >
                  White-Glove Delivery Location
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Our specialized logistics team will coordinate delivery and assembly.
                </p>

                {/* Province & District */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Province / City *
                    </label>
                    <select
                      value={customer.province}
                      onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #dcd3e5',
                        outline: 'none',
                        fontSize: '0.88rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="Kigali City">Kigali City</option>
                      <option value="Eastern Province">Eastern Province</option>
                      <option value="Northern Province">Northern Province</option>
                      <option value="Southern Province">Southern Province</option>
                      <option value="Western Province">Western Province</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      District / Area *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gasabo / Nyarugenge"
                      value={customer.district}
                      onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #dcd3e5',
                        outline: 'none',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>
                </div>

                {/* Street Address & Residence */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Delivery Address / House / Villa Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="KG 7 Ave, Heights Luxury Plaza, Apt 4B"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: formErrors.address ? '1px solid #e63946' : '1px solid #dcd3e5',
                      outline: 'none',
                      fontSize: '0.88rem',
                    }}
                  />
                  {formErrors.address && (
                    <span style={{ fontSize: '0.74rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {formErrors.address}
                    </span>
                  )}
                </div>

                {/* Delivery Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Assembly & Gate Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room on 2nd floor, elevator available"
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #dcd3e5',
                      outline: 'none',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setStep('customer')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Customer</span>
                  </button>

                  <button
                    type="submit"
                    style={{
                      height: '46px',
                      padding: '0 24px',
                      backgroundColor: 'var(--color-plum-800)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>PROCEED TO PAYMENT</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PAYMENT METHOD & MTN MOMO EXECUTION */}
            {step === 'payment' && paymentState.status === 'IDLE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'var(--color-plum-950)',
                    marginBottom: '4px',
                  }}
                >
                  Select Payment Method
                </h3>

                {/* Diagnostic Environment Badge */}
                {diagnostic && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8f4fa',
                      border: '1px solid rgba(59, 24, 79, 0.1)',
                      fontSize: '0.74rem',
                      color: 'var(--color-plum-900)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: diagnostic.isConfigured ? '#2a9d8f' : '#e0a96d',
                        }}
                      />
                      <span>
                        MTN Gateway: <strong>{diagnostic.isConfigured ? 'MTN MoMo Sandbox (Live)' : 'MTN MoMo: NOT CONFIGURED'}</strong>
                      </span>
                    </div>
                    {onOpenTestPanel && (
                      <button
                        onClick={onOpenTestPanel}
                        style={{
                          color: 'var(--color-plum-700)',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span>Test Panel</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Payment Option Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Option 1: MTN MoMo (Active) */}
                  <div
                    style={{
                      padding: '16px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--color-plum-800)',
                      backgroundColor: '#fcfaff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 14px rgba(59, 24, 79, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#ffcc00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.84rem',
                          color: '#000000',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        }}
                      >
                        MoMo
                      </div>
                      <div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                          MTN Mobile Money
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Fast & secure push prompt directly to your phone
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: diagnostic?.isConfigured ? 'var(--color-plum-800)' : '#78716C',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {diagnostic?.isConfigured ? 'OFFICIAL SANDBOX' : 'NOT CONFIGURED'}
                    </span>
                  </div>

                  {/* Option 2: Airtel Money (Placeholder) */}
                  <div
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1px solid #e6dfec',
                      backgroundColor: '#fbfafc',
                      opacity: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Smartphone size={20} color="var(--color-text-muted)" />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Airtel Money</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Direct mobile prompt</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-light)', border: '1px solid #ccc', padding: '2px 6px', borderRadius: '4px' }}>
                      COMING SOON
                    </span>
                  </div>

                  {/* Option 3: Credit Card (Placeholder) */}
                  <div
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1px solid #e6dfec',
                      backgroundColor: '#fbfafc',
                      opacity: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CreditCard size={20} color="var(--color-text-muted)" />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Visa / Mastercard / Amex</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>International cards</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-light)', border: '1px solid #ccc', padding: '2px 6px', borderRadius: '4px' }}>
                      COMING SOON
                    </span>
                  </div>
                </div>

                {/* MTN Phone Input Field */}
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-plum-950)', marginBottom: '6px' }}>
                    MTN MoMo Phone Number *
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: phoneError ? '1px solid #e63946' : '1px solid #d4c7df',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <span
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#f6f0f9',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--color-plum-900)',
                        borderRight: '1px solid #d4c7df',
                      }}
                    >
                      🇷🇼 +250
                    </span>
                    <input
                      type="tel"
                      placeholder="078XXXXXXX or 079XXXXXXX"
                      value={momoPhone}
                      onChange={(e) => {
                        setMomoPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                  {phoneError ? (
                    <span style={{ fontSize: '0.75rem', color: '#e63946', marginTop: '4px', display: 'block' }}>
                      {phoneError}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                      We will dispatch a secure MTN MoMo authorization prompt to this mobile number.
                    </span>
                  )}
                </div>

                {/* Pay Button Action */}
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={handleInitiateMtnPayment}
                    style={{
                      width: '100%',
                      height: '50px',
                      backgroundColor: 'var(--color-plum-800)',
                      color: '#ffffff',
                      borderRadius: '10px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      letterSpacing: '0.6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 18px rgba(37, 13, 51, 0.28)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>PAY ${total.toLocaleString()} WITH MTN MOMO</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('delivery')}
                    style={{
                      padding: '8px 0',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    Back to Delivery Info
                  </button>
                </div>
              </div>
            )}

            {/* PAYMENT STATE: INITIATING / REQUEST SENT */}
            {paymentState.status === 'INITIATING' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  textAlign: 'center',
                  padding: '40px 20px',
                }}
                aria-live="polite"
              >
                <RefreshCw size={36} color="var(--color-plum-700)" className="animate-spin" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-plum-950)', marginBottom: '6px' }}>
                  Connecting with MTN MoMo Gateway...
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  Generating secure UUID transaction reference and dispatching RequestToPay.
                </p>
              </div>
            )}

            {/* PAYMENT STATE: PENDING CUSTOMER APPROVAL */}
            {paymentState.status === 'PENDING' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  textAlign: 'center',
                  padding: '30px 20px',
                  backgroundColor: '#fbf9fc',
                  borderRadius: '16px',
                  border: '1px solid rgba(59, 24, 79, 0.1)',
                }}
                aria-live="polite"
              >
                {/* Pulsing indicator */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 24, 79, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    animation: 'pulseGlow 2s infinite',
                  }}
                >
                  <Smartphone size={32} color="var(--color-plum-800)" />
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    color: '#9e7300',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                  }}
                >
                  <Clock size={13} />
                  <span>WAITING FOR PHONE APPROVAL</span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'var(--color-plum-950)',
                    marginBottom: '8px',
                  }}
                >
                  Payment Request Sent
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', maxWidth: '380px', lineHeight: 1.5, marginBottom: '14px' }}>
                  Please check your phone (<strong>{paymentState.maskedPhone}</strong>) and enter your MTN MoMo PIN to authorize payment of <strong>${paymentState.amount?.toLocaleString()}</strong>.
                </p>

                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-light)', marginBottom: '24px', fontFamily: 'monospace' }}>
                  Reference: {paymentState.referenceId}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-plum-700)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Checking status automatically...</span>
                </div>
              </div>
            )}

            {/* PAYMENT STATE: SUCCESSFUL */}
            {paymentState.status === 'SUCCESSFUL' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '30px 10px',
                }}
                aria-live="polite"
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(42, 157, 143, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <CheckCircle size={40} color="#2a9d8f" />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--color-plum-950)',
                    marginBottom: '6px',
                  }}
                >
                  Payment Confirmed
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '24px', maxWidth: '420px' }}>
                  Thank you, <strong>{customer.fullName}</strong>. Your luxury order is confirmed and has been queued for white-glove assembly and delivery.
                </p>

                {/* Receipt Card */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    backgroundColor: '#faf7fc',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    border: '1px solid rgba(59, 24, 79, 0.08)',
                    marginBottom: '28px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Order Reference</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--color-plum-900)' }}>{paymentState.orderId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Amount Paid</span>
                    <strong>${paymentState.amount?.toLocaleString()} {paymentState.currency}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Payment Method</span>
                    <span>MTN MoMo ({paymentState.maskedPhone})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Estimated Delivery</span>
                    <span>2 - 4 Business Days</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-plum-800)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 16px rgba(37, 13, 51, 0.22)',
                    }}
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            )}

            {/* PAYMENT STATE: FAILED / REJECTED / EXPIRED */}
            {['FAILED', 'REJECTED', 'EXPIRED'].includes(paymentState.status) && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  textAlign: 'center',
                  padding: '30px 20px',
                  backgroundColor: '#fff9f9',
                  borderRadius: '16px',
                  border: '1px solid rgba(230, 57, 70, 0.15)',
                }}
                aria-live="polite"
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ffebeb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={32} color="#e63946" />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#e63946',
                    marginBottom: '8px',
                  }}
                >
                  {paymentState.status === 'EXPIRED' ? 'Payment Request Expired' : 'Payment Could Not Be Completed'}
                </h3>

                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-main)', maxWidth: '380px', lineHeight: 1.5, marginBottom: '20px' }}>
                  {paymentState.errorReason || 'We couldn’t finalize the payment with MTN MoMo. Your showroom items have been preserved.'}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleResetToPaymentRetry}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-plum-800)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <RefreshCw size={15} />
                    <span>TRY AGAIN</span>
                  </button>

                  <button
                    onClick={handleCloseModal}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      backgroundColor: '#f2ecf6',
                      color: 'var(--color-plum-900)',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Authoritative Order Summary Panel (Desktop) */}
          {paymentState.status !== 'SUCCESSFUL' && (
            <div
              style={{
                backgroundColor: '#faf7fc',
                borderLeft: '1px solid rgba(59, 24, 79, 0.08)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    color: 'var(--color-plum-950)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Order Summary</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {itemsToCheckout.length} {itemsToCheckout.length === 1 ? 'item' : 'items'}
                  </span>
                </h4>

                {/* Items preview list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px', overflowY: 'auto', marginBottom: '20px' }}>
                  {itemsToCheckout.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                        <SafeImage
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.product.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          Qty: {item.quantity} · {item.selectedColor.name}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', borderTop: '1px solid #eee5f4', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2a9d8f' }}>
                      <span>Promotional Discount</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                    <span>White-Glove Delivery</span>
                    <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee}`}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--color-plum-950)',
                      borderTop: '1px solid #e0d5eb',
                      paddingTop: '10px',
                      marginTop: '4px',
                    }}
                  >
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges footer */}
              <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid #eee5f4', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                  <ShieldCheck size={14} color="#2a9d8f" />
                  <span>Authoritative Server-Verified Calculation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                  <Lock size={14} color="var(--color-plum-700)" />
                  <span>Official MTN MoMo Collection Gateway</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
