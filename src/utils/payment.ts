import type {
  CustomerDetails,
  PaymentDiagnostic,
  PaymentStatus,
  PaymentTransactionRecord,
} from '../types';
import { getApiOrigin } from '../config/api';

export interface CheckoutAndPayPayload {
  orderId?: string;
  items: Array<{ productId: string; quantity: number; colorName?: string; image?: string }>;
  customer: CustomerDetails;
  couponCode?: string;
  phoneNumber: string;
}

export interface CheckoutAndPayResponse {
  success: boolean;
  message: string;
  order?: {
    id: string;
    items: Array<{ productId: string; name: string; price: number; quantity: number }>;
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    total: number;
    currency: string;
    status: PaymentStatus;
  };
  payment?: {
    referenceId: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    phoneNumberMasked: string;
    isSimulated: boolean;
    message: string;
  };
  error?: string;
}

export interface PaymentStatusCheckResponse {
  success: boolean;
  referenceId: string;
  orderId: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  phoneNumberMasked?: string;
  isSimulated?: boolean;
  payment?: any;
  financialTransactionId?: string;
  failureReason?: string;
  updatedAt: string;
  orderStatus: string;
  message?: string;
}

const getApiBase = () => getApiOrigin();

/**
 * Initiates order creation and MTN MoMo RequestToPay on backend
 */
export async function submitCheckoutAndPay(
  payload: CheckoutAndPayPayload
): Promise<CheckoutAndPayResponse> {
  try {
    const res = await fetch(`${getApiBase()}/api/payments/mtn/checkout-and-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Payment API Request Error:', err);
    return {
      success: false,
      message: 'Unable to communicate with the payment server. Please ensure the backend is reachable.',
      error: err.message,
    };
  }
}

/**
 * Polls backend for current payment status
 */
export async function fetchPaymentStatus(
  referenceId: string
): Promise<PaymentStatusCheckResponse | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/payments/mtn/${referenceId}/status`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to poll payment status:', err);
    return null;
  }
}

/**
 * Gets safe sandbox diagnostic info without credentials
 */
export async function fetchPaymentDiagnostics(): Promise<PaymentDiagnostic | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/payments/mtn/config-status`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.diagnostic;
  } catch (err) {
    console.error('Failed to fetch diagnostics:', err);
    return null;
  }
}

/**
 * Developer Test Panel: Trigger sample payment
 */
export async function triggerTestPayment(phoneNumber: string, amount = 100) {
  try {
    const res = await fetch(`${getApiBase()}/api/payments/mtn/test-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, amount }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Developer Test Panel: Fetch all transactions
 */
export async function fetchAllTransactions(): Promise<PaymentTransactionRecord[]> {
  try {
    const res = await fetch(`${getApiBase()}/api/payments/mtn/transactions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.transactions || [];
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
    return [];
  }
}

/**
 * Developer Test Panel: Clear test transactions
 */
export async function clearAllTransactions() {
  try {
    const res = await fetch(`${getApiBase()}/api/payments/mtn/transactions/clear`, { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Developer Test Panel: Simulate status
 */
export async function simulatePaymentStatus(referenceId: string, status: PaymentStatus) {
  try {
    const res = await fetch(`${getApiBase()}/api/payments/mtn/simulate-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceId, status }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
