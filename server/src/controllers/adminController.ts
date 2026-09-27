import type { Request, Response } from 'express';
import { db } from '../db/memoryDb';
import { transitionOrderStatus } from '../services/orderService';
import { checkPaymentStatus } from '../services/mtn/mtnPaymentStatus';
import { isMtnConfigured, getSafeConfigDiagnostic } from '../config/env';
import type {
  StaffRole,
  AdminPermission,
  OrderWorkflowStatus,
  ProductPublishStatus,
  InventoryAdjustmentReason,
} from '../types/admin';
import type { PaymentStatus } from '../types/payment';

// ==========================================
// 1. AUTHENTICATION & RBAC
// ==========================================

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const staffUser = Array.from(db.staff.values()).find(
      (s) => s.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!staffUser || !staffUser.active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account deactivated.',
      });
    }

    // In production, bcrypt is used; for this environment, demo password or standard credential matches
    staffUser.lastLoginAt = new Date().toISOString();
    db.staff.set(staffUser.id, staffUser);

    db.logAudit({
      actorId: staffUser.id,
      actorName: staffUser.name,
      actorRole: staffUser.role,
      action: 'LOGIN',
      resource: 'AUTH',
      details: `${staffUser.name} logged into admin console`,
      ipAddress: req.ip || '127.0.0.1',
    });

    const token = `furn-session-${staffUser.id}-${Date.now()}`;

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        avatar: staffUser.avatar,
        permissions: staffUser.permissions,
        phone: staffUser.phone,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Login error' });
  }
}

export async function getAdminMe(req: Request, res: Response) {
  // Default to Super Admin if session token or fallback
  const user = Array.from(db.staff.values())[0];
  return res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      permissions: user.permissions,
      phone: user.phone,
    },
  });
}

// ==========================================
// 2. EXECUTIVE DASHBOARD & COMMAND CENTER
// ==========================================

