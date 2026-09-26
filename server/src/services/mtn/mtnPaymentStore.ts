import type { PaymentRecord, PaymentStatus } from '../../types/payment';

// In-memory payment store
const payments = new Map<string, PaymentRecord>();

export const paymentStore = {
  save(payment: PaymentRecord): PaymentRecord {
    payments.set(payment.mtnReferenceId, { ...payment });
    return payment;
  },

  getByReferenceId(referenceId: string): PaymentRecord | undefined {
    return payments.get(referenceId);
  },

  getByOrderId(orderId: string): PaymentRecord | undefined {
    for (const record of payments.values()) {
      if (record.orderId === orderId) return record;
    }
    return undefined;
  },

  updateStatus(
    referenceId: string, 
    status: PaymentStatus, 
    options?: { failureReason?: string; financialTransactionId?: string }
  ): PaymentRecord | undefined {
    const record = payments.get(referenceId);
    if (!record) return undefined;

    record.status = status;
    record.updatedAt = new Date().toISOString();
    if (options?.failureReason) record.failureReason = options.failureReason;
    if (options?.financialTransactionId) record.financialTransactionId = options.financialTransactionId;

    payments.set(referenceId, record);
    return record;
  },

  getAll(): PaymentRecord[] {
    return Array.from(payments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  clear(): void {
    payments.clear();
  },
};
