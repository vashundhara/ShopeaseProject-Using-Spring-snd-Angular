export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customerId: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderRequest {
  customerId: number;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  paymentDetails?: any;
} 