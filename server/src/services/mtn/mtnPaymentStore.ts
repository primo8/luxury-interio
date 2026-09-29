import type { PaymentRecord, PaymentStatus } from '../../types/payment';
import { db } from '../../db/memoryDb';
import { PaymentModel } from '../../models/Payment';
import { isDatabaseConnected } from '../../config/database';

export const paymentStore = {
  save(payment: PaymentRecord): PaymentRecord {
    db.payments.set(payment.mtnReferenceId, { ...payment });

    if (isDatabaseConnected()) {
      (PaymentModel as any).findOneAndUpdate(
        { mtnReferenceId: payment.mtnReferenceId },
        {
          id: payment.paymentId,
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          mtnReferenceId: payment.mtnReferenceId,
          externalId: payment.externalId,
          amount: payment.amount,
          currency: payment.currency || 'RWF',
          phoneNumberMasked: payment.phoneNumberMasked,
          provider: payment.provider || 'MTN_MOMO',
          environment: 'SANDBOX',
          status: payment.status,
          failureReason: payment.failureReason,
          $push: {
            events: {
              status: payment.status,
              timestamp: new Date(),
              details: 'Payment recorded',
              source: 'GATEWAY_CALLBACK',
            },
          },
        },
        { upsert: true, returnDocument: 'after' }
      ).catch((err: any) => console.error('⚠️ [PaymentStore] MongoDB save failed:', err.message));
    }

    return payment;
  },

  getByReferenceId(referenceId: string): PaymentRecord | undefined {
    return db.payments.get(referenceId);
  },

  getByOrderId(orderId: string): PaymentRecord | undefined {
    for (const record of db.payments.values()) {
      if (record.orderId === orderId || record.externalId === orderId) return record;
    }
    return undefined;
  },

  getById(paymentId: string): PaymentRecord | undefined {
    for (const record of db.payments.values()) {
      if (record.paymentId === paymentId) return record;
    }
    return undefined;
  },

  updateStatus(
    referenceId: string,
    status: PaymentStatus,
    options?: { failureReason?: string; financialTransactionId?: string }
  ): PaymentRecord | undefined {
    const record = db.payments.get(referenceId);
    if (!record) return undefined;

    record.status = status;
    record.updatedAt = new Date().toISOString();
    if (options?.failureReason) record.failureReason = options.failureReason;
    if (options?.financialTransactionId) record.financialTransactionId = options.financialTransactionId;

    db.payments.set(referenceId, record);

    if (isDatabaseConnected()) {
      (PaymentModel as any).findOneAndUpdate(
        { mtnReferenceId: referenceId },
        {
          status,
          failureReason: options?.failureReason,
          lastCheckedAt: new Date(),
          $push: {
            events: {
              status,
              timestamp: new Date(),
              details: options?.failureReason ? `Status changed: ${options.failureReason}` : `Status transitioned to ${status}`,
              source: 'STATUS_POLL',
            },
          },
        }
      ).catch((err: any) => console.error('⚠️ [PaymentStore] MongoDB update failed:', err.message));
    }

    return record;
  },

  getAll(): PaymentRecord[] {
    return Array.from(db.payments.values()).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  clear(): void {
    db.payments.clear();
  },
};
