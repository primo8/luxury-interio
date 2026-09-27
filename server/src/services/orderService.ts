import type { CustomerData, PaymentStatus, PaymentProvider } from '../types/payment';
import type { AdminOrder, AdminOrderItem, OrderWorkflowStatus, PaymentRecordStatus } from '../types/admin';
import { generateOrderId } from '../utils/referenceId';
import { db } from '../db/memoryDb';
import { OrderModel } from '../models/Order';
import { CustomerModel } from '../models/Customer';
import { DiscountModel } from '../models/Discount';
import { ProductModel } from '../models/Product';
import { InventoryAdjustmentModel } from '../models/Inventory';
import { NotificationModel } from '../models/Notification';
import { AuditLogModel } from '../models/AuditLog';
import { isDatabaseConnected } from '../config/database';

export interface CalculateTotalsResult {
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  shippingFee: number;
  total: number;
  validItems: AdminOrderItem[];
}

/**
 * Calculates authoritative pricing using the live products in database
 */
export function calculateOrderTotals(
  items: Array<{ productId: string; quantity: number }>,
  couponCode?: string,
  deliveryZoneId?: string
): CalculateTotalsResult {
  let subtotal = 0;
  const validItems: AdminOrderItem[] = [];

  for (const item of items) {
    const product = db.products.get(item.productId);
    const unitPrice = product ? product.price : 450;
    const originalPrice = product?.originalPrice;
    const qty = Math.max(1, Math.min(100, item.quantity || 1));
    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    validItems.push({
      productId: item.productId,
      name: product ? product.name : `Luxury Furniture Piece (${item.productId})`,
      sku: product ? product.sku : `FUR-${item.productId.toUpperCase()}`,
      price: unitPrice,
      originalPrice,
      quantity: qty,
      image: product?.image,
      subtotal: itemSubtotal,
    });
  }

  let discountAmount = 0;
  let discountPercent = 0;

  if (couponCode) {
    const normalized = couponCode.trim().toUpperCase();
    const rule = Array.from(db.discounts.values()).find(
      (d) => d.code === normalized && d.status === 'ACTIVE'
    );

    if (rule) {
      const now = new Date().toISOString();
      const isDateValid = rule.startDate <= now && rule.endDate >= now;
      const isMinMet = subtotal >= rule.minOrderValue;
      const hasUses = rule.usageCount < rule.usageLimit;

      if (isDateValid && isMinMet && hasUses) {
        if (rule.type === 'percentage') {
          discountPercent = rule.value;
          discountAmount = Math.round((subtotal * rule.value) / 100);
          if (rule.maxDiscount && discountAmount > rule.maxDiscount) {
            discountAmount = rule.maxDiscount;
          }
        } else {
          discountAmount = Math.min(rule.value, subtotal);
        }
      }
    }
  }

  let shippingFee = 0;
  if (deliveryZoneId) {
    const zone = db.deliveryZones.get(deliveryZoneId);
    if (zone) {
      shippingFee = subtotal >= zone.freeShippingThreshold ? 0 : zone.fee;
    }
  } else {
    shippingFee = subtotal >= db.settings.freeShippingThreshold || items.length === 0 ? 0 : db.settings.standardShippingFee;
  }

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
  deliveryZoneId?: string;
}): AdminOrder {
  const id = data.orderId || generateOrderId();
  const calculated = calculateOrderTotals(data.items, data.couponCode, data.deliveryZoneId);

  const zone = data.deliveryZoneId ? db.deliveryZones.get(data.deliveryZoneId) : undefined;

  const order: AdminOrder = {
    id,
    orderNumber: id,
    items: calculated.validItems.map((item, idx) => ({
      ...item,
      colorName: data.items[idx]?.colorName || 'Royal Plum',
      image: data.items[idx]?.image || item.image,
    })),
    subtotal: calculated.subtotal,
    discountAmount: calculated.discountAmount,
    couponCode: data.couponCode?.trim().toUpperCase(),
    shippingFee: calculated.shippingFee,
    total: calculated.total,
    currency: data.currency || db.settings.currency || 'USD',
    customer: {
      fullName: data.customer.fullName,
      email: data.customer.email,
      phone: data.customer.phone,
      province: data.customer.province,
      district: data.customer.district,
      sector: data.customer.sector,
      address: data.customer.address,
      notes: data.customer.notes,
    },
    deliveryZoneId: data.deliveryZoneId,
    deliveryZoneName: zone?.name,
    orderStatus: 'PENDING_PAYMENT',
    paymentMethod: (data.paymentMethod as any) || 'MTN_MOMO',
    paymentStatus: 'PENDING',
    timeline: [
      {
        id: `t-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Customer / Storefront',
        event: 'Order created via checkout',
        status: 'PENDING_PAYMENT',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.set(id, order);

  // Update or create customer record in database
  const existingCust = Array.from(db.customers.values()).find(
    (c) => c.phone === data.customer.phone || c.email === data.customer.email
  );

  if (existingCust) {
    existingCust.totalOrders += 1;
    existingCust.totalSpent += calculated.total;
    existingCust.lastOrderDate = order.createdAt;
    if (data.customer.address) existingCust.address = data.customer.address;
    if (data.customer.province) existingCust.province = data.customer.province;
    if (data.customer.district) existingCust.district = data.customer.district;
    if (data.customer.sector) existingCust.sector = data.customer.sector;
    db.customers.set(existingCust.id, existingCust);
  } else {
    const newCustId = `cust-${Date.now()}`;
    db.customers.set(newCustId, {
      id: newCustId,
      fullName: data.customer.fullName,
      email: data.customer.email,
      phone: data.customer.phone,
      province: data.customer.province,
      district: data.customer.district,
      sector: data.customer.sector,
      address: data.customer.address,
      tags: ['Online Customer'],
      totalOrders: 1,
      totalSpent: calculated.total,
      lastOrderDate: order.createdAt,
      status: 'ACTIVE',
      createdAt: order.createdAt,
    });
  }

  // Increment discount usage if coupon was used
  if (data.couponCode) {
    const normalized = data.couponCode.trim().toUpperCase();
    const discount = Array.from(db.discounts.values()).find((d) => d.code === normalized);
    if (discount) {
      discount.usageCount += 1;
      db.discounts.set(discount.id, discount);
    }
  }

  // Notify admin
  db.addNotification({
    title: `New Order Received: #${order.orderNumber}`,
    message: `${order.customer.fullName} placed an order for $${order.total.toLocaleString()} (${order.items.length} items).`,
    type: 'order',
    severity: 'info',
    link: `/admin/orders/${order.id}`,
  });

  // Async write-through to MongoDB Atlas if connected
  if (isDatabaseConnected()) {
    OrderModel.findOneAndUpdate(
      { orderNumber: order.orderNumber },
      {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.fullName,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        deliveryAddress: {
          province: order.customer.province,
          district: order.customer.district,
          sector: order.customer.sector,
          streetAddress: order.customer.address,
          notes: order.customer.notes,
        },
        items: order.items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.price,
          subtotal: i.subtotal,
          image: i.image,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.shippingFee,
        discountAmount: order.discountAmount,
        appliedDiscountCode: order.couponCode,
        total: order.total,
        currency: order.currency,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        timeline: order.timeline.map((t) => ({
          status: t.status || order.orderStatus,
          timestamp: new Date(t.timestamp),
          actor: t.actor,
          note: t.notes || t.event,
        })),
      },
      { upsert: true, new: true }
    ).catch((err) => console.error('⚠️ [OrderService] MongoDB Order save failed:', err.message));

    CustomerModel.findOneAndUpdate(
      { phone: order.customer.phone },
      {
        $set: {
          fullName: order.customer.fullName,
          email: order.customer.email,
          phone: order.customer.phone,
          address: order.customer.address,
          province: order.customer.province,
          district: order.customer.district,
          lastOrderDate: new Date(),
        },
        $inc: { totalOrders: 1, totalSpent: order.total },
        $setOnInsert: { id: `cust-${Date.now()}`, status: 'ACTIVE', tags: ['Storefront Customer'] },
      },
      { upsert: true }
    ).catch((err) => console.error('⚠️ [OrderService] MongoDB Customer sync failed:', err.message));

    if (order.couponCode) {
      DiscountModel.findOneAndUpdate(
        { code: order.couponCode },
        { $inc: { usageCount: 1 } }
      ).catch((err) => console.error('⚠️ [OrderService] MongoDB Discount usage increment failed:', err.message));
    }

    NotificationModel.create({
      id: `notif-${Date.now()}`,
      type: 'ORDER',
      title: `New Order Received: #${order.orderNumber}`,
      message: `${order.customer.fullName} placed an order for $${order.total.toLocaleString()}.`,
      isRead: false,
      linkTab: 'orders',
      linkId: order.id,
    }).catch((err) => console.error('⚠️ [OrderService] MongoDB Notification create failed:', err.message));
  }

  return order;
}

/**
 * Retrieves an order by ID
 */
export function getOrder(orderId: string): AdminOrder | undefined {
  return db.orders.get(orderId);
}

/**
 * Updates order payment status and synchronizes workflow state
 */
export function updateOrderStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentReferenceId?: string
): AdminOrder | undefined {
  const order = db.orders.get(orderId);
  if (!order) return undefined;

  order.paymentStatus = paymentStatus as PaymentRecordStatus;

  if (paymentReferenceId) {
    order.paymentReferenceId = paymentReferenceId;
  }

  // Strict workflow rule: When payment transitions to SUCCESSFUL, advance order from PENDING_PAYMENT to PAID
  if (paymentStatus === 'SUCCESSFUL' && order.orderStatus === 'PENDING_PAYMENT') {
    order.orderStatus = 'PAID';
    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'MTN MoMo Gateway',
      event: `Payment verified & confirmed ($${order.total.toFixed(2)})`,
      status: 'PAID',
    });

    // Deduct stock and log inventory change for each item
    for (const item of order.items) {
      const product = db.products.get(item.productId);
      if (product) {
        const prevStock = product.stockCount;
        const newStock = Math.max(0, prevStock - item.quantity);
        product.stockCount = newStock;
        product.inStock = newStock > 0;
        db.products.set(product.id, product);

        db.inventoryLogs.unshift({
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          adjustmentType: 'SALE',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock,
          reason: `Auto stock deduction for paid order #${order.orderNumber}`,
          actor: 'System (MTN Gateway)',
          timestamp: new Date().toISOString(),
        });

        if (isDatabaseConnected()) {
          ProductModel.findOneAndUpdate(
            { id: product.id },
            { stock: newStock, inStock: newStock > 0 }
          ).catch((err) => console.error('⚠️ [OrderService] MongoDB stock update failed:', err.message));

          InventoryAdjustmentModel.create({
            id: `inv-${Date.now()}`,
            productId: product.id,
            sku: product.sku,
            quantityChange: -item.quantity,
            type: 'SALE',
            reason: `Auto stock deduction for paid order #${order.orderNumber}`,
            adminId: 'SYSTEM_MTN',
            adminName: 'MTN MoMo Reconciliation',
            previousStock: prevStock,
            newStock,
          }).catch((err) => console.error('⚠️ [OrderService] MongoDB InventoryAdjustment failed:', err.message));
        }

        if (newStock <= db.settings.inventoryLowStockThreshold) {
          db.addNotification({
            title: `Low Stock Alert: ${product.name}`,
            message: `Stock for "${product.name}" (${product.sku}) dropped to ${newStock} units.`,
            type: 'inventory',
            severity: 'warning',
            link: '/admin/inventory',
          });
        }
      }
    }

    db.addNotification({
      title: `Payment Verified: #${order.orderNumber}`,
      message: `MTN MoMo payment of $${order.total.toLocaleString()} confirmed for ${order.customer.fullName}.`,
      type: 'payment',
      severity: 'success',
      link: `/admin/orders/${order.id}`,
    });
  } else if (paymentStatus === 'FAILED' || paymentStatus === 'REJECTED') {
    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'MTN MoMo Gateway',
      event: `Payment attempt failed (${paymentStatus})`,
      notes: 'Customer notified to retry payment',
    });

    db.addNotification({
      title: `Payment Failed: #${order.orderNumber}`,
      message: `Payment attempt of $${order.total.toLocaleString()} by ${order.customer.fullName} failed.`,
      type: 'payment',
      severity: 'error',
      link: `/admin/orders/${order.id}`,
    });
  }

  order.updatedAt = new Date().toISOString();
  db.orders.set(orderId, order);

  if (isDatabaseConnected()) {
    OrderModel.findOneAndUpdate(
      { orderNumber: order.orderNumber },
      {
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentId: order.paymentReferenceId,
        $push: {
          timeline: {
            status: order.orderStatus,
            timestamp: new Date(),
            actor: 'MTN Gateway',
            note: `Payment status updated to ${paymentStatus}`,
          },
        },
      }
    ).catch((err) => console.error('⚠️ [OrderService] MongoDB Order status update failed:', err.message));
  }

  return order;
}

