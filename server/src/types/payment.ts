export type PaymentStatus = 
  | 'PENDING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'UNKNOWN';

export type PaymentProvider = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD' | 'CASH';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  colorName?: string;
  image?: string;
}

export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
  province?: string;
  district?: string;
  sector?: string;
  address: string;
  notes?: string;
}

export interface ServerOrder {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  currency: string;
  customer: CustomerData;
  paymentMethod: PaymentProvider;
  paymentStatus: PaymentStatus;
  paymentReferenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id?: string;
  paymentId: string;
  orderId: string;
  externalId: string;
  mtnReferenceId: string;
  amount: number;
  currency: string;
  phoneNumberMasked: string;
  rawPhoneNumber?: string;
  provider: 'MTN_MOMO';
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
  payerMessage?: string;
  itemsSummary: string;
  financialTransactionId?: string;
}

export interface MtnTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MtnRequestToPayPayload {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: 'MSISDN';
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

export interface MtnStatusResponse {
  amount?: string;
  currency?: string;
  financialTransactionId?: string;
  externalId?: string;
  payer?: {
    partyIdType: string;
    partyId: string;
  };
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REJECTED' | 'EXPIRED';
  reason?: {
    code: string;
    message: string;
  };
}
