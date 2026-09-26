import { Router } from 'express';
import {
  createOrderAndPay,
  requestMtnPayment,
  getMtnPaymentStatus,
  getSafeConfig,
  testCreatePayment,
  getTransactions,
  clearTransactions,
  simulateStatus,
} from '../controllers/paymentController';
import { handleMtnCallback } from '../controllers/webhookController';

const router = Router();

// Storefront Checkout & Payment Endpoints
router.post('/checkout-and-pay', createOrderAndPay);
router.post('/request', requestMtnPayment);
router.get('/:referenceId/status', getMtnPaymentStatus);

// Webhook / Callback Endpoint
router.post('/callback', handleMtnCallback);

// Safe Diagnostics & Developer Sandbox Test Panel
router.get('/config-status', getSafeConfig);
router.post('/test-request', testCreatePayment);
router.get('/transactions', getTransactions);
router.post('/transactions/clear', clearTransactions);
router.post('/simulate-status', simulateStatus);

export default router;
