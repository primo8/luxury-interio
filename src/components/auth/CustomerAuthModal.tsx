import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { SafeImage } from '../common/SafeImage';
import { useModalPhoneBack } from '../../hooks/useModalPhoneBack';

export const CustomerAuthModal: React.FC = () => {
  const {
    customer,
    isAuthModalOpen,
    authModalTab,
    orders,
    ordersLoading,
    openAuthModal,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    resetPassword,
    updateCustomerProfile,
    addAddress,
    deleteAddress,
    fetchOrders,
  } = useUserAuth();

  // Phone Back Button Interception
  useModalPhoneBack({
    isOpen: isAuthModalOpen,
    onBack: closeAuthModal,
    modalKey: 'customer-auth',
  });

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // Profile edit states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editProvince, setEditProvince] = useState('');
  const [editDistrict, setEditDistrict] = useState('');

  // Add address states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrProvince, setAddrProvince] = useState('Kigali');
  const [addrDistrict, setAddrDistrict] = useState('Gasabo');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Sync profile edits when customer changes
  useEffect(() => {
    if (customer) {
      setEditName(customer.fullName || '');
      setEditPhone(customer.phone || '');
      setEditAddress(customer.address || '');
      setEditProvince(customer.province || '');
      setEditDistrict(customer.district || '');
    }
  }, [customer]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await loginWithGoogle();
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Google sign-in failed.');
    } else {
      setSuccessMsg('Signed in successfully with Google!');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await loginWithEmail(email, password);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to sign in.');
    } else {
      setSuccessMsg('Welcome back!');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg('Please enter your name, email, and a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await registerWithEmail(email, password, fullName, phone);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to register.');
    } else {
      setSuccessMsg('Account created and synchronized with MongoDB!');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address to receive the password reset link.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await resetPassword(email);
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg('Password reset link sent! Check your email inbox.');
      setIsResetMode(false);
    } else {
      setErrorMsg(res.message || 'Failed to send reset email.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    const res = await updateCustomerProfile({
      fullName: editName,
      phone: editPhone,
      address: editAddress,
      province: editProvince,
      district: editDistrict,
    });
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg('Profile saved to MongoDB Atlas.');
    } else {
      setErrorMsg(res.message || 'Failed to update profile.');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrStreet) {
      setErrorMsg('Please fill in name, phone, and street address.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await addAddress({
      label: addrLabel,
      fullName: addrFullName,
      phone: addrPhone,
      streetAddress: addrStreet,
      province: addrProvince,
      district: addrDistrict,
      isDefault: addrIsDefault,
    });
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg('Address added to your account.');
      setIsAddingAddress(false);
      setAddrStreet('');
    } else {
      setErrorMsg(res.message || 'Failed to save address.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(22, 6, 32, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: customer ? '680px' : '460px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(22, 6, 32, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.25)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(59, 24, 79, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1A0724 0%, #30103E 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold)',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    color: '#ffffff',
                  }}
                >
                  FURNITURA
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    color: 'var(--color-gold)',
                    textTransform: 'uppercase',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  Client Portal
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                {customer ? `Welcome back, ${customer.fullName}` : 'Sign in to access orders, saved addresses & VIP benefits'}
              </span>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              padding: '6px',
              cursor: 'pointer',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close client modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(59, 24, 79, 0.08)',
            backgroundColor: '#fbf9fc',
            padding: '4px 16px',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          {!customer ? (
            <>
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsResetMode(false);
                  setErrorMsg(null);
                }}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: authModalTab === 'login' && !isResetMode ? '#ffffff' : 'transparent',
                  color: authModalTab === 'login' && !isResetMode ? 'var(--color-plum-900)' : 'var(--color-text-muted)',
                  fontWeight: authModalTab === 'login' && !isResetMode ? 700 : 500,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: authModalTab === 'login' && !isResetMode ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  openAuthModal('register');
                  setIsResetMode(false);
                  setErrorMsg(null);
                }}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: authModalTab === 'register' ? '#ffffff' : 'transparent',
                  color: authModalTab === 'register' ? 'var(--color-plum-900)' : 'var(--color-text-muted)',
                  fontWeight: authModalTab === 'register' ? 700 : 500,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: authModalTab === 'register' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Create Account
              </button>
              <button
                onClick={() => openAuthModal('security')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: authModalTab === 'security' ? '#ffffff' : 'transparent',
                  color: authModalTab === 'security' ? 'var(--color-plum-900)' : 'var(--color-text-muted)',
                  fontWeight: authModalTab === 'security' ? 700 : 500,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: authModalTab === 'security' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} />
                <span>Security</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('profile')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: authModalTab === 'profile' ? '#ffffff' : 'transparent',
                  color: authModalTab === 'profile' ? 'var(--color-plum-900)' : 'var(--color-text-muted)',
                  fontWeight: authModalTab === 'profile' ? 700 : 500,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: authModalTab === 'profile' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Profile & Details
              </button>
              <button
                onClick={() => openAuthModal('orders')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: authModalTab === 'orders' ? '#ffffff' : 'transparent',
                  color: authModalTab === 'orders' ? 'var(--color-plum-900)' : 'var(--color-text-muted)',
                  fontWeight: authModalTab === 'orders' ? 700 : 500,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: authModalTab === 'orders' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Package size={14} />
                <span>My Orders ({orders.length || customer.totalOrders || 0})</span>
              </button>
              <button
                onClick={() => openAuthModal('addresses')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: authModalTab === 'addresses' ? '#ffffff' : 'transparent',
                  color: authModalTab === 'addresses' ? 'var(--color-plum-900)' : 'var(--color-text-muted)',
                  fontWeight: authModalTab === 'addresses' ? 700 : 500,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: authModalTab === 'addresses' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MapPin size={14} />
                <span>Addresses ({(customer.addresses || []).length})</span>
              </button>
              <button
                onClick={() => openAuthModal('security')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: authModalTab === 'security' ? '#ffffff' : 'transparent',
                  color: authModalTab === 'security' ? 'var(--color-plum-900)' : 'var(--color-text-muted)',
                  fontWeight: authModalTab === 'security' ? 700 : 500,
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: authModalTab === 'security' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} />
                <span>Cloud Vault</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Messages */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '10px',
                color: '#be123c',
                fontSize: '0.84rem',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                color: '#15803d',
                fontSize: '0.84rem',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {!customer && authModalTab === 'login' && (
            <div>
              {!isResetMode ? (
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      marginBottom: '18px',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
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
                  </button>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '18px',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                    <span>Or sign in with email</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  </div>

                  <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                        Email Address
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fcfafc' }}>
                        <Mail size={16} color="var(--color-text-light)" style={{ marginRight: '10px' }} />
                        <input
                          type="email"
                          placeholder="client@luxury-interio.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsResetMode(true);
                            setErrorMsg(null);
                          }}
                          style={{ border: 'none', background: 'transparent', color: 'var(--color-plum-800)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fcfafc' }}>
                        <Lock size={16} color="var(--color-text-light)" style={{ marginRight: '10px' }} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--color-plum-900)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(37, 13, 51, 0.2)',
                        marginTop: '6px',
                      }}
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign In to Account'}
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)' }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fcfafc' }}>
                      <Mail size={16} color="var(--color-text-light)" style={{ marginRight: '10px' }} />
                      <input
                        type="email"
                        placeholder="client@luxury-interio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsResetMode(false)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: 2,
                        padding: '12px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--color-plum-900)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {!customer && authModalTab === 'register' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  cursor: 'pointer',
                  marginBottom: '18px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
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
                <span>Sign up with Google</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '18px',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span>Or register with email</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fcfafc' }}>
                    <User size={16} color="var(--color-text-light)" style={{ marginRight: '10px' }} />
                    <input
                      type="text"
                      placeholder="e.g. Marie Uwase"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fcfafc' }}>
                    <Mail size={16} color="var(--color-text-light)" style={{ marginRight: '10px' }} />
                    <input
                      type="email"
                      placeholder="marie.u@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Phone Number (Optional)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fcfafc' }}>
                    <Phone size={16} color="var(--color-text-light)" style={{ marginRight: '10px' }} />
                    <input
                      type="tel"
                      placeholder="+250 788 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Create Password
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', backgroundColor: '#fcfafc' }}>
                    <Lock size={16} color="var(--color-text-light)" style={{ marginRight: '10px' }} />
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-plum-900)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 13, 51, 0.2)',
                    marginTop: '6px',
                  }}
                >
                  {isSubmitting ? 'Creating account...' : 'Create VIP Client Account'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {customer && authModalTab === 'profile' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: '#f8f5fa',
                  border: '1px solid rgba(59, 24, 79, 0.08)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {customer.photoURL ? (
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-gold)', flexShrink: 0 }}>
                      <SafeImage
                        src={customer.photoURL}
                        alt={customer.fullName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-plum-900)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        border: '2px solid var(--color-gold)',
                      }}
                    >
                      {(customer.fullName || customer.email || 'C')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                        {customer.fullName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          backgroundColor: customer.status === 'VIP' ? '#fef3c7' : '#e0e7ff',
                          color: customer.status === 'VIP' ? '#b45309' : '#3730a3',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {customer.status || 'CLIENT'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {customer.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#e11d48',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '22px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fcfafc', border: '1px solid #f1e9f4', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Orders Placed</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-plum-950)' }}>
                    {customer.totalOrders || orders.length || 0}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fcfafc', border: '1px solid #f1e9f4', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Investment</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                    ${(customer.totalSpent || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fcfafc', border: '1px solid #f1e9f4', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Database Status</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                    <CheckCircle2 size={13} /> MongoDB Atlas
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                  Delivery & Contact Information
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                      Phone (Mobile Money)
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+250 788 123 456"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                      Province / State
                    </label>
                    <input
                      type="text"
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      placeholder="e.g. Kigali City"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                      District / City
                    </label>
                    <input
                      type="text"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      placeholder="e.g. Gasabo, Nyarutarama"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                    Primary Street Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="KG 562 St, House 14"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '11px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-plum-900)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile Changes to MongoDB'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {customer && authModalTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                  Purchase & Delivery History
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-plum-800)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  Loading your cloud orders...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', backgroundColor: '#fcfafc', borderRadius: '12px' }}>
                  <Package size={36} color="var(--color-text-light)" style={{ marginBottom: '10px' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-plum-950)', marginBottom: '4px' }}>
                    No Orders Placed Yet
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                    When you purchase luxury furniture or artwork, your orders and tracking details will be securely saved here.
                  </p>
                  <button
                    onClick={closeAuthModal}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '20px',
                      backgroundColor: 'var(--color-plum-900)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Explore Showroom Catalog
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 24, 79, 0.1)',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-plum-950)' }}>
                            #{order.orderNumber}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginLeft: '10px' }}>
                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: order.paymentStatus === 'SUCCESSFUL' ? '#dcfce7' : '#fef3c7',
                              color: order.paymentStatus === 'SUCCESSFUL' ? '#15803d' : '#b45309',
                              textTransform: 'uppercase',
                            }}
                          >
                            {order.paymentStatus}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: '#f3e8ff',
                              color: 'var(--color-plum-900)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f9f6fa', padding: '4px 8px', borderRadius: '6px', flexShrink: 0 }}>
                            {item.image && (
                              <div style={{ width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                <SafeImage src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                              {item.productName} × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1e9f4', paddingTop: '8px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          Destination: {order.deliveryAddress?.streetAddress || 'Storefront pickup'}
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--color-plum-900)' }}>
                          ${order.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SAVED ADDRESSES */}
          {customer && authModalTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                  Delivery Address Book (MongoDB)
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-plum-900)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {isAddingAddress ? (
                <form onSubmit={handleSaveAddress} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fbf9fc', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-plum-900)' }}>
                    New Delivery Destination
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Label (e.g. Villa)"
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Recipient Full Name"
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                      required
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="tel"
                      placeholder="Contact Phone"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      required
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Province (e.g. Kigali)"
                      value={addrProvince}
                      onChange={(e) => setAddrProvince(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="District (e.g. Gasabo)"
                      value={addrDistrict}
                      onChange={(e) => setAddrDistrict(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                      />
                      <span>Set as Default</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="Street Address, Villa Number, Gate Code"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    required
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}
                  />

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ flex: 2, padding: '9px', borderRadius: '8px', backgroundColor: 'var(--color-plum-900)', color: '#ffffff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Save to MongoDB
                    </button>
                  </div>
                </form>
              ) : null}

              {(customer.addresses || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                  No saved addresses yet. Add an address for rapid 1-click showroom checkout.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(customer.addresses || []).map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-plum-950)' }}>
                            {addr.label || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span style={{ fontSize: '0.64rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px' }}>
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-main)' }}>
                          {addr.fullName} · {addr.phone}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          {addr.streetAddress}, {addr.district}, {addr.province}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteAddress(addr.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          padding: '6px',
                          cursor: 'pointer',
                          borderRadius: '6px',
                        }}
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SECURITY */}
          {authModalTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1A0724 0%, #30103E 100%)',
                  color: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={20} color="var(--color-gold)" />
                  <span style={{ fontSize: '0.94rem', fontWeight: 700 }}>
                    Dual-Layer Cloud Security Vault
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                  Your identity, payments, and private order histories are secured using enterprise-grade cryptographic validation.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#fcfafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-plum-950)', marginBottom: '4px' }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>Firebase Auth</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Cryptographically signed JWTs, Google OAuth 2.0 verification, and automated token refresh.
                  </p>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#fcfafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-plum-950)', marginBottom: '4px' }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>MongoDB Atlas</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Encrypted TLS cluster storage with strict per-user database access scoping.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
