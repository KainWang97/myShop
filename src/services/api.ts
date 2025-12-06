/**
 * API Service Layer
 * 此模組集中管理所有與後端 API 的通訊
 * 目前使用 mock 資料模擬，未來只需替換 fetch 呼叫即可串接真實 API
 */

import type {
  Product,
  Order,
  Inquiry,
  ShippingDetails,
  OrderStatus,
} from "../types";
import { PRODUCTS, CATEGORIES } from "../constants";

// ============================================
// 模擬網路延遲 (未來移除)
// ============================================
const simulateDelay = (ms: number = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// 模擬資料儲存 (未來由後端資料庫取代)
// ============================================
let mockProducts: Product[] = [...PRODUCTS];
let mockOrders: Order[] = [];
let mockInquiries: Inquiry[] = [];

// ============================================
// API 基底 URL (未來從環境變數讀取)
// ============================================
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// ============================================
// Product API
// ============================================
export const productApi = {
  /**
   * 取得所有商品
   * GET /api/products
   */
  async getAll(): Promise<Product[]> {
    await simulateDelay(500);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/products`);
    // return response.json();
    return [...mockProducts];
  },

  /**
   * 取得單一商品
   * GET /api/products/:id
   */
  async getById(id: string): Promise<Product | undefined> {
    await simulateDelay(200);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/products/${id}`);
    // return response.json();
    return mockProducts.find((p) => p.id === id);
  },

  /**
   * 取得所有分類
   * GET /api/categories
   */
  async getCategories(): Promise<string[]> {
    await simulateDelay(200);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/categories`);
    // return response.json();
    return [...CATEGORIES];
  },

  /**
   * 更新商品庫存 (Admin)
   * PATCH /api/products/:id/stock
   */
  async updateStock(id: string, newStock: number): Promise<boolean> {
    await simulateDelay(300);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ stock: newStock })
    // });
    // return response.ok;
    const product = mockProducts.find((p) => p.id === id);
    if (product) {
      product.stock = Math.max(0, newStock);
      return true;
    }
    return false;
  },

  /**
   * 新增商品 (Admin)
   * POST /api/products
   */
  async create(data: Omit<Product, "id">): Promise<Product> {
    await simulateDelay(500);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/products`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.json();
    const newProduct: Product = {
      id: Date.now().toString(),
      ...data,
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  /**
   * 更新商品 (Admin)
   * PUT /api/products/:id
   */
  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    await simulateDelay(400);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.json();
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...data };
      return mockProducts[index];
    }
    return null;
  },

  /**
   * 刪除商品 (Admin)
   * DELETE /api/products/:id
   */
  async delete(id: string): Promise<boolean> {
    await simulateDelay(300);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    //   method: 'DELETE'
    // });
    // return response.ok;
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return true;
    }
    return false;
  },

  /**
   * 上傳商品圖片 (模擬後端 → Cloudinary 流程)
   * POST /api/upload/image
   * @param file - 本地檔案
   * @returns 圖片 URL
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    // 模擬上傳延遲 (1.5-3秒)
    await simulateDelay(1500 + Math.random() * 1500);

    // 模擬 10% 失敗機率 (用於測試錯誤處理)
    if (Math.random() < 0.1) {
      throw new Error("Upload failed: Network error");
    }

    // 未來替換成:
    // const formData = new FormData();
    // formData.append('image', file);
    // const response = await fetch(`${API_BASE_URL}/upload/image`, {
    //   method: 'POST',
    //   body: formData
    // });
    // return response.json();

    // 模擬回傳 Cloudinary URL (使用 picsum 模擬)
    const fakeUrl = `https://picsum.photos/seed/${Date.now()}/800/800`;
    return { url: fakeUrl };
  },
};

// ============================================
// Order API
// ============================================
export const orderApi = {
  /**
   * 取得所有訂單 (Admin)
   * GET /api/orders
   */
  async getAll(): Promise<Order[]> {
    await simulateDelay(400);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/orders`);
    // return response.json();
    return [...mockOrders];
  },

  /**
   * 建立新訂單
   * POST /api/orders
   */
  async create(orderData: {
    items: { productId: string; quantity: number }[];
    shippingDetails: ShippingDetails;
  }): Promise<Order> {
    await simulateDelay(800);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/orders`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData)
    // });
    // return response.json();

    // 模擬建立訂單
    const orderItems = orderData.items.map((item) => {
      const product = mockProducts.find((p) => p.id === item.productId);
      return {
        ...product!,
        quantity: item.quantity,
      };
    });

    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      date: new Date().toLocaleDateString(),
      items: orderItems,
      total: orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      status: "Processing",
      shippingDetails: orderData.shippingDetails,
    };

    // 扣除庫存
    orderData.items.forEach((item) => {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (product && product.stock !== undefined) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });

    mockOrders.unshift(newOrder);
    return newOrder;
  },

  /**
   * 更新訂單狀態 (Admin)
   * PATCH /api/orders/:id/status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<boolean> {
    await simulateDelay(300);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status })
    // });
    // return response.ok;
    const order = mockOrders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      return true;
    }
    return false;
  },

  /**
   * 更新訂單付款備註 (User)
   * PATCH /api/orders/:id/payment-note
   */
  async updatePaymentNote(id: string, note: string): Promise<boolean> {
    await simulateDelay(300);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/orders/${id}/payment-note`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ paymentNote: note })
    // });
    // return response.ok;
    const order = mockOrders.find((o) => o.id === id);
    if (order) {
      order.paymentNote = note;
      return true;
    }
    return false;
  },
};

// ============================================
// Inquiry API
// ============================================
export const inquiryApi = {
  /**
   * 取得所有詢問 (Admin)
   * GET /api/inquiries
   */
  async getAll(): Promise<Inquiry[]> {
    await simulateDelay(300);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/inquiries`);
    // return response.json();
    return [...mockInquiries];
  },

  /**
   * 送出聯絡詢問
   * POST /api/inquiries
   */
  async create(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<Inquiry> {
    await simulateDelay(500);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/inquiries`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return response.json();
    const newInquiry: Inquiry = {
      id: Date.now().toString(),
      ...data,
      date: new Date().toLocaleDateString(),
      status: "PENDING",
    };
    mockInquiries.unshift(newInquiry);
    return newInquiry;
  },

  /**
   * 標記已回覆 (Admin)
   * PATCH /api/inquiries/:id/reply
   */
  async markAsReplied(id: string): Promise<boolean> {
    await simulateDelay(200);
    // 未來替換成:
    // const response = await fetch(`${API_BASE_URL}/inquiries/${id}/reply`, {
    //   method: 'PATCH'
    // });
    // return response.ok;
    const inquiry = mockInquiries.find((i) => i.id === id);
    if (inquiry) {
      inquiry.status = "REPLIED";
      return true;
    }
    return false;
  },
};

// ============================================
// 統一匯出
// ============================================
export const api = {
  products: productApi,
  orders: orderApi,
  inquiries: inquiryApi,
};

export default api;
