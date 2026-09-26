export type RoomType = 'all' | 'living' | 'bedroom' | 'dining' | 'office' | 'storage' | 'outdoor';

export interface ColorOption {
  name: string;
  hex: string;
  threeColor: number;
}

export interface Dimensions {
  width: string;
  depth: string;
  height: string;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  category: string;
  room: RoomType;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  galleryImages: string[];
  description: string;
  longDescription?: string;
  dimensions: Dimensions;
  materials: string[];
  colors: ColorOption[];
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isDealOfTheWeek?: boolean;
  isFeatured?: boolean;
  badge?: string;
  sku: string;
  threeModelType: 'sofa' | 'chair' | 'table' | 'bed' | 'sideboard' | 'desk' | 'shelf' | 'lamp';
}

export interface Category {
  id: string;
  name: string;
  count: number;
  image: string;
  roomKey: RoomType;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: ColorOption;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface FilterState {
  room: RoomType;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'discount';
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
}

export interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  linkRoom: RoomType;
  buttonText: string;
  theme: 'plum' | 'dark-plum' | 'deep-violet';
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  province?: string;
  district?: string;
  sector?: string;
  address: string;
  city?: string;
  country?: string;
  paymentMethod: 'momo' | 'card' | 'airtel' | 'cash';
  notes?: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface PaymentDiagnostic {
  environment: string;
  isConfigured: boolean;
  missingKeys: string[];
  mtnCurrency: string;
  storeCurrency: string;
  baseUrl: string;
  hasCallbackUrl: boolean;
  callbackUrl: string;
  mode: 'LIVE_SANDBOX' | 'SIMULATED_SANDBOX_DEV';
}

export interface PaymentTransactionRecord {
  paymentId: string;
  orderId: string;
  externalId: string;
  mtnReferenceId: string;
  amount: number;
  currency: string;
  phoneNumberMasked: string;
  provider: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
  itemsSummary: string;
  financialTransactionId?: string;
}

export interface DirectBuyItem {
  product: Product;
  quantity: number;
  selectedColor: ColorOption;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  customer: CustomerDetails;
  createdAt: string;
  status: 'confirmed' | 'processing' | 'shipped';
}
