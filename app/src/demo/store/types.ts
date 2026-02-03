// E-commerce Demo Types

export interface Store {
  name: string;
  currency: string;
  taxRate: number;
  isSetupComplete: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  category: string;
  tags: string[];
  variants: ProductVariant[];
  images: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  inventory: number;
  options: Record<string, string>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnItem {
  orderItemId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  reason: string;
}

export type ReturnStatus = 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';

export interface Return {
  id: string;
  orderId: string;
  orderNumber: string;
  items: ReturnItem[];
  status: ReturnStatus;
  refundAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  minOrderValue?: number;
  maxOrderValue?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  enabled: boolean;
}

export interface StoreSettings {
  store: Store;
  shippingZones: ShippingZone[];
  paymentMethods: PaymentMethod[];
}