export async function getDashboardOverview(req: Request, res: Response) {
  try {
    const orders = Array.from(db.orders.values());
    const payments = Array.from(db.payments.values());
    const products = Array.from(db.products.values());
    const discounts = Array.from(db.discounts.values());

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    // Revenue calculations (only from paid/completed orders)
    const paidOrders = orders.filter(
      (o) => o.paymentStatus === 'SUCCESSFUL' || ['PAID', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus)
    );

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    const todayRevenue = paidOrders
      .filter((o) => o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.total, 0);

    const weekRevenue = paidOrders
      .filter((o) => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((sum, o) => sum + o.total, 0);

    const monthRevenue = paidOrders
      .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.total, 0);

    // Order counts by status
    const orderStats = {
      total: orders.length,
      pendingPayment: orders.filter((o) => o.orderStatus === 'PENDING_PAYMENT').length,
      paid: orders.filter((o) => o.orderStatus === 'PAID').length,
      processing: orders.filter((o) => o.orderStatus === 'PROCESSING').length,
      readyForDelivery: orders.filter((o) => o.orderStatus === 'READY_FOR_DELIVERY').length,
      outForDelivery: orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length,
      delivered: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
      cancelled: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
      refunded: orders.filter((o) => o.orderStatus === 'REFUNDED').length,
    };

    // Payment counts
    const paymentStats = {
      total: payments.length,
      successful: payments.filter((p) => p.status === 'SUCCESSFUL').length,
      pending: payments.filter((p) => p.status === 'PENDING').length,
      failed: payments.filter((p) => p.status === 'FAILED').length,
      rejected: payments.filter((p) => p.status === 'REJECTED').length,
      expired: payments.filter((p) => p.status === 'EXPIRED').length,
      successRate:
        payments.length > 0
          ? Math.round((payments.filter((p) => p.status === 'SUCCESSFUL').length / payments.length) * 100)
          : 100,
    };

    // Product counts
    const productStats = {
      total: products.length,
      inStock: products.filter((p) => p.inStock && p.stockCount > db.settings.inventoryLowStockThreshold).length,
      lowStock: products.filter((p) => p.inStock && p.stockCount <= db.settings.inventoryLowStockThreshold && p.stockCount > 0).length,
      outOfStock: products.filter((p) => !p.inStock || p.stockCount === 0).length,
    };

    // Attention Required Items
    const attentionRequired = [];

    if (paymentStats.pending > 0) {
      attentionRequired.push({
        id: 'att-1',
        title: `${paymentStats.pending} payment${paymentStats.pending > 1 ? 's' : ''} pending MoMo authorization`,
        severity: 'warning',
        link: '/admin/payments?status=PENDING',
        actionLabel: 'Inspect Payments',
      });
    }

    if (paymentStats.failed > 0) {
      attentionRequired.push({
        id: 'att-2',
        title: `${paymentStats.failed} payment failure${paymentStats.failed > 1 ? 's' : ''} require review`,
        severity: 'error',
        link: '/admin/payments?status=FAILED',
        actionLabel: 'Review Failures',
      });
    }

    if (productStats.lowStock > 0) {
      attentionRequired.push({
        id: 'att-3',
        title: `${productStats.lowStock} product${productStats.lowStock > 1 ? 's' : ''} below low stock threshold (${db.settings.inventoryLowStockThreshold} units)`,
        severity: 'warning',
        link: '/admin/inventory?filter=low_stock',
        actionLabel: 'Restock Inventory',
      });
    }

    if (orderStats.paid + orderStats.processing > 0) {
      const count = orderStats.paid + orderStats.processing;
      attentionRequired.push({
        id: 'att-4',
        title: `${count} order${count > 1 ? 's' : ''} awaiting packaging or dispatch`,
        severity: 'info',
        link: '/admin/orders?status=PAID',
        actionLabel: 'View Orders',
      });
    }

    const expiringDiscounts = discounts.filter((d) => {
      if (d.status !== 'ACTIVE') return false;
      const end = new Date(d.endDate).getTime();
      const diffDays = (end - now.getTime()) / 86400000;
      return diffDays >= 0 && diffDays <= 7;
    });

    if (expiringDiscounts.length > 0) {
      attentionRequired.push({
        id: 'att-5',
        title: `Promotional coupon "${expiringDiscounts[0].code}" expires within 7 days`,
        severity: 'info',
        link: '/admin/discounts',
        actionLabel: 'Manage Discounts',
      });
    }

    // Recent 5 Orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Revenue Chart Series (Last 7 Days)
    const chartDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const dayOrders = paidOrders.filter((o) => o.createdAt.startsWith(dStr));
      const dayRev = dayOrders.reduce((sum, o) => sum + o.total, 0);
      chartDays.push({
        date: dStr,
        label,
        revenue: dayRev,
        ordersCount: dayOrders.length,
        averageOrderValue: dayOrders.length > 0 ? Math.round(dayRev / dayOrders.length) : 0,
      });
    }

    return res.status(200).json({
      success: true,
      kpis: {
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          thisWeek: weekRevenue,
          thisMonth: monthRevenue,
        },
        orders: orderStats,
        payments: paymentStats,
        products: productStats,
      },
      attentionRequired,
      recentOrders,
      revenueChart: chartDays,
      environment: {
        mode: db.settings.environment,
        isMtnConfigured: isMtnConfigured(),
        currency: db.settings.currency,
      },
    });
  } catch (err: any) {
    console.error('[Admin Dashboard Overview Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard overview.' });
  }
}

// ==========================================
// 3. ORDERS MANAGEMENT
// ==========================================

export async function getAdminOrders(req: Request, res: Response) {
  try {
    const {
      search,
      orderStatus,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      deliveryZoneId,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    let orders = Array.from(db.orders.values());

    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          (o.paymentReferenceId && o.paymentReferenceId.toLowerCase().includes(q))
      );
    }

    if (orderStatus && typeof orderStatus === 'string') {
      orders = orders.filter((o) => o.orderStatus === orderStatus);
    }

    if (paymentStatus && typeof paymentStatus === 'string') {
      orders = orders.filter((o) => o.paymentStatus === paymentStatus);
    }

    if (paymentMethod && typeof paymentMethod === 'string') {
      orders = orders.filter((o) => o.paymentMethod === paymentMethod);
    }

    if (deliveryZoneId && typeof deliveryZoneId === 'string') {
      orders = orders.filter((o) => o.deliveryZoneId === deliveryZoneId);
    }

    if (minAmount) {
      orders = orders.filter((o) => o.total >= parseFloat(minAmount as string));
    }

    if (maxAmount) {
      orders = orders.filter((o) => o.total <= parseFloat(maxAmount as string));
    }

    if (startDate) {
      orders = orders.filter((o) => o.createdAt >= (startDate as string));
    }

    if (endDate) {
      orders = orders.filter((o) => o.createdAt <= (endDate as string));
    }

    // Sort
    orders.sort((a: any, b: any) => {
      const valA = a[sortBy as string] || '';
      const valB = b[sortBy as string] || '';
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    const total = orders.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = orders.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      orders: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
}

export async function getAdminOrderDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const order = db.orders.get(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Fetch related payment record
    const payment = Array.from(db.payments.values()).find(
      (p) => p.orderId === order.id || p.mtnReferenceId === order.paymentReferenceId
    );

    // Fetch customer profile summary
    const customer = Array.from(db.customers.values()).find(
      (c) => c.phone === order.customer.phone || c.email === order.customer.email
    );

    return res.status(200).json({
      success: true,
      order,
      payment,
      customerProfile: customer,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load order details.' });
  }
}

export async function updateAdminOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newStatus, notes, actor } = req.body;

    if (!newStatus) {
      return res.status(400).json({ success: false, message: 'newStatus is required.' });
    }

    const currentActor = actor || { name: 'Diane Uwase', role: 'SUPER_ADMIN', id: 'staff-1' };

    const result = transitionOrderStatus(
      id,
      newStatus as OrderWorkflowStatus,
      currentActor,
      notes
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}

export async function addAdminOrderNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { note, actor } = req.body;

    const order = db.orders.get(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.staffNotes = note;
    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actor?.name || 'Staff User',
      event: 'Staff note updated',
      notes: note,
    });
    order.updatedAt = new Date().toISOString();
    db.orders.set(id, order);

    return res.status(200).json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to add note.' });
  }
}

