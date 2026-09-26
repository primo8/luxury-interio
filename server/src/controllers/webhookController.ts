import type { Request, Response } from 'express';
import { paymentStore } from '../services/mtn/mtnPaymentStore';
import { updateOrderStatus } from '../services/orderService';
import type { PaymentStatus } from '../types/payment';

/**
 * Handles incoming MTN MoMo RequestToPay Webhook / Callback
 * POST /api/payments/mtn/callback
 */
export async function handleMtnCallback(req: Request, res: Response) {
  try {
    const callbackData = req.body;
    console.log('[MTN Webhook Callback Received]', JSON.stringify(callbackData));

    // MTN Callback payload typically has { referenceId, status, financialTransactionId, externalId, reason }
    const referenceId = callbackData.referenceId || callbackData.financialTransactionId || req.headers['x-reference-id'] as string;
    const rawStatus = (callbackData.status || '').toUpperCase();

    if (!referenceId && !callbackData.externalId) {
      return res.status(400).json({ success: false, message: 'Missing reference identifier' });
    }

    let record = referenceId ? paymentStore.getByReferenceId(referenceId) : undefined;
    if (!record && callbackData.externalId) {
      record = paymentStore.getByOrderId(callbackData.externalId);
    }

    if (!record) {
      console.warn(`[MTN Webhook] No matching payment record found for ref: ${referenceId}`);
      // Return 200 to acknowledge webhook idempotently without crashing MTN webhook retry
      return res.status(200).json({ success: true, message: 'Webhook received but record not indexed' });
    }

    let nextStatus: PaymentStatus = 'UNKNOWN';
    if (rawStatus === 'SUCCESSFUL' || rawStatus === 'SUCCESS') nextStatus = 'SUCCESSFUL';
    else if (rawStatus === 'FAILED') nextStatus = 'FAILED';
    else if (rawStatus === 'REJECTED') nextStatus = 'REJECTED';
    else if (rawStatus === 'EXPIRED' || rawStatus === 'TIMEOUT') nextStatus = 'EXPIRED';
    else if (rawStatus === 'PENDING') nextStatus = 'PENDING';

    if (nextStatus !== 'UNKNOWN') {
      paymentStore.updateStatus(record.mtnReferenceId, nextStatus, {
        financialTransactionId: callbackData.financialTransactionId,
        failureReason: callbackData.reason?.message || callbackData.message,
      });

      updateOrderStatus(record.orderId, nextStatus);
      console.log(`[MTN Webhook] Updated Order ${record.orderId} status to ${nextStatus}`);
    }

    return res.status(200).json({ success: true, message: 'Callback processed successfully' });
  } catch (err: any) {
    console.error('[MTN Webhook Callback Error]', err);
    return res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
}
