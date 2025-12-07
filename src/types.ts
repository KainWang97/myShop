// ============================================
// Product & Variant (對應 SQL: products, product_variants)
// ============================================
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isListed: boolean;
  createdAt?: string;
  variants?: ProductVariant[];
  totalStock?: number; // 計算屬性：所有規格庫存總和
  // 為了向下相容，保留 category 作為顯示用 (由 API 填入)
  category?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  skuCode: string;
  color: string;
  size: string;
  stock: number;
  createdAt?: string;
}

// ============================================
// Category (對應 SQL: categories)
// ============================================
export interface Category {
  id: string;
  name: string; // 限英文
  description?: string;
  createdAt?: string;
}

// ============================================
// User (對應 SQL: users)
// ============================================
export interface User {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  role?: "MEMBER" | "ADMIN";
  orders: Order[];
}

// ============================================
// Inquiry (對應 SQL: contact_messages)
// ============================================
export interface Inquiry {
  id: string;
  userId?: string;
  name: string;
  email: string;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED";
  createdAt?: string;
  repliedAt?: string;
  // 為了向下相容
  date?: string;
}

// ============================================
// Cart (前端狀態，對應 SQL: cart_items)
// ============================================
export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

// ============================================
// Order (對應 SQL: orders, order_items)
// ============================================
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "BANK_TRANSFER" | "STORE_PICKUP";

export interface ShippingDetails {
  fullName: string;
  phone: string;
  email: string;
  method: PaymentMethod;
  address?: string;
  city?: string;
  storeCode?: string;
  storeName?: string;
}

export interface OrderItem {
  variant: ProductVariant;
  product: Product;
  price: number; // 購買當下的單價
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  shippingDetails?: ShippingDetails;
  paymentNote?: string;
  createdAt?: string;
  // 為了向下相容
  date?: string;
}

// ============================================
// Page Navigation
// ============================================
export type PageView =
  | "HOME"
  | "COLLECTION"
  | "PRODUCT_DETAIL"
  | "CONTACT"
  | "CHECKOUT"
  | "ADMIN_DASHBOARD";
