import type { ServerOrder, OrderItem, CustomerData, PaymentStatus, PaymentProvider } from '../types/payment';
import { generateOrderId } from '../utils/referenceId';

// Authoritative product catalog price map
const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  'prod-1': { name: 'Aura Velvet Cloud Sectional', price: 2490 },
  'prod-2': { name: 'Elysium Travertine Dining Table', price: 1850 },
  'prod-3': { name: 'Nordic Bouclé Accent Armchair', price: 890 },
  'prod-4': { name: 'Zenith Fluted Marble Sideboard', price: 1420 },
  'prod-5': { name: 'Serenade Curved Velvet King Bed', price: 2190 },
  'prod-6': { name: 'Vortex Brushed Brass Arc Lamp', price: 420 },
  'prod-7': { name: 'Celestial Modular Plum Velvet Sofa', price: 3200 },
  'prod-8': { name: 'Solace Walnut Ergonomic Executive Desk', price: 1290 },
};

const VALID_COUPONS: Record<string, number> = {
  'FURNITURA10': 10,
  'WELCOME20': 20,
  'LUXURY30': 30,
};

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 49;

// In-memory order store
const orders = new Map<string, ServerOrder>();

/**
 * Calculates authoritative pricing for items
 */
export function calculateOrderTotals(
  items: Array<{ productId: string; quantity: number }>,
  couponCode?: string
): {
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  shippingFee: number;
  total: number;
  validItems: OrderItem[];
} {
  let subtotal = 0;
  const validItems: OrderItem[] = [];

  for (const item of items) {
    const catalogItem = PRODUCT_CATALOG[item.productId];
    const unitPrice = catalogItem ? catalogItem.price : 450; // Fallback unit price if new product
    const qty = Math.max(1, Math.min(100, item.quantity || 1));
    subtotal += unitPrice * qty;

    validItems.push({
      productId: item.productId,
      name: catalogItem ? catalogItem.name : `Luxury Furniture Piece (${item.productId})`,
      price: unitPrice,
      quantity: qty,
    });
  }

  let discountPercent = 0;
  if (couponCode) {
    const normalized = couponCode.trim().toUpperCase();
    if (VALID_COUPONS[normalized]) {
      discountPercent = VALID_COUPONS[normalized];
    }
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  return {
    subtotal,
    discountAmount,
    discountPercent,
    shippingFee,
    total,
    validItems,
  };
}

/**
 * Creates or updates an authoritative server order
 */
export function createServerOrder(data: {
  orderId?: string;
  items: Array<{ productId: string; quantity: number; colorName?: string; image?: string }>;
  customer: CustomerData;
  couponCode?: string;
  paymentMethod?: PaymentProvider;
  currency?: string;
}): ServerOrder {
  const id = data.orderId || generateOrderId();
  const calculated = calculateOrderTotals(data.items, data.couponCode);

  const order: ServerOrder = {
    id,
    items: calculated.validItems.map((item, idx) => ({
      ...item,
      colorName: data.items[idx]?.colorName || 'Royal Plum',
      image: data.items[idx]?.image,
    })),
    subtotal: calculated.subtotal,
    discountAmount: calculated.discountAmount,
    couponCode: data.couponCode?.trim().toUpperCase(),
    shippingFee: calculated.shippingFee,
    total: calculated.total,
    currency: data.currency || 'USD',
    customer: data.customer,
    paymentMethod: data.paymentMethod || 'MTN_MOMO',
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.set(id, order);
  return order;
}

/**
 * Retrieves an order by ID
 */
export function getOrder(orderId: string): ServerOrder | undefined {
  return orders.get(orderId);
}

/**
 * Updates order payment status
 */
export function updateOrderStatus(
  orderId: string, 
  status: PaymentStatus, 
  paymentReferenceId?: string
): ServerOrder | undefined {
  const order = orders.get(orderId);
  if (!order) return undefined;

  order.paymentStatus = status;
  if (paymentReferenceId) {
    order.paymentReferenceId = paymentReferenceId;
  }
  order.updatedAt = new Date().toISOString();
  orders.set(orderId, order);
  return order;
}

/**
 * Lists recent orders (for diagnostics)
 */
export function listOrders(): ServerOrder[] {
  return Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
