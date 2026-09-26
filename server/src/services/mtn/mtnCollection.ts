import { config, isMtnConfigured } from '../../config/env';
import { getMtnAccessToken } from './mtnAuth';
import { paymentStore } from './mtnPaymentStore';
import { updateOrderStatus, getOrder } from '../orderService';
import { generateReferenceId, normalizeMsisdn, maskPhoneNumber } from '../../utils/referenceId';
import type { PaymentRecord, MtnRequestToPayPayload } from '../../types/payment';

export interface RequestToPayParams {
  orderId: string;
  phoneNumber: string;
  amount?: number; // Optional hint, but server validates against order
  currency?: string;
  itemsSummary?: string;
  payerMessage?: string;
}

export interface RequestToPayResult {
  success: boolean;
  referenceId: string;
  orderId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  amount: number;
  currency: string;
  phoneNumberMasked: string;
  isSimulated: boolean;
  message: string;
  error?: string;
}

/**
 * Initiates an MTN MoMo RequestToPay transaction
 */
export async function initiateRequestToPay(params: RequestToPayParams): Promise<RequestToPayResult> {
  const { orderId, phoneNumber } = params;

  // 1. Authoritative order lookup
  const order = getOrder(orderId);
  if (!order) {
    return {
      success: false,
      referenceId: '',
      orderId,
      status: 'FAILED',
      amount: 0,
      currency: config.mtnCurrency,
      phoneNumberMasked: maskPhoneNumber(phoneNumber),
      isSimulated: false,
      message: 'Order not found or has expired.',
      error: 'ORDER_NOT_FOUND',
    };
  }

  // 2. Validate & normalize phone number
  const phoneCheck = normalizeMsisdn(phoneNumber);
  if (!phoneCheck.isValid) {
    return {
      success: false,
      referenceId: '',
      orderId,
      status: 'FAILED',
      amount: order.total,
      currency: config.mtnCurrency,
      phoneNumberMasked: maskPhoneNumber(phoneNumber),
      isSimulated: false,
      message: phoneCheck.error || 'Invalid phone number format.',
      error: 'INVALID_PHONE_NUMBER',
    };
  }

  // 3. Prevent duplicate active pending payments for same order
  const existingPayment = paymentStore.getByOrderId(orderId);
  if (existingPayment && existingPayment.status === 'PENDING') {
    // If pending payment is less than 3 minutes old, reuse or return pending status
    const ageMs = Date.now() - new Date(existingPayment.createdAt).getTime();
    if (ageMs < 180000) {
      return {
        success: true,
        referenceId: existingPayment.mtnReferenceId,
        orderId: existingPayment.orderId,
        status: 'PENDING',
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        phoneNumberMasked: existingPayment.phoneNumberMasked,
        isSimulated: !isMtnConfigured(),
        message: 'A payment request is already pending approval on this device.',
      };
    }
  }

  // 4. Generate UUID v4 reference
  const referenceId = generateReferenceId();
  const paymentId = `PAY-${Date.now()}`;
  const amountToCharge = order.total;
  const paymentCurrency = config.mtnCurrency || 'EUR';
  const maskedPhone = maskPhoneNumber(phoneNumber);

  // 5. Build payment record
  const paymentRecord: PaymentRecord = {
    paymentId,
    orderId,
    externalId: order.id,
    mtnReferenceId: referenceId,
    amount: amountToCharge,
    currency: paymentCurrency,
    phoneNumberMasked: maskedPhone,
    rawPhoneNumber: phoneCheck.normalized,
    provider: 'MTN_MOMO',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itemsSummary: order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
    payerMessage: params.payerMessage || `Payment for FURNITURA Order ${order.id}`,
  };

  paymentStore.save(paymentRecord);
  updateOrderStatus(order.id, 'PENDING', referenceId);

  // 6. Handle Simulated Sandbox mode if credentials not provided
  if (!isMtnConfigured()) {
    console.log(`[MTN Sandbox Simulator] RequestToPay initiated for Order ${orderId} (${maskedPhone}), Ref: ${referenceId}`);
    
    // In simulated sandbox mode, schedule an automatic simulated approval after 4 seconds (unless it's a test failed scenario)
    // Note: If the phone number ends in "0000", simulate failure; if "9999", simulate timeout/rejection
    setTimeout(() => {
      const current = paymentStore.getByReferenceId(referenceId);
      if (current && current.status === 'PENDING') {
        if (phoneNumber.endsWith('0000')) {
          paymentStore.updateStatus(referenceId, 'FAILED', { failureReason: 'Insufficient funds or account inactive' });
          updateOrderStatus(orderId, 'FAILED');
        } else if (phoneNumber.endsWith('9999')) {
          paymentStore.updateStatus(referenceId, 'REJECTED', { failureReason: 'Customer declined prompt' });
          updateOrderStatus(orderId, 'REJECTED');
        } else {
          paymentStore.updateStatus(referenceId, 'SUCCESSFUL', { financialTransactionId: `MTN-TX-${Math.floor(10000000 + Math.random() * 90000000)}` });
          updateOrderStatus(orderId, 'SUCCESSFUL');
        }
      }
    }, 4500);

    return {
      success: true,
      referenceId,
      orderId,
      status: 'PENDING',
      amount: amountToCharge,
      currency: paymentCurrency,
      phoneNumberMasked: maskedPhone,
      isSimulated: true,
      message: 'Payment request sent! Please approve the prompt on your phone (078XXXXXXX).',
    };
  }

  // 7. Live MTN Sandbox API Call
  const authResult = await getMtnAccessToken();
  if (!authResult.token || authResult.error) {
    paymentStore.updateStatus(referenceId, 'FAILED', { failureReason: authResult.error });
    updateOrderStatus(orderId, 'FAILED');
    return {
      success: false,
      referenceId,
      orderId,
      status: 'FAILED',
      amount: amountToCharge,
      currency: paymentCurrency,
      phoneNumberMasked: maskedPhone,
      isSimulated: false,
      message: 'Unable to authenticate with MTN MoMo payment gateway.',
      error: authResult.error,
    };
  }

  try {
    const payload: MtnRequestToPayPayload = {
      amount: amountToCharge.toString(),
      currency: paymentCurrency,
      externalId: order.id,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneCheck.normalized,
      },
      payerMessage: `FURNITURA Order ${order.id}`,
      payeeNote: `Payment for Luxury Furniture`,
    };

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authResult.token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': config.mtnTargetEnvironment,
      'Ocp-Apim-Subscription-Key': config.mtnSubscriptionKey,
      'Content-Type': 'application/json',
    };

    if (config.mtnCallbackUrl.trim()) {
      headers['X-Callback-Url'] = config.mtnCallbackUrl;
    }

    const requestUrl = `${config.mtnBaseUrl.replace(/\/+$/, '')}/collection/v1_0/requesttopay`;

    const mtnResponse = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    // MTN RequestToPay returns 202 Accepted on success
    if (mtnResponse.status === 202 || mtnResponse.status === 200 || mtnResponse.status === 201) {
      return {
        success: true,
        referenceId,
        orderId,
        status: 'PENDING',
        amount: amountToCharge,
        currency: paymentCurrency,
        phoneNumberMasked: maskedPhone,
        isSimulated: false,
        message: 'Payment request sent! Please enter your MTN MoMo PIN to authorize.',
      };
    } else {
      const errorText = await mtnResponse.text();
      console.error('[MTN RequestToPay Error]', mtnResponse.status, errorText);
      paymentStore.updateStatus(referenceId, 'FAILED', { failureReason: `MTN HTTP ${mtnResponse.status}: ${errorText}` });
      updateOrderStatus(orderId, 'FAILED');

      return {
        success: false,
        referenceId,
        orderId,
        status: 'FAILED',
        amount: amountToCharge,
        currency: paymentCurrency,
        phoneNumberMasked: maskedPhone,
        isSimulated: false,
        message: 'Payment request was declined by MTN Gateway. Please verify your phone number.',
        error: `HTTP ${mtnResponse.status}`,
      };
    }
  } catch (err: any) {
    console.error('[MTN RequestToPay Exception]', err);
    paymentStore.updateStatus(referenceId, 'FAILED', { failureReason: err.message });
    updateOrderStatus(orderId, 'FAILED');

    return {
      success: false,
      referenceId,
      orderId,
      status: 'FAILED',
      amount: amountToCharge,
      currency: paymentCurrency,
      phoneNumberMasked: maskedPhone,
      isSimulated: false,
      message: 'Connection error while communicating with MTN MoMo. Please try again.',
      error: err.message,
    };
  }
}
