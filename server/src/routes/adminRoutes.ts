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
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// Public / Login
router.post('/auth/login', adminLogin);

// Protected Admin API Endpoints with Firebase Token & RBAC
router.use(authenticateToken);

router.get('/auth/me', getAdminMe);

// Dashboard
router.get('/dashboard', requirePermission('orders.read'), getDashboardOverview);

// Orders
router.get('/orders', requirePermission('orders.read'), getAdminOrders);
router.get('/orders/:id', requirePermission('orders.read'), getAdminOrderDetail);
router.patch('/orders/:id/status', requirePermission('orders.update'), updateAdminOrderStatus);
router.post('/orders/:id/notes', requirePermission('orders.update'), addAdminOrderNote);
router.post('/orders/:id/cancel', requirePermission('orders.cancel'), cancelAdminOrder);

// Payments & Reconciliation
router.get('/payments', requirePermission('payments.read'), getAdminPayments);
router.get('/payments/:id', requirePermission('payments.read'), getAdminPaymentDetail);
router.post('/payments/:id/reconcile', requirePermission('payments.reconcile'), reconcileAdminPayment);

// Products
router.get('/products', requirePermission('products.read'), getAdminProducts);
router.get('/products/:id', requirePermission('products.read'), getAdminProductDetail);
router.post('/products', requirePermission('products.create'), createAdminProduct);
router.put('/products/:id', requirePermission('products.update'), updateAdminProduct);
router.delete('/products/:id', requirePermission('products.archive'), deleteAdminProduct);

// Inventory
router.get('/inventory', requirePermission('inventory.read'), getAdminInventory);
router.post('/inventory/adjust', requirePermission('inventory.adjust'), adjustAdminInventory);

// Discounts
router.get('/discounts', requirePermission('discounts.read'), getAdminDiscounts);
router.post('/discounts', requirePermission('discounts.create'), createAdminDiscount);
router.patch('/discounts/:id/status', requirePermission('discounts.update'), updateAdminDiscountStatus);

// Customers
router.get('/customers', requirePermission('customers.read'), getAdminCustomers);
router.get('/customers/:id', requirePermission('customers.read'), getAdminCustomerDetail);

// Categories
router.get('/categories', requirePermission('categories.read'), getAdminCategories);

// Reviews
router.get('/reviews', requirePermission('reviews.read'), getAdminReviews);
router.patch('/reviews/:id/status', requirePermission('reviews.manage'), updateAdminReviewStatus);

// Delivery Zones
router.get('/delivery', requirePermission('delivery.read'), getAdminDeliveryZones);

// CMS & Storefront Layout
router.get('/cms', requirePermission('cms.read'), getAdminCMS);
router.put('/cms', requirePermission('cms.manage'), updateAdminCMS);

// 3D Studio
router.get('/3d-studio', requirePermission('products.read'), getAdmin3DStudio);

// Analytics
router.get('/analytics', requirePermission('analytics.read'), getAdminAnalytics);

// Notifications
router.get('/notifications', requirePermission('notifications.read'), getAdminNotifications);
router.patch('/notifications/:id/read', requirePermission('notifications.manage'), markAdminNotificationRead);
router.post('/notifications/read-all', requirePermission('notifications.manage'), markAllAdminNotificationsRead);

// Staff & Roles
router.get('/staff', requirePermission('staff.read'), getAdminStaff);

// Audit Logs
router.get('/audit-logs', requirePermission('audit.read'), getAdminAuditLogs);

// Settings
router.get('/settings', requirePermission('settings.manage'), getAdminSettings);
router.put('/settings', requirePermission('settings.manage'), updateAdminSettings);

// Search
router.get('/search', requirePermission('orders.read'), globalAdminSearch);

// CSV Export
router.get('/export/:resource', requirePermission('orders.read'), exportAdminResource);

export default router;
