import type { PaymentRecord, PaymentStatus } from '../../types/payment';
import { db } from '../../db/memoryDb';

export const paymentStore = {
  save(payment: PaymentRecord): PaymentRecord {
    db.payments.set(payment.mtnReferenceId, { ...payment });
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
    return record;
  },

  getAll(): PaymentRecord[] {
    return Array.from(db.payments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  clear(): void {
    db.payments.clear();
  },
};
