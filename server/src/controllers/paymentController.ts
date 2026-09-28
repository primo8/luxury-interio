import type { Request, Response } from 'express';
import { getSafeConfigDiagnostic } from '../config/env';
import { isDatabaseConnected } from '../config/database';
import { createServerOrder, getOrder, updateOrderStatus } from '../services/orderService';
import { initiateRequestToPay } from '../services/mtn/mtnCollection';
import { checkPaymentStatus } from '../services/mtn/mtnPaymentStatus';
import { paymentStore } from '../services/mtn/mtnPaymentStore';
import { normalizeMsisdn } from '../utils/referenceId';
import type { PaymentStatus } from '../types/payment';

/**
 * Creates an authoritative order and initiates MTN MoMo RequestToPay
 * POST /api/payments/mtn/checkout-and-pay
 */
export async function createOrderAndPay(req: Request, res: Response) {
  try {
    if (process.env.NODE_ENV === 'production' && !isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB Atlas database is currently unavailable. Orders cannot be processed.',
        error: 'DATABASE_UNAVAILABLE',
      });
    }

    const { items, customer, couponCode, phoneNumber, orderId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

    if (!customer || !customer.fullName || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid customer details (Full Name and Phone Number).',
      });
    }

    const payPhone = phoneNumber || customer.phone;
    const phoneCheck = normalizeMsisdn(payPhone);
    if (!phoneCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: phoneCheck.error || 'Please enter a valid MTN MoMo phone number.',
      });
    }

    // 1. Create authoritative server order
    const order = createServerOrder({
      orderId,
      items,
      customer,
      couponCode,
      paymentMethod: 'MTN_MOMO',
    });

    // 2. Initiate RequestToPay
    const result = await initiateRequestToPay({
      orderId: order.id,
      phoneNumber: payPhone,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        orderId: order.id,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        items: order.items,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        shippingFee: order.shippingFee,
        total: order.total,
        currency: order.currency,
        customer: order.customer,
        status: order.paymentStatus,
      },
      payment: {
        referenceId: result.referenceId,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        phoneNumberMasked: result.phoneNumberMasked,
        isSimulated: result.isSimulated,
        message: result.message,
      },
    });
  } catch (err: any) {
    console.error('[Create Order and Pay Error]', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while creating your order. Please try again.',
    });
  }
}

/**
 * Initiates payment for an existing order
 * POST /api/payments/mtn/request
 */
export async function requestMtnPayment(req: Request, res: Response) {
  try {
    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and MTN MoMo phone number are required.',
      });
    }

    const result = await initiateRequestToPay({
      orderId,
      phoneNumber,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      referenceId: result.referenceId,
      orderId: result.orderId,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      phoneNumberMasked: result.phoneNumberMasked,
      isSimulated: result.isSimulated,
      message: result.message,
    });
  } catch (err: any) {
    console.error('[Request MTN Payment Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Payment request failed. Please check connection and try again.',
    });
  }
}

/**
 * Checks payment status by reference ID
 * GET /api/payments/mtn/:referenceId/status
 */
export async function getMtnPaymentStatus(req: Request, res: Response) {
  try {
    const { referenceId } = req.params;

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Reference ID is required.',
      });
    }

    const refId = String(referenceId || '');
    const result = await checkPaymentStatus(refId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[Get Payment Status Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment status.',
    });
  }
}

/**
 * Safe diagnostics configuration
 * GET /api/payments/mtn/config-status
 */
export async function getSafeConfig(req: Request, res: Response) {
  try {
    const diagnostic = getSafeConfigDiagnostic();
    return res.status(200).json({
      success: true,
      diagnostic,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to read diagnostic status.',
    });
  }
}

/**
 * Developer Test Panel: Trigger sample payment
 * POST /api/payments/mtn/test-request
 */
export async function testCreatePayment(req: Request, res: Response) {
  try {
    const { phoneNumber = '0788123456', amount = 100 } = req.body;

    const testOrder = createServerOrder({
      items: [{ productId: 'prod-3', quantity: 1 }],
      customer: {
        fullName: 'Sandbox Tester',
        email: 'tester@furnitura.luxury',
        phone: phoneNumber,
        address: 'Boulevard de la Révolution, Kigali',
      },
    });

    const result = await initiateRequestToPay({
      orderId: testOrder.id,
      phoneNumber,
    });

    return res.status(200).json({
      success: result.success,
      testOrder,
      result,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Test payment failed: ' + err.message,
    });
  }
}

/**
 * Developer Test Panel: Get all transactions
 * GET /api/payments/mtn/transactions
 */
export async function getTransactions(req: Request, res: Response) {
  try {
    const records = paymentStore.getAll();
    return res.status(200).json({
      success: true,
      transactions: records,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.',
    });
  }
}

/**
 * Developer Test Panel: Clear test transactions
 * POST /api/payments/mtn/transactions/clear
 */
export async function clearTransactions(req: Request, res: Response) {
  try {
    paymentStore.clear();
    return res.status(200).json({
      success: true,
      message: 'All test transactions cleared.',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to clear transactions.',
    });
  }
}

/**
 * Developer Test Panel: Simulate status transition manually
 * POST /api/payments/mtn/simulate-status
 */
export async function simulateStatus(req: Request, res: Response) {
  try {
    const { referenceId, status } = req.body;
    if (!referenceId || !status) {
      return res.status(400).json({ success: false, message: 'referenceId and status required' });
    }

    const updated = paymentStore.updateStatus(referenceId, status as PaymentStatus, {
      financialTransactionId: status === 'SUCCESSFUL' ? `SIM-${Date.now()}` : undefined,
      failureReason: status === 'FAILED' ? 'Simulated payment failure' : undefined,
    });

    if (updated) {
      updateOrderStatus(updated.orderId, status as PaymentStatus);
    }

    return res.status(200).json({ success: true, updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
