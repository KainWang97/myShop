export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string; // URL
  shortDescription: string;
  details: string;
  material: string;
  origin: string;
  stock?: number;
}

export interface User {
  email: string;
  name: string;
  orders: Order[];
  role?: 'USER' | 'ADMIN';
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: 'PENDING' | 'REPLIED';
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'BANK_TRANSFER' | 'STORE_PICKUP';

export interface ShippingDetails {
  fullName: string;
  phone: string;
  email: string;
  method: PaymentMethod;
  address?: string; // For Bank Transfer
  city?: string;    // For Bank Transfer
  storeCode?: string; // For Store Pickup
  storeName?: string; // For Store Pickup
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingDetails?: ShippingDetails;
}

export type PageView = 'HOME' | 'COLLECTION' | 'CHECKOUT' | 'ADMIN_DASHBOARD';