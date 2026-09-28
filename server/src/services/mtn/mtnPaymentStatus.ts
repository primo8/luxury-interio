import { config, isMtnConfigured } from '../../config/env';
import { getMtnAccessToken } from './mtnAuth';
import { paymentStore } from './mtnPaymentStore';
import { updateOrderStatus, getOrder } from '../orderService';
import type { PaymentStatus, MtnStatusResponse } from '../../types/payment';

export interface PaymentStatusResult {
  referenceId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  phoneNumberMasked: string;
  isSimulated: boolean;
  financialTransactionId?: string;
  failureReason?: string;
  updatedAt: string;
  orderStatus: string;
}

/**
 * Checks the status of an MTN payment by reference ID
 */
export async function checkPaymentStatus(referenceId: string): Promise<PaymentStatusResult | null> {
  const localRecord = paymentStore.getByReferenceId(referenceId);
  if (!localRecord) {
    return null;
  }

  // If local record is already finalized (SUCCESSFUL, FAILED, REJECTED, EXPIRED), return immediately
  if (['SUCCESSFUL', 'FAILED', 'REJECTED', 'EXPIRED'].includes(localRecord.status)) {
    const order = getOrder(localRecord.orderId);
    return {
      referenceId: localRecord.mtnReferenceId,
      orderId: localRecord.orderId,
      status: localRecord.status,
      amount: localRecord.amount,
      currency: localRecord.currency,
      phoneNumberMasked: localRecord.phoneNumberMasked,
      isSimulated: !isMtnConfigured(),
      financialTransactionId: localRecord.financialTransactionId,
      failureReason: localRecord.failureReason,
      updatedAt: localRecord.updatedAt,
      orderStatus: order?.paymentStatus || localRecord.status,
    };
  }

  // If unconfigured, return record without pretending simulation
  if (!isMtnConfigured()) {
    const order = getOrder(localRecord.orderId);
    return {
      referenceId: localRecord.mtnReferenceId,
      orderId: localRecord.orderId,
      status: localRecord.status,
      amount: localRecord.amount,
      currency: localRecord.currency,
      phoneNumberMasked: localRecord.phoneNumberMasked,
      isSimulated: false,
      financialTransactionId: localRecord.financialTransactionId,
      failureReason: localRecord.failureReason || 'MTN MoMo: NOT CONFIGURED',
      updatedAt: localRecord.updatedAt,
      orderStatus: order?.paymentStatus || localRecord.status,
    };
  }

  // Query live MTN Gateway
  const authResult = await getMtnAccessToken();
  if (!authResult.token || authResult.error) {
    return {
      referenceId: localRecord.mtnReferenceId,
      orderId: localRecord.orderId,
      status: localRecord.status,
      amount: localRecord.amount,
      currency: localRecord.currency,
      phoneNumberMasked: localRecord.phoneNumberMasked,
      isSimulated: false,
      failureReason: authResult.error,
      updatedAt: localRecord.updatedAt,
      orderStatus: localRecord.status,
    };
  }

  try {
    const statusUrl = `${config.mtnBaseUrl.replace(/\/+$/, '')}/collection/v1_0/requesttopay/${referenceId}`;

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
        'X-Target-Environment': config.mtnTargetEnvironment,
        'Ocp-Apim-Subscription-Key': config.mtnSubscriptionKey,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as MtnStatusResponse;
      const mtnStatus = (data.status || 'PENDING').toUpperCase() as PaymentStatus;

      const reason = data.reason?.message || (data.status === 'FAILED' ? 'Transaction rejected or failed by user' : undefined);

      paymentStore.updateStatus(referenceId, mtnStatus, {
        failureReason: reason,
        financialTransactionId: data.financialTransactionId,
      });
      updateOrderStatus(localRecord.orderId, mtnStatus);

      return {
        referenceId: localRecord.mtnReferenceId,
        orderId: localRecord.orderId,
        status: mtnStatus,
        amount: localRecord.amount,
        currency: localRecord.currency,
        phoneNumberMasked: localRecord.phoneNumberMasked,
        isSimulated: false,
        financialTransactionId: data.financialTransactionId,
        failureReason: reason,
        updatedAt: new Date().toISOString(),
        orderStatus: mtnStatus,
      };
    } else {
      console.warn('[MTN Status Check Warning]', response.status, response.statusText);
      return {
        referenceId: localRecord.mtnReferenceId,
        orderId: localRecord.orderId,
        status: localRecord.status,
        amount: localRecord.amount,
        currency: localRecord.currency,
        phoneNumberMasked: localRecord.phoneNumberMasked,
        isSimulated: false,
        updatedAt: localRecord.updatedAt,
        orderStatus: localRecord.status,
      };
    }
  } catch (err: any) {
    console.error('[MTN Status Poll Exception]', err);
    return {
      referenceId: localRecord.mtnReferenceId,
      orderId: localRecord.orderId,
      status: localRecord.status,
      amount: localRecord.amount,
      currency: localRecord.currency,
      phoneNumberMasked: localRecord.phoneNumberMasked,
      isSimulated: false,
      updatedAt: localRecord.updatedAt,
      orderStatus: localRecord.status,
    };
  }
}
