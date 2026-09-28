import type { Product } from '../types';

export interface AdminApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${API_ORIGIN}/api/admin`;

// Helper fetch wrapper
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<AdminApiResponse> {
  try {
    const token = localStorage.getItem('furnitura_admin_token') || sessionStorage.getItem('furnitura_admin_token');

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`[Admin API Error] ${endpoint}:`, err);
    return {
      success: false,
      message: err.message || 'Network error communicating with admin backend.',
    };
  }
}

// 1. Dashboard
export async function fetchAdminDashboard() {
  return apiFetch('/dashboard');
}

// 2. Orders
export async function fetchAdminOrders(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/orders${query ? `?${query}` : ''}`);
}

export async function fetchAdminOrderDetail(id: string) {
  return apiFetch(`/orders/${id}`);
}

export async function updateAdminOrderStatus(id: string, newStatus: string, notes?: string) {
  return apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ newStatus, notes }),
  });
}

export async function cancelAdminOrder(id: string, reason?: string) {
  return apiFetch(`/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function addAdminOrderNote(id: string, note: string) {
  return apiFetch(`/orders/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

// 3. Payments & Reconciliation
export async function fetchAdminPayments(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/payments${query ? `?${query}` : ''}`);
}

export async function fetchAdminPaymentDetail(id: string) {
  return apiFetch(`/payments/${id}`);
}

export async function reconcileAdminPayment(id: string) {
  return apiFetch(`/payments/${id}/reconcile`, {
    method: 'POST',
  });
}

// 4. Products
export async function fetchAdminProducts(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/products${query ? `?${query}` : ''}`);
}

export async function fetchAdminProductDetail(id: string) {
  return apiFetch(`/products/${id}`);
}

export async function createAdminProduct(productData: Partial<Product>) {
  return apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateAdminProduct(id: string, productData: Partial<Product>) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

export async function deleteAdminProduct(id: string) {
  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
  });
}

// 5. Inventory
export async function fetchAdminInventory() {
  return apiFetch('/inventory');
}

export async function adjustAdminInventory(adjustmentData: {
  productId: string;
  quantityChange: number;
  type?: string;
  adjustmentType?: string;
  reason: string;
}) {
  return apiFetch('/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify({
      ...adjustmentData,
      type: adjustmentData.type || adjustmentData.adjustmentType || 'MANUAL_ADJUSTMENT',
      adjustmentType: adjustmentData.adjustmentType || adjustmentData.type || 'MANUAL_ADJUSTMENT',
    }),
  });
}

// 6. Discounts
export async function fetchAdminDiscounts() {
  return apiFetch('/discounts');
}

export async function createAdminDiscount(discountData: any) {
  return apiFetch('/discounts', {
    method: 'POST',
    body: JSON.stringify(discountData),
  });
}

export async function updateAdminDiscountStatus(id: string, status: string) {
  return apiFetch(`/discounts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// 7. Customers
export async function fetchAdminCustomers(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/customers${query ? `?${query}` : ''}`);
}

export async function fetchAdminCustomerDetail(id: string) {
  return apiFetch(`/customers/${id}`);
}

// 8. Categories, Reviews & Delivery
export async function fetchAdminCategories() {
  return apiFetch('/categories');
}

export async function fetchAdminReviews() {
  return apiFetch('/reviews');
}

export async function updateAdminReviewStatus(id: string, status: string, reply?: { text: string }) {
  return apiFetch(`/reviews/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reply }),
  });
}

export async function fetchAdminDeliveryZones() {
  return apiFetch('/delivery');
}

// 9. CMS, 3D Studio & Analytics
export async function fetchAdminCMS() {
  return apiFetch('/cms');
}

export async function updateAdminCMS(cmsData: any) {
  return apiFetch('/cms', {
    method: 'PUT',
    body: JSON.stringify(cmsData),
  });
}

export async function fetchAdmin3DStudio() {
  return apiFetch('/3d-studio');
}

export async function fetchAdminAnalytics() {
  return apiFetch('/analytics');
}

// 10. Notifications, Staff & Audit
export async function fetchAdminNotifications() {
  return apiFetch('/notifications');
}

export async function markAdminNotificationRead(id: string) {
  return apiFetch(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllAdminNotificationsRead() {
  return apiFetch('/notifications/mark-all-read', {
    method: 'POST',
  });
}

export async function fetchAdminStaff() {
  return apiFetch('/staff');
}

export async function inviteAdminStaff(data: {
  email: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
}) {
  return apiFetch('/staff/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminStaff(id: string) {
  return apiFetch(`/staff/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleAdminStaffStatus(id: string, isActive: boolean) {
  return apiFetch(`/staff/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export async function fetchAdminAuditLogs(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/audit-logs${query ? `?${query}` : ''}`);
}

// 11. Settings & Global Search
export async function fetchAdminSettings() {
  return apiFetch('/settings');
}

export async function updateAdminSettings(settingsData: any) {
  return apiFetch('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
}

export async function globalAdminSearch(q: string) {
  return apiFetch(`/search?q=${encodeURIComponent(q)}`);
}

export function getExportDownloadUrl(resource: string): string {
  return `${API_BASE}/export/${resource}`;
}
