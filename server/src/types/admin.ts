export type StaffRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ORDER_MANAGER'
  | 'PRODUCT_MANAGER'
  | 'FINANCE_MANAGER'
  | 'CONTENT_MANAGER'
  | 'SUPPORT_AGENT';

export type AdminPermission =
  | 'orders:read'
  | 'orders:write'
  | 'payments:read'
  | 'payments:write'
  | 'products:read'
  | 'products:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'discounts:read'
  | 'discounts:write'
  | 'customers:read'
  | 'customers:write'
  | 'categories:read'
  | 'categories:write'
  | 'reviews:read'
  | 'reviews:write'
  | 'delivery:read'
  | 'delivery:write'
  | 'cms:read'
  | 'cms:write'
  | '3d:read'
  | '3d:write'
  | 'analytics:read'
  | 'notifications:read'
  | 'staff:read'
  | 'staff:write'
  | 'settings:read'
  | 'settings:write'
  | 'audit:read'
  | 'mtn:test';

export type OrderWorkflowStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentRecordStatus =
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'UNKNOWN';

export type ProductPublishStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'OUT_OF_STOCK'
  | 'ARCHIVED';

export type InventoryAdjustmentReason =
  | 'RESTOCK'
  | 'SALE'
  | 'DAMAGE'
  | 'RETURN'
  | 'MANUAL_ADJUSTMENT';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
  permissions: AdminPermission[];
  active: boolean;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: StaffRole;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'inventory' | 'customer' | 'review' | 'system' | 'discount';
  severity: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  perCustomerLimit: number;
  usageCount: number;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'ARCHIVED';
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  roomKey: string;
  displayOrder: number;
  active: boolean;
  seoTitle?: string;
  seoDescription?: string;
  productCount: number;
}

export interface ReviewItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'FLAGGED';
  verifiedBuyer: boolean;
  reply?: {
    author: string;
    text: string;
    date: string;
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  region: string;
  districts: string[];
  fee: number;
  currency: string;
  estimatedDays: string;
  freeShippingThreshold: number;
  active: boolean;
  whiteGloveAvailable: boolean;
  whiteGloveFee: number;
  description: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  province?: string;
  district?: string;
  sector?: string;
  address: string;
  notes?: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'ACTIVE' | 'VIP' | 'BLOCKED';
  createdAt: string;
}

export interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  status?: OrderWorkflowStatus;
  notes?: string;
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  colorName?: string;
  image?: string;
  discountAmount?: number;
  subtotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  items: AdminOrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  whiteGloveFee?: number;
  total: number;
  currency: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    province?: string;
    district?: string;
    sector?: string;
    address: string;
    notes?: string;
  };
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  orderStatus: OrderWorkflowStatus;
  paymentMethod: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD' | 'CASH';
  paymentStatus: PaymentRecordStatus;
  paymentReferenceId?: string;
  paymentId?: string;
  financialTransactionId?: string;
  timeline: OrderTimelineEvent[];
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLogItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  adjustmentType: InventoryAdjustmentReason;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  actor: string;
  timestamp: string;
}

export interface CMSConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroPrimaryCtaText: string;
  heroSecondaryCtaText: string;
  announcementText: string;
  announcementActive: boolean;
  dealOfTheWeekProductId: string;
  dealCountdownEndDate: string;
  featuredProductIds: string[];
  promoBanners: Array<{
    id: string;
    tag: string;
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    roomFilter: string;
    discountText?: string;
    active: boolean;
  }>;
}

export interface StoreSettings {
  storeName: string;
  legalEntityName: string;
  supportEmail: string;
  supportPhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  whiteGloveFee: number;
  inventoryLowStockThreshold: number;
  orderPrefix: string;
  environment: 'sandbox' | 'production';
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  requirePhoneVerification: boolean;
}
