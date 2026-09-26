import React, { useEffect } from 'react';
import { CheckCircle2, Heart, ShoppingBag, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'cart' | 'wishlist' | 'info' | 'success';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  onOpenCart?: () => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, onOpenCart }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '84px',
        right: '24px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
      }}
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} onOpenCart={onOpenCart} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  onOpenCart?: () => void;
}> = ({ toast, onDismiss, onOpenCart }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'wishlist':
        return <Heart size={18} fill="#e63946" color="#e63946" />;
      case 'cart':
        return <ShoppingBag size={18} color="var(--color-gold)" />;
      default:
        return <CheckCircle2 size={18} color="#2a9d8f" />;
    }
  };

  return (
    <div
      style={{
        pointerEvents: 'auto',
        backgroundColor: '#1d1028',
        color: '#ffffff',
        padding: '14px 18px',
        borderRadius: '14px',
        boxShadow: '0 12px 35px rgba(22, 6, 32, 0.45), 0 0 0 1px rgba(212, 175, 55, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {getIcon()}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '0.2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {toast.title}
          </div>
          {toast.description && (
            <div
              style={{
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {toast.description}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {toast.type === 'cart' && onOpenCart && (
          <button
            onClick={() => {
              onOpenCart();
              onDismiss(toast.id);
            }}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-gold)',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '0.5px',
              cursor: 'pointer',
            }}
          >
            VIEW
          </button>
        )}
        <button
          onClick={() => onDismiss(toast.id)}
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '4px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
          }}
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
