import { Router } from 'express';
import {
  adminLogin,
  getAdminMe,
  getDashboardOverview,
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  addAdminOrderNote,
  cancelAdminOrder,
  getAdminPayments,
  getAdminPaymentDetail,
  reconcileAdminPayment,
  getAdminProducts,
  getAdminProductDetail,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminInventory,
  adjustAdminInventory,
  getAdminDiscounts,
  createAdminDiscount,
  updateAdminDiscountStatus,
  getAdminCustomers,
  getAdminCustomerDetail,
  getAdminCategories,
  getAdminReviews,
  updateAdminReviewStatus,
  getAdminDeliveryZones,
  getAdminCMS,
  updateAdminCMS,
  getAdmin3DStudio,
  getAdminAnalytics,
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  getAdminStaff,
  getAdminAuditLogs,
  getAdminSettings,
  updateAdminSettings,
  globalAdminSearch,
  exportAdminResource,
} from '../controllers/adminController';

const router = Router();

// Auth
router.post('/auth/login', adminLogin);
router.get('/auth/me', getAdminMe);

// Dashboard
router.get('/dashboard', getDashboardOverview);

// Orders
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.patch('/orders/:id/status', updateAdminOrderStatus);
router.post('/orders/:id/notes', addAdminOrderNote);
router.post('/orders/:id/cancel', cancelAdminOrder);

// Payments
router.get('/payments', getAdminPayments);
router.get('/payments/:id', getAdminPaymentDetail);
router.post('/payments/:id/reconcile', reconcileAdminPayment);

// Products
router.get('/products', getAdminProducts);
router.get('/products/:id', getAdminProductDetail);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

// Inventory
router.get('/inventory', getAdminInventory);
router.post('/inventory/adjust', adjustAdminInventory);

// Discounts
router.get('/discounts', getAdminDiscounts);
router.post('/discounts', createAdminDiscount);
router.patch('/discounts/:id/status', updateAdminDiscountStatus);

// Customers
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getAdminCustomerDetail);

// Categories
router.get('/categories', getAdminCategories);

// Reviews
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/status', updateAdminReviewStatus);

// Delivery
router.get('/delivery', getAdminDeliveryZones);

// CMS & Content
router.get('/cms', getAdminCMS);
router.put('/cms', updateAdminCMS);

// 3D Studio
router.get('/3d-studio', getAdmin3DStudio);

// Analytics
router.get('/analytics', getAdminAnalytics);

// Notifications
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/:id/read', markAdminNotificationRead);
router.post('/notifications/mark-all-read', markAllAdminNotificationsRead);

// Staff & Audit
router.get('/staff', getAdminStaff);
router.get('/audit-logs', getAdminAuditLogs);

// Settings
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

// Search & Export
router.get('/search', globalAdminSearch);
router.get('/export/:resource', exportAdminResource);

export default router;