/**
 * Admin controlled order status advancement
 */
export function transitionOrderStatus(
  orderId: string,
  newStatus: OrderWorkflowStatus,
  actor: { name: string; role: string; id: string },
  notes?: string
): { success: boolean; order?: AdminOrder; error?: string } {
  const order = db.orders.get(orderId);
  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  // Allowed transitions
  const ALLOWED_TRANSITIONS: Record<OrderWorkflowStatus, OrderWorkflowStatus[]> = {
    PENDING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
    PROCESSING: ['READY_FOR_DELIVERY', 'CANCELLED', 'REFUNDED'],
    READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'CANCELLED', 'REFUNDED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
    DELIVERED: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: [],
  };

  const allowed = ALLOWED_TRANSITIONS[order.orderStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition order status from "${order.orderStatus}" to "${newStatus}". Allowed transitions: ${allowed.join(', ') || 'None'}.`,
    };
  }

  const oldStatus = order.orderStatus;
  order.orderStatus = newStatus;
  order.updatedAt = new Date().toISOString();

  order.timeline.push({
    id: `t-${Date.now()}`,
    timestamp: order.updatedAt,
    actor: `${actor.name} (${actor.role})`,
    event: `Order status changed from ${oldStatus} to ${newStatus}`,
    status: newStatus,
    notes,
  });

  if (notes) {
    order.staffNotes = notes;
  }

  db.orders.set(orderId, order);

  db.logAudit({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role as any,
    action: 'ORDER_STATUS_UPDATE',
    resource: 'ORDERS',
    resourceId: order.id,
    details: `Transitioned order #${order.orderNumber} from ${oldStatus} to ${newStatus}`,
    beforeState: { orderStatus: oldStatus },
    afterState: { orderStatus: newStatus },
  });

  if (isDatabaseConnected()) {
    OrderModel.findOneAndUpdate(
      { orderNumber: order.orderNumber },
      {
        orderStatus: newStatus,
        notes: notes ? [notes] : undefined,
        $push: {
          timeline: {
            status: newStatus,
            timestamp: new Date(),
            actor: `${actor.name} (${actor.role})`,
            note: notes || `Transitioned from ${oldStatus} to ${newStatus}`,
          },
        },
      }
    ).catch((err) => console.error('⚠️ [OrderService] MongoDB Order transition failed:', err.message));

    AuditLogModel.create({
      id: `audit-${Date.now()}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'ORDER_STATUS_UPDATE',
      resource: 'ORDERS',
      resourceId: order.id,
      details: `Transitioned order #${order.orderNumber} from ${oldStatus} to ${newStatus}`,
      beforeState: { orderStatus: oldStatus },
      afterState: { orderStatus: newStatus },
    }).catch((err) => console.error('⚠️ [OrderService] MongoDB AuditLog create failed:', err.message));
  }

  return { success: true, order };
}

/**
 * Lists all orders
 */
export function listOrders(): AdminOrder[] {
  return Array.from(db.orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
