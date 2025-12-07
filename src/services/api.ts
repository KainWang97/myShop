/**
 * API Service Layer
 * 此模組集中管理所有與後端 API 的通訊
 * 目前使用 mock 資料模擬，未來只需替換 fetch 呼叫即可串接真實 API
 */

import type {
  Product,
  ProductVariant,
  Order,
  OrderItem,
  Inquiry,
  ShippingDetails,
  OrderStatus,
  Category,
  CartItem,
  User,
} from "../types";
import {
  PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_VARIANTS,
  MOCK_USERS,
} from "../constants";

// ============================================
// 模擬網路延遲 (未來移除)
// ============================================
const simulateDelay = (ms: number = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// 模擬資料儲存 (未來由後端資料庫取代)
// ============================================
let mockProducts: Product[] = [...PRODUCTS];
let mockVariants: ProductVariant[] = [...MOCK_VARIANTS];
let mockCategories: Category[] = [...MOCK_CATEGORIES];
let mockOrders: Order[] = [];
let mockInquiries: Inquiry[] = [];

// SKU 流水號計數器 (模擬)
let skuCounter = 100;

// ============================================
// Helper: 產生 SKU 編碼
// 格式: {分類縮寫}{顏色首兩字母}-{尺寸}-{流水號}
// ============================================
const generateSku = (
  categoryName: string,
  color: string,
  size: string
): string => {
  const categoryPrefix = categoryName.substring(0, 2).toUpperCase();
  const colorPrefix = color.substring(0, 2).toUpperCase();
  const sizeCode = size.toUpperCase();
  skuCounter++;
  return `${categoryPrefix}${colorPrefix}-${sizeCode}-${String(
    skuCounter
  ).padStart(3, "0")}`;
};

// ============================================
// Helper: 計算商品總庫存
// ============================================
const calculateTotalStock = (productId: string): number => {
  return mockVariants
    .filter((v) => v.productId === productId)
    .reduce((sum, v) => sum + v.stock, 0);
};

// ============================================
// Helper: 更新商品的 variants 和 totalStock
// ============================================
const refreshProductVariants = (productId: string) => {
  const product = mockProducts.find((p) => p.id === productId);
  if (product) {
    product.variants = mockVariants.filter((v) => v.productId === productId);
    product.totalStock = calculateTotalStock(productId);
  }
};

// ============================================
// Product API
// ============================================
export const productApi = {
  /**
   * 取得所有商品 (含 variants)
   * GET /api/products
   */
  async getAll(): Promise<Product[]> {
    await simulateDelay(500);
    // 確保每個商品都有最新的 variants 和 totalStock
    return mockProducts.map((p) => ({
      ...p,
      variants: mockVariants.filter((v) => v.productId === p.id),
      totalStock: calculateTotalStock(p.id),
    }));
  },

  /**
   * 取得單一商品 (含 variants)
   * GET /api/products/:id
   */
  async getById(id: string): Promise<Product | undefined> {
    await simulateDelay(200);
    const product = mockProducts.find((p) => p.id === id);
    if (product) {
      return {
        ...product,
        variants: mockVariants.filter((v) => v.productId === id),
        totalStock: calculateTotalStock(id),
      };
    }
    return undefined;
  },

  /**
   * 新增商品 (Admin)
   * POST /api/products
   * 預設 isListed: false, 無規格
   */
  async create(
    data: Omit<Product, "id" | "variants" | "totalStock">
  ): Promise<Product> {
    await simulateDelay(500);
    const newProduct: Product = {
      id: Date.now().toString(),
      ...data,
      isListed: false, // 預設未上架
      variants: [],
      totalStock: 0,
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
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...data };
      refreshProductVariants(id);
      return mockProducts[index];
    }
    return null;
  },

  /**
   * 刪除商品 (Admin) - 會連帶刪除所有規格
   * DELETE /api/products/:id
   */
  async delete(id: string): Promise<boolean> {
    await simulateDelay(300);
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      // 刪除所有關聯的 variants
      mockVariants = mockVariants.filter((v) => v.productId !== id);
      return true;
    }
    return false;
  },

  /**
   * 上傳商品圖片
   * POST /api/upload/image
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    await simulateDelay(1500 + Math.random() * 1500);
    if (Math.random() < 0.1) {
      throw new Error("Upload failed: Network error");
    }
    const fakeUrl = `https://picsum.photos/seed/${Date.now()}/800/800`;
    return { url: fakeUrl };
  },
};

// ============================================
// Variant API (新增)
// ============================================
export const variantApi = {
  /**
   * 取得商品所有規格
   * GET /api/products/:productId/variants
   */
  async getByProductId(productId: string): Promise<ProductVariant[]> {
    await simulateDelay(200);
    return mockVariants.filter((v) => v.productId === productId);
  },

  /**
   * 新增規格 (SKU 自動產生)
   * POST /api/products/:productId/variants
   */
  async create(
    productId: string,
    data: { color: string; size: string; stock: number }
  ): Promise<ProductVariant> {
    await simulateDelay(400);

    const product = mockProducts.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found");

    const category = mockCategories.find((c) => c.id === product.categoryId);
    const categoryName = category?.name || "UN";

    const skuCode = generateSku(categoryName, data.color, data.size);

    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      productId,
      skuCode,
      color: data.color,
      size: data.size,
      stock: data.stock,
      createdAt: new Date().toISOString(),
    };

    mockVariants.push(newVariant);
    refreshProductVariants(productId);
    return newVariant;
  },

  /**
   * 更新規格 (含庫存)
   * PUT /api/variants/:id
   */
  async update(
    id: string,
    data: Partial<ProductVariant>
  ): Promise<ProductVariant | null> {
    await simulateDelay(300);
    const index = mockVariants.findIndex((v) => v.id === id);
    if (index !== -1) {
      mockVariants[index] = { ...mockVariants[index], ...data };
      refreshProductVariants(mockVariants[index].productId);
      return mockVariants[index];
    }
    return null;
  },

  /**
   * 刪除規格
   * DELETE /api/variants/:id
   */
  async delete(id: string): Promise<boolean> {
    await simulateDelay(300);
    const index = mockVariants.findIndex((v) => v.id === id);
    if (index !== -1) {
      const productId = mockVariants[index].productId;
      mockVariants.splice(index, 1);
      refreshProductVariants(productId);
      return true;
    }
    return false;
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
    return [...mockOrders];
  },

  /**
   * 建立新訂單
   * POST /api/orders
   */
  async create(orderData: {
    items: CartItem[];
    shippingDetails: ShippingDetails;
  }): Promise<Order> {
    await simulateDelay(800);

    // 建立訂單項目
    const orderItems: OrderItem[] = orderData.items.map((item) => ({
      product: item.product,
      variant: item.variant,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      items: orderItems,
      total: orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      status: "PENDING",
      shippingDetails: orderData.shippingDetails,
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    };

    // 扣除庫存
    orderData.items.forEach((item) => {
      const variant = mockVariants.find((v) => v.id === item.variant.id);
      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
        refreshProductVariants(variant.productId);
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
    const newInquiry: Inquiry = {
      id: Date.now().toString(),
      ...data,
      status: "UNREAD",
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
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
    const inquiry = mockInquiries.find((i) => i.id === id);
    if (inquiry) {
      inquiry.status = "REPLIED";
      inquiry.repliedAt = new Date().toISOString();
      return true;
    }
    return false;
  },
};

// ============================================
// Auth API
// ============================================
export const authApi = {
  /**
   * 使用者登入
   * POST /api/auth/login
   */
  async login(data: { email: string; password: string }): Promise<User> {
    await simulateDelay(500);

    // 模擬後端驗證邏輯
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (!user || user.password !== data.password) {
      throw new Error("Invalid credentials");
    }

    // 回傳不包含密碼的 User 物件
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      orders: [], // 模擬從 DB 載入訂單
    };
  },

  /**
   * 註冊新會員
   * POST /api/auth/register
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    await simulateDelay(800);

    // 模擬後端檢查 Email 是否存在
    const existingUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // 模擬建立新用戶
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: "MEMBER",
      orders: [],
    };

    // 注意：在 Mock 模式下，新註冊用戶無法持久化到 MOCK_USERS 常數中
    // 這裡只回傳成功建立的用戶物件
    return newUser;
  },
};

// ============================================
// Category API
// ============================================
export const categoryApi = {
  /**
   * 取得所有分類
   * GET /api/categories
   */
  async getAll(): Promise<Category[]> {
    await simulateDelay(300);
    return [...mockCategories];
  },

  /**
   * 新增分類 (Admin)
   * POST /api/categories
   * 注意：名稱限英文
   */
  async create(data: Omit<Category, "id">): Promise<Category> {
    await simulateDelay(500);
    // 驗證英文
    if (!/^[A-Za-z\s]+$/.test(data.name)) {
      throw new Error("Category name must be in English only");
    }
    const newCategory: Category = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  /**
   * 更新分類 (Admin)
   * PUT /api/categories/:id
   */
  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    await simulateDelay(400);
    // 驗證英文
    if (data.name && !/^[A-Za-z\s]+$/.test(data.name)) {
      throw new Error("Category name must be in English only");
    }
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockCategories[index] = { ...mockCategories[index], ...data };
      return mockCategories[index];
    }
    return null;
  },

  /**
   * 刪除分類 (Admin)
   * DELETE /api/categories/:id
   */
  async delete(id: string): Promise<boolean> {
    await simulateDelay(300);
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
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
  variants: variantApi,
  orders: orderApi,
  inquiries: inquiryApi,
  categories: categoryApi,
  auth: authApi,
};

export default api;