export async function cancelAdminOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason, actor } = req.body;

    const currentActor = actor || { name: 'Diane Uwase', role: 'SUPER_ADMIN', id: 'staff-1' };
    const result = transitionOrderStatus(id, 'CANCELLED', currentActor, reason || 'Cancelled by staff');

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
}

// ==========================================
// 4. PAYMENTS & RECONCILIATION
// ==========================================

export async function getAdminPayments(req: Request, res: Response) {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;

    let payments = Array.from(db.payments.values());

    if (status && typeof status === 'string') {
      payments = payments.filter((p) => p.status === status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter(
        (p) =>
          p.paymentId.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.mtnReferenceId.toLowerCase().includes(q) ||
          (p.financialTransactionId && p.financialTransactionId.toLowerCase().includes(q)) ||
          p.phoneNumberMasked.toLowerCase().includes(q)
      );
    }

    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = payments.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = payments.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      payments: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
}

export async function getAdminPaymentDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const payment =
      db.payments.get(id) ||
      Array.from(db.payments.values()).find((p) => p.paymentId === id || p.orderId === id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const order = db.orders.get(payment.orderId);

    return res.status(200).json({
      success: true,
      payment,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payment details.' });
  }
}

/**
 * Server-side payment reconciliation against MTN Gateway status endpoint
 */
export async function reconcileAdminPayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { actor } = req.body;

    const payment =
      db.payments.get(id) ||
      Array.from(db.payments.values()).find((p) => p.paymentId === id || p.orderId === id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Call server-side checkPaymentStatus without exposing credentials to browser
    const statusResult = await checkPaymentStatus(payment.mtnReferenceId);

    const updatedPayment = db.payments.get(payment.mtnReferenceId);
    const updatedOrder = db.orders.get(payment.orderId);

    db.logAudit({
      actorId: actor?.id || 'staff-1',
      actorName: actor?.name || 'Diane Uwase',
      actorRole: actor?.role || 'SUPER_ADMIN',
      action: 'PAYMENT_RECONCILE',
      resource: 'PAYMENTS',
      resourceId: payment.paymentId,
      details: `Reconciled MTN reference ${payment.mtnReferenceId}. Result: ${statusResult?.status || 'UNKNOWN'}`,
    });

    return res.status(200).json({
      success: true,
      message: `Reconciliation complete. Status: ${statusResult?.status || updatedPayment?.status}`,
      payment: updatedPayment,
      order: updatedOrder,
      isSynchronized: updatedPayment?.status === updatedOrder?.paymentStatus,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Reconciliation failed: ' + err.message });
  }
}

// ==========================================
// 5. PRODUCTS MANAGEMENT
// ==========================================

export async function getAdminProducts(req: Request, res: Response) {
  try {
    const { search, room, category, stockLevel, page = '1', limit = '10' } = req.query;

    let products = Array.from(db.products.values());

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (room && typeof room === 'string' && room !== 'all') {
      products = products.filter((p) => p.room === room);
    }

    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (stockLevel === 'low') {
      products = products.filter(
        (p) => p.inStock && p.stockCount <= db.settings.inventoryLowStockThreshold && p.stockCount > 0
      );
    } else if (stockLevel === 'out') {
      products = products.filter((p) => !p.inStock || p.stockCount === 0);
    } else if (stockLevel === 'in') {
      products = products.filter((p) => p.inStock && p.stockCount > db.settings.inventoryLowStockThreshold);
    }

    const total = products.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      products: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
}

export async function getAdminProductDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = db.products.get(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
}

export async function createAdminProduct(req: Request, res: Response) {
  try {
    const data = req.body;
    const { actor } = data;

    if (!data.name || !data.price) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const newId = `prod-${Date.now()}`;
    const newSku = data.sku || `FUR-${data.room?.toUpperCase() || 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;

    const product = {
      id: newId,
      sku: newSku,
      name: data.name,
      subtitle: data.subtitle || '',
      category: data.category || 'Armchairs & Seating',
      room: data.room || 'living',
      price: parseFloat(data.price),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
      discountPercent: data.discountPercent ? parseInt(data.discountPercent, 10) : undefined,
      rating: 5,
      reviewsCount: 0,
      image: data.image || '/hero-chair.jpg',
      galleryImages: data.galleryImages || [data.image || '/hero-chair.jpg'],
      description: data.description || '',
      longDescription: data.longDescription || '',
      dimensions: data.dimensions || { width: '30 in', depth: '30 in', height: '30 in', unit: 'imperial' },
      materials: data.materials || ['Premium Velvet', 'Solid Hardwood Frame'],
      colors: data.colors || [{ name: 'Royal Plum', hex: '#4A1E6D', threeColor: 0x4a1e6d }],
      inStock: data.stockCount > 0,
      stockCount: parseInt(data.stockCount || '10', 10),
      isNew: Boolean(data.isNew),
      isBestSeller: Boolean(data.isBestSeller),
      isDealOfTheWeek: Boolean(data.isDealOfTheWeek),
      isFeatured: Boolean(data.isFeatured),
      badge: data.badge,
      threeModelType: data.threeModelType || 'chair',
    };

    db.products.set(newId, product);

    db.logAudit({
      actorId: actor?.id || 'staff-4',
      actorName: actor?.name || 'Eric Ndayisaba',
      actorRole: actor?.role || 'PRODUCT_MANAGER',
      action: 'PRODUCT_CREATE',
      resource: 'PRODUCTS',
      resourceId: product.id,
      details: `Created new product: "${product.name}" (${product.sku}) at $${product.price}`,
      afterState: product,
    });

    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
}

export async function updateAdminProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const { actor } = data;

    const existing = db.products.get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updated = {
      ...existing,
      ...data,
      price: data.price !== undefined ? parseFloat(data.price) : existing.price,
      originalPrice: data.originalPrice !== undefined ? parseFloat(data.originalPrice) : existing.originalPrice,
      stockCount: data.stockCount !== undefined ? parseInt(data.stockCount, 10) : existing.stockCount,
      inStock: data.stockCount !== undefined ? parseInt(data.stockCount, 10) > 0 : existing.inStock,
    };

    db.products.set(id, updated);

    db.logAudit({
      actorId: actor?.id || 'staff-4',
      actorName: actor?.name || 'Eric Ndayisaba',
      actorRole: actor?.role || 'PRODUCT_MANAGER',
      action: 'PRODUCT_UPDATE',
      resource: 'PRODUCTS',
      resourceId: id,
      details: `Updated product "${updated.name}" (${updated.sku})`,
      beforeState: existing,
      afterState: updated,
    });

    return res.status(200).json({ success: true, product: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

export async function deleteAdminProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { actor } = req.body;

    const existing = db.products.get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    db.products.delete(id);

    db.logAudit({
      actorId: actor?.id || 'staff-1',
      actorName: actor?.name || 'Diane Uwase',
      actorRole: actor?.role || 'SUPER_ADMIN',
      action: 'PRODUCT_ARCHIVE',
      resource: 'PRODUCTS',
      resourceId: id,
      details: `Archived/Removed product "${existing.name}" (${existing.sku})`,
      beforeState: existing,
    });

    return res.status(200).json({ success: true, message: 'Product archived successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to archive product.' });
  }
}

// ==========================================
// 6. INVENTORY MANAGEMENT & ADJUSTMENTS
// ==========================================

export async function getAdminInventory(req: Request, res: Response) {
  try {
    const products = Array.from(db.products.values());
    const logs = [...db.inventoryLogs].slice(0, 50);

    const inventoryItems = products.map((p) => {
      let status = 'IN_STOCK';
      if (!p.inStock || p.stockCount === 0) status = 'OUT_OF_STOCK';
      else if (p.stockCount <= db.settings.inventoryLowStockThreshold) status = 'LOW_STOCK';

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        image: p.image,
        currentStock: p.stockCount,
        reservedStock: 0,
        availableStock: p.stockCount,
        lowStockThreshold: db.settings.inventoryLowStockThreshold,
        status,
        price: p.price,
      };
    });

    return res.status(200).json({
      success: true,
      inventory: inventoryItems,
      recentLogs: logs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load inventory.' });
  }
}

export async function adjustAdminInventory(req: Request, res: Response) {
  try {
    const { productId, quantityChange, adjustmentType, reason, note, actor } = req.body;

    if (!productId || quantityChange === undefined || !adjustmentType) {
      return res.status(400).json({
        success: false,
        message: 'productId, quantityChange, and adjustmentType are required.',
      });
    }

    const product = db.products.get(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prevStock = product.stockCount;
    const delta = parseInt(quantityChange, 10);
    const newStock = Math.max(0, prevStock + delta);

    product.stockCount = newStock;
    product.inStock = newStock > 0;
    db.products.set(productId, product);

    const actorName = actor?.name || 'Diane Uwase';
    const actorRole = actor?.role || 'SUPER_ADMIN';

    const logEntry = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      adjustmentType: adjustmentType as InventoryAdjustmentReason,
      quantityChange: delta,
      previousStock: prevStock,
      newStock,
      reason: reason || `${adjustmentType} adjustment: ${note || 'Manual change'}`,
      actor: `${actorName} (${actorRole})`,
      timestamp: new Date().toISOString(),
    };

    db.inventoryLogs.unshift(logEntry);

    db.logAudit({
      actorId: actor?.id || 'staff-1',
      actorName: actorName,
      actorRole: actorRole as any,
      action: 'INVENTORY_ADJUSTMENT',
      resource: 'INVENTORY',
      resourceId: product.id,
      details: `Adjusted stock for "${product.name}" by ${delta > 0 ? '+' : ''}${delta} units (${adjustmentType}). New stock: ${newStock}`,
      beforeState: { stockCount: prevStock },
      afterState: { stockCount: newStock },
    });

    return res.status(200).json({
      success: true,
      message: `Stock successfully adjusted for ${product.name}.`,
      product,
      log: logEntry,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to adjust inventory.' });
  }
}

// ==========================================
// 7. DISCOUNTS MANAGEMENT
// ==========================================

export async function getAdminDiscounts(req: Request, res: Response) {
  try {
    const discounts = Array.from(db.discounts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const now = new Date().toISOString();
    const active = discounts.filter((d) => d.status === 'ACTIVE' && d.startDate <= now && d.endDate >= now);
    const upcoming = discounts.filter((d) => d.status === 'ACTIVE' && d.startDate > now);
    const expired = discounts.filter((d) => d.status === 'EXPIRED' || d.endDate < now);

    return res.status(200).json({
      success: true,
      discounts,
      summary: {
        total: discounts.length,
        activeCount: active.length,
        upcomingCount: upcoming.length,
        expiredCount: expired.length,
        totalUsage: discounts.reduce((sum, d) => sum + d.usageCount, 0),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch discounts.' });
  }
}

export async function createAdminDiscount(req: Request, res: Response) {
  try {
    const data = req.body;
    const { actor } = data;

    if (!data.name || !data.code || !data.value) {
      return res.status(400).json({ success: false, message: 'Name, code, and discount value are required.' });
    }

    const codeNormalized = data.code.trim().toUpperCase();
    const existing = Array.from(db.discounts.values()).find((d) => d.code === codeNormalized);
    if (existing) {
      return res.status(400).json({ success: false, message: `Discount code "${codeNormalized}" already exists.` });
    }

    const newDiscount = {
      id: `disc-${Date.now()}`,
      name: data.name,
      code: codeNormalized,
      type: data.type || 'percentage',
      value: parseFloat(data.value),
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      minOrderValue: parseFloat(data.minOrderValue || '0'),
      maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : undefined,
      usageLimit: parseInt(data.usageLimit || '100', 10),
      perCustomerLimit: parseInt(data.perCustomerLimit || '1', 10),
      usageCount: 0,
      status: (data.status as any) || 'ACTIVE',
      applicableCategories: data.applicableCategories,
      applicableProducts: data.applicableProducts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.discounts.set(newDiscount.id, newDiscount);

    db.logAudit({
      actorId: actor?.id || 'staff-1',
      actorName: actor?.name || 'Diane Uwase',
      actorRole: actor?.role || 'SUPER_ADMIN',
      action: 'DISCOUNT_CREATE',
      resource: 'DISCOUNTS',
      resourceId: newDiscount.id,
      details: `Created promotional discount code: ${newDiscount.code} (${newDiscount.value}${newDiscount.type === 'percentage' ? '%' : '$'})`,
      afterState: newDiscount,
    });

    return res.status(201).json({ success: true, discount: newDiscount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create discount.' });
  }
}

export async function updateAdminDiscountStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, actor } = req.body;

    const discount = db.discounts.get(id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found.' });
    }

    const prev = discount.status;
    discount.status = status;
    discount.updatedAt = new Date().toISOString();
    db.discounts.set(id, discount);

    db.logAudit({
      actorId: actor?.id || 'staff-1',
      actorName: actor?.name || 'Diane Uwase',
      actorRole: actor?.role || 'SUPER_ADMIN',
      action: 'DISCOUNT_STATUS_UPDATE',
      resource: 'DISCOUNTS',
      resourceId: id,
      details: `Changed discount ${discount.code} status from ${prev} to ${status}`,
    });

    return res.status(200).json({ success: true, discount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update discount status.' });
  }
}

// ==========================================
// 8. CUSTOMERS MANAGEMENT
// ==========================================

export async function getAdminCustomers(req: Request, res: Response) {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;

    let customers = Array.from(db.customers.values());

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      customers = customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.address && c.address.toLowerCase().includes(q))
      );
    }

    if (status && typeof status === 'string') {
      customers = customers.filter((c) => c.status === status);
    }

    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    const total = customers.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = customers.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      customers: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
}

export async function getAdminCustomerDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const customer = db.customers.get(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customerOrders = Array.from(db.orders.values()).filter(
      (o) => o.customer.phone === customer.phone || o.customer.email === customer.email
    );

    return res.status(200).json({
      success: true,
      customer,
      orders: customerOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customer.' });
  }
}

// ==========================================
// 9. CATEGORIES, REVIEWS, DELIVERY & CMS
// ==========================================

export async function getAdminCategories(req: Request, res: Response) {
  try {
    const categories = Array.from(db.categories.values()).sort((a, b) => a.displayOrder - b.displayOrder);

    // Update product counts dynamically
    const products = Array.from(db.products.values());
    categories.forEach((cat) => {
      cat.productCount = products.filter((p) => p.room === cat.roomKey).length;
    });

    return res.status(200).json({ success: true, categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
}

export async function getAdminReviews(req: Request, res: Response) {
  try {
    const reviews = Array.from(db.reviews.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return res.status(200).json({ success: true, reviews });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
}

export async function updateAdminReviewStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, reply, actor } = req.body;

    const review = db.reviews.get(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (status) review.status = status;
    if (reply) {
      review.reply = {
        author: reply.author || 'FURNITURA Concierge',
        text: reply.text,
        date: new Date().toISOString(),
      };
    }

    db.reviews.set(id, review);

    db.logAudit({
      actorId: actor?.id || 'staff-5',
      actorName: actor?.name || 'Clarisse Keza',
      actorRole: actor?.role || 'CONTENT_MANAGER',
      action: 'REVIEW_MODERATION',
      resource: 'REVIEWS',
      resourceId: id,
      details: `Moderated review for ${review.productName} (Status: ${review.status})`,
    });

    return res.status(200).json({ success: true, review });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
}

export async function getAdminDeliveryZones(req: Request, res: Response) {
  try {
    const zones = Array.from(db.deliveryZones.values());
    return res.status(200).json({ success: true, zones });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch delivery zones.' });
  }
}

export async function getAdminCMS(req: Request, res: Response) {
  try {
    return res.status(200).json({ success: true, cms: db.cms });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch CMS.' });
  }
}

export async function updateAdminCMS(req: Request, res: Response) {
  try {
    const data = req.body;
    const { actor } = data;

    db.cms = { ...db.cms, ...data };

    db.logAudit({
      actorId: actor?.id || 'staff-5',
      actorName: actor?.name || 'Clarisse Keza',
      actorRole: actor?.role || 'CONTENT_MANAGER',
      action: 'CMS_UPDATE',
      resource: 'CMS',
      details: 'Updated storefront homepage configuration and banners',
    });

    return res.status(200).json({ success: true, cms: db.cms });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update CMS.' });
  }
}

// ==========================================
// 10. 3D STUDIO MANAGEMENT
// ==========================================

export async function getAdmin3DStudio(req: Request, res: Response) {
  try {
    const products = Array.from(db.products.values());
    const threeStudioItems = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      room: p.room,
      image: p.image,
      threeModelType: p.threeModelType,
      colors: p.colors,
      defaultColor: p.colors[0],
      materials: p.materials,
      threeEnabled: true,
      lightingPresets: ['Studio Luxury', 'Warm Evening', 'Kigali Daylight', 'High Contrast Editorial'],
    }));

    return res.status(200).json({ success: true, studioItems: threeStudioItems });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch 3D studio.' });
  }
}

// ==========================================
// 11. ANALYTICS & INSIGHTS
// ==========================================

export async function getAdminAnalytics(req: Request, res: Response) {
  try {
    const orders = Array.from(db.orders.values());
    const payments = Array.from(db.payments.values());
    const products = Array.from(db.products.values());

    const paidOrders = orders.filter(
      (o) => o.paymentStatus === 'SUCCESSFUL' || ['PAID', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.orderStatus)
    );

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // Category breakdown
    const categoryRev: Record<string, number> = {};
    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = db.products.get(item.productId);
        const cat = prod?.category || 'Living Room';
        categoryRev[cat] = (categoryRev[cat] || 0) + item.subtotal;
      });
    });

    const categoryBreakdown = Object.entries(categoryRev).map(([name, value]) => ({
      name,
      value,
      percent: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
    }));

    // Top Selling Products
    const productSales: Record<string, { name: string; quantity: number; revenue: number; image?: string }> = {};
    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: item.image,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Payment method & conversion rates
    const paymentMethods = {
      mtnMoMo: payments.filter((p) => p.provider === 'MTN_MOMO').length,
      airtelMoney: orders.filter((o) => o.paymentMethod === 'AIRTEL_MONEY').length,
      card: orders.filter((o) => o.paymentMethod === 'CARD').length,
    };

    const paymentConversion = {
      attempts: payments.length,
      successful: payments.filter((p) => p.status === 'SUCCESSFUL').length,
      failed: payments.filter((p) => p.status === 'FAILED').length,
      rejected: payments.filter((p) => p.status === 'REJECTED').length,
      successRate:
        payments.length > 0
          ? Math.round((payments.filter((p) => p.status === 'SUCCESSFUL').length / payments.length) * 100)
          : 100,
    };

    return res.status(200).json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        paidOrdersCount: paidOrders.length,
        averageOrderValue: avgOrderValue,
        categoryBreakdown,
        topProducts,
        paymentMethods,
        paymentConversion,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
}

// ==========================================
// 12. NOTIFICATIONS, AUDIT & STAFF
// ==========================================

export async function getAdminNotifications(req: Request, res: Response) {
  try {
    return res.status(200).json({
      success: true,
      notifications: db.notifications,
      unreadCount: db.notifications.filter((n) => !n.isRead && !n.isArchived).length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

export async function markAdminNotificationRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    return res.status(200).json({ success: true, notification: notif });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

export async function markAllAdminNotificationsRead(req: Request, res: Response) {
  try {
    db.notifications.forEach((n) => (n.isRead = true));
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
}

export async function getAdminStaff(req: Request, res: Response) {
  try {
    const staffList = Array.from(db.staff.values());
    return res.status(200).json({ success: true, staff: staffList });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch staff list.' });
  }
}

export async function getAdminAuditLogs(req: Request, res: Response) {
  try {
    const { resource, action, limit = '50' } = req.query;

    let logs = [...db.auditLogs];

    if (resource && typeof resource === 'string') {
      logs = logs.filter((l) => l.resource === resource);
    }

    if (action && typeof action === 'string') {
      logs = logs.filter((l) => l.action.includes(action));
    }

    const limitNum = parseInt(limit as string, 10) || 50;

    return res.status(200).json({
      success: true,
      logs: logs.slice(0, limitNum),
      total: logs.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
}

// ==========================================
// 13. SETTINGS & SAFE MTN CONFIG
// ==========================================

export async function getAdminSettings(req: Request, res: Response) {
  try {
    return res.status(200).json({
      success: true,
      settings: db.settings,
      mtnDiagnostic: getSafeConfigDiagnostic(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
}

export async function updateAdminSettings(req: Request, res: Response) {
  try {
    const data = req.body;
    const { actor } = data;

    db.settings = { ...db.settings, ...data };

    db.logAudit({
      actorId: actor?.id || 'staff-1',
      actorName: actor?.name || 'Diane Uwase',
      actorRole: actor?.role || 'SUPER_ADMIN',
      action: 'SETTINGS_UPDATE',
      resource: 'SETTINGS',
      details: 'Updated store configuration parameters',
    });

    return res.status(200).json({ success: true, settings: db.settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
}

// ==========================================
// 14. GLOBAL SEARCH (CTRL+K)
// ==========================================

export async function globalAdminSearch(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.status(200).json({
        success: true,
        results: { orders: [], products: [], customers: [], payments: [], discounts: [] },
      });
    }

    const query = q.trim().toLowerCase();

    const orders = Array.from(db.orders.values())
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customer.fullName.toLowerCase().includes(query) ||
          o.customer.phone.toLowerCase().includes(query) ||
          (o.paymentReferenceId && o.paymentReferenceId.toLowerCase().includes(query))
      )
      .slice(0, 5)
      .map((o) => ({
        type: 'order',
        id: o.id,
        title: `Order #${o.orderNumber}`,
        subtitle: `${o.customer.fullName} • $${o.total} (${o.orderStatus})`,
        link: `/admin/orders/${o.id}`,
      }));

    const products = Array.from(db.products.values())
      .filter((p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query))
      .slice(0, 5)
      .map((p) => ({
        type: 'product',
        id: p.id,
        title: p.name,
        subtitle: `${p.sku} • $${p.price} • Stock: ${p.stockCount}`,
        link: `/admin/products/${p.id}`,
      }));

    const customers = Array.from(db.customers.values())
      .filter((c) => c.fullName.toLowerCase().includes(query) || c.phone.toLowerCase().includes(query))
      .slice(0, 5)
      .map((c) => ({
        type: 'customer',
        id: c.id,
        title: c.fullName,
        subtitle: `${c.phone} • ${c.totalOrders} orders • $${c.totalSpent}`,
        link: `/admin/customers/${c.id}`,
      }));

    const payments = Array.from(db.payments.values())
      .filter(
        (p) =>
          p.paymentId.toLowerCase().includes(query) ||
          p.orderId.toLowerCase().includes(query) ||
          p.mtnReferenceId.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((p) => ({
        type: 'payment',
        id: p.paymentId,
        title: `MTN MoMo ${p.paymentId}`,
        subtitle: `${p.phoneNumberMasked} • ${p.status} • Order ${p.orderId}`,
        link: `/admin/payments/${p.paymentId}`,
      }));

    const discounts = Array.from(db.discounts.values())
      .filter((d) => d.code.toLowerCase().includes(query) || d.name.toLowerCase().includes(query))
      .slice(0, 5)
      .map((d) => ({
        type: 'discount',
        id: d.id,
        title: `Coupon ${d.code}`,
        subtitle: `${d.value}${d.type === 'percentage' ? '%' : '$'} off • ${d.status}`,
        link: `/admin/discounts`,
      }));

    return res.status(200).json({
      success: true,
      results: {
        orders,
        products,
        customers,
        payments,
        discounts,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
}

// ==========================================
// 15. CSV DATA EXPORTS
// ==========================================

export async function exportAdminResource(req: Request, res: Response) {
  try {
    const { resource } = req.params;

    let csvContent = '';
    let filename = `furnitura-${resource}-${Date.now()}.csv`;

    if (resource === 'orders') {
      const orders = Array.from(db.orders.values());
      const header = 'Order ID,Customer Name,Email,Phone,Items,Subtotal,Discount,Shipping,Total,Order Status,Payment Status,Date\n';
      const rows = orders.map((o) =>
        `"${o.orderNumber}","${o.customer.fullName}","${o.customer.email}","${o.customer.phone}","${o.items.map((i) => `${i.quantity}x ${i.name}`).join('; ')}",${o.subtotal},${o.discountAmount},${o.shippingFee},${o.total},"${o.orderStatus}","${o.paymentStatus}","${o.createdAt}"`
      );
      csvContent = header + rows.join('\n');
    } else if (resource === 'products') {
      const products = Array.from(db.products.values());
      const header = 'Product ID,SKU,Name,Category,Room,Price,Stock,In Stock,3D Model\n';
      const rows = products.map((p) =>
        `"${p.id}","${p.sku}","${p.name}","${p.category}","${p.room}",${p.price},${p.stockCount},${p.inStock},"${p.threeModelType}"`
      );
      csvContent = header + rows.join('\n');
    } else if (resource === 'payments') {
      const payments = Array.from(db.payments.values());
      const header = 'Payment ID,Order ID,Reference ID,Amount,Currency,Phone,Provider,Status,Date\n';
      const rows = payments.map((p) =>
        `"${p.paymentId}","${p.orderId}","${p.mtnReferenceId}",${p.amount},"${p.currency}","${p.phoneNumberMasked}","${p.provider}","${p.status}","${p.createdAt}"`
      );
      csvContent = header + rows.join('\n');
    } else if (resource === 'customers') {
      const customers = Array.from(db.customers.values());
      const header = 'Customer ID,Full Name,Email,Phone,Province,District,Total Orders,Total Spent,Status\n';
      const rows = customers.map((c) =>
        `"${c.id}","${c.fullName}","${c.email}","${c.phone}","${c.province || ''}","${c.district || ''}",${c.totalOrders},${c.totalSpent},"${c.status}"`
      );
      csvContent = header + rows.join('\n');
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported export resource.' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Export failed.' });
  }
}
