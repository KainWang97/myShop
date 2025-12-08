/**
 * API Service Layer
 * 與後端 API 通訊的統一介面
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
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  setToken,
  removeToken,
} from "../utils/apiClient";

// ============================================
// 資料轉換函數：後端格式 -> 前端格式
// ============================================

/**
 * 後端 ProductDTO 格式
 */
interface BackendProduct {
  id: number; // DTO 使用 id 而非 productId
  categoryId?: number;
  category?: string; // DTO 使用字串而非物件
  name: string;
  description?: string;
  price: number;
  image?: string; // DTO 使用 image 而非 imageUrl
  isListed?: boolean;
  stock?: number; // DTO 提供總庫存
  createdAt?: string;
  // 注意：DTO 不包含 variants，需要額外 API 呼叫取得
}

/**
 * 後端 ProductVariant 格式
 */
interface BackendProductVariant {
  id: number; // DTO 使用 id
  productId: number;
  skuCode: string;
  color: string;
  size: string;
  stock: number;
  createdAt?: string;
}

/**
 * 轉換後端 ProductDTO 為前端格式
 * 注意：DTO 不包含 variants，需要額外 API 呼叫
 */
function transformProduct(backend: BackendProduct): Product {
  return {
    id: String(backend.id),
    categoryId: String(backend.categoryId || ""),
    name: backend.name,
    description: backend.description || "",
    price: Number(backend.price),
    imageUrl: backend.image || "", // DTO 使用 image
    isListed: backend.isListed ?? true,
    createdAt: backend.createdAt,
    variants: [], // 需要額外呼叫 getVariants
    totalStock: backend.stock || 0, // DTO 提供總庫存
    category: backend.category,
  };
}

/**
 * 轉換後端 ProductVariant 為前端格式
 */
function transformVariant(backend: BackendProductVariant): ProductVariant {
  return {
    id: String(backend.id),
    productId: String(backend.productId),
    skuCode: backend.skuCode,
    color: backend.color,
    size: backend.size,
    stock: backend.stock,
    createdAt: backend.createdAt,
  };
}

/**
 * 後端 CategoryDTO 格式
 */
interface BackendCategory {
  id: number; // DTO 使用 id
  name: string;
  description?: string;
  createdAt?: string;
}

/**
 * 轉換後端 CategoryDTO 為前端格式
 */
function transformCategory(backend: BackendCategory): Category {
  return {
    id: String(backend.id),
    name: backend.name,
    description: backend.description,
    createdAt: backend.createdAt,
  };
}

/**
 * 後端 OrderDTO 格式
 */
interface BackendOrder {
  id: number; // DTO 使用 id
  userId?: number;
  total: number; // DTO 使用 total
  status: string;
  paymentMethod?: string;
  shippingMethod?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  paymentNote?: string;
  createdAt?: string;
  items?: BackendOrderItem[];
}

/**
 * 後端 OrderItemDTO 格式
 */
interface BackendOrderItem {
  id: number;
  variantId: number;
  skuCode?: string;
  productName?: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  subtotal?: number;
}

/**
 * 轉換後端 OrderDTO 為前端格式
 */
async function transformOrder(backend: BackendOrder): Promise<Order> {
  // 轉換 orderItems
  const items: OrderItem[] = [];
  if (backend.items) {
    for (const item of backend.items) {
      // 需要取得完整的 variant 和 product 資訊
      // 暫時使用 DTO 提供的資訊
      const variant: ProductVariant = {
        id: String(item.variantId),
        productId: "", // 需要從 product API 取得
        skuCode: item.skuCode || "",
        color: item.color || "",
        size: item.size || "",
        stock: 0,
      };

      items.push({
        variant,
        product: {
          id: "",
          categoryId: "",
          name: item.productName || "",
          description: "",
          price: Number(item.price),
          imageUrl: "",
          isListed: true,
        },
        price: Number(item.price),
        quantity: item.quantity,
      });
    }
  }

  return {
    id: String(backend.id),
    userId: backend.userId ? String(backend.userId) : undefined,
    items,
    total: Number(backend.total),
    status: backend.status as OrderStatus,
    paymentMethod: backend.paymentMethod as "BANK_TRANSFER" | "STORE_PICKUP",
    shippingDetails: backend.recipientName
      ? {
          fullName: backend.recipientName,
          phone: backend.recipientPhone || "",
          email: "",
          method:
            (backend.paymentMethod as "BANK_TRANSFER" | "STORE_PICKUP") ||
            "BANK_TRANSFER",
          address: backend.shippingAddress,
        }
      : undefined,
    paymentNote: backend.paymentNote,
    createdAt: backend.createdAt,
    date: backend.createdAt
      ? new Date(backend.createdAt).toLocaleDateString()
      : undefined,
  };
}

/**
 * 後端 InquiryDTO 格式
 */
interface BackendInquiry {
  id: number; // DTO 使用 id
  userId?: number;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt?: string;
  repliedAt?: string;
}

/**
 * 轉換後端 InquiryDTO 為前端格式
 */
function transformInquiry(backend: BackendInquiry): Inquiry {
  return {
    id: String(backend.id),
    userId: backend.userId ? String(backend.userId) : undefined,
    name: backend.name,
    email: backend.email,
    message: backend.message,
    status: backend.status as "UNREAD" | "READ" | "REPLIED",
    createdAt: backend.createdAt,
    repliedAt: backend.repliedAt,
    date: backend.createdAt
      ? new Date(backend.createdAt).toLocaleDateString()
      : undefined,
  };
}

/**
 * 後端 User 格式（Auth Response）
 */
interface BackendUserResponse {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  token?: string;
}

/**
 * 轉換後端 User 為前端格式
 */
function transformUser(backend: BackendUserResponse): User {
  return {
    id: String(backend.id),
    email: backend.email,
    name: backend.name,
    phone: backend.phone,
    role: backend.role === "ADMIN" ? "ADMIN" : "MEMBER",
    orders: [], // 需要額外 API 呼叫取得訂單
  };
}

// ============================================
// Product API
// ============================================
export const productApi = {
  /**
   * 取得所有商品
   * GET /api/products
   */
  async getAll(): Promise<Product[]> {
    const backendProducts: BackendProduct[] = await apiGet("/products");
    const products = backendProducts.map(transformProduct);

    // 為每個商品取得 variants
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        try {
          const variants = await this.getVariants(product.id);
          return {
            ...product,
            variants,
            totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
          };
        } catch {
          return product;
        }
      })
    );

    return productsWithVariants;
  },

  /**
   * 取得所有商品 (Admin) - 包含未上架
   * GET /api/products/admin/all
   */
  async getAllAdmin(): Promise<Product[]> {
    const backendProducts: BackendProduct[] = await apiGet(
      "/products/admin/all"
    );
    const products = backendProducts.map(transformProduct);

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        try {
          const variants = await this.getVariants(product.id);
          return {
            ...product,
            variants,
            totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
          };
        } catch {
          return product;
        }
      })
    );

    return productsWithVariants;
  },

  /**
   * 取得單一商品
   * GET /api/products/:id
   */
  async getById(id: string): Promise<Product | undefined> {
    try {
      const backend: BackendProduct = await apiGet(`/products/${id}`);
      const product = transformProduct(backend);

      // 取得 variants
      try {
        const variants = await this.getVariants(id);
        product.variants = variants;
        product.totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      } catch {
        // Variants 取得失敗，使用預設值
      }

      return product;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return undefined;
      }
      throw error;
    }
  },

  /**
   * 依分類取得商品
   * GET /api/products/category/:categoryId
   */
  async getByCategory(categoryId: string): Promise<Product[]> {
    const backendProducts: BackendProduct[] = await apiGet(
      `/products/category/${categoryId}`
    );
    const products = backendProducts.map(transformProduct);

    // 為每個商品取得 variants
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        try {
          const variants = await this.getVariants(product.id);
          return {
            ...product,
            variants,
            totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
          };
        } catch {
          return product;
        }
      })
    );

    return productsWithVariants;
  },

  /**
   * 搜尋商品
   * GET /api/products/search?keyword=...
   */
  async search(keyword: string): Promise<Product[]> {
    const backendProducts: BackendProduct[] = await apiGet(
      `/products/search?keyword=${encodeURIComponent(keyword)}`
    );
    const products = backendProducts.map(transformProduct);

    // 為每個商品取得 variants
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        try {
          const variants = await this.getVariants(product.id);
          return {
            ...product,
            variants,
            totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
          };
        } catch {
          return product;
        }
      })
    );

    return productsWithVariants;
  },

  /**
   * 取得商品規格
   * GET /api/products/:productId/variants
   */
  async getVariants(productId: string): Promise<ProductVariant[]> {
    const backendVariants: BackendProductVariant[] = await apiGet(
      `/products/${productId}/variants`
    );
    return backendVariants.map(transformVariant);
  },

  /**
   * 新增商品 (Admin)
   * POST /api/products
   */
  async create(
    data: Omit<Product, "id" | "variants" | "totalStock">
  ): Promise<Product> {
    const requestBody = {
      categoryId: Number(data.categoryId),
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl, // 後端接受 imageUrl
      isListed: data.isListed ?? true,
    };
    const backend: BackendProduct = await apiPost("/products", requestBody);
    const product = transformProduct(backend);

    // 取得 variants
    try {
      const variants = await this.getVariants(product.id);
      product.variants = variants;
      product.totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    } catch {
      // Variants 取得失敗
    }

    return product;
  },

  /**
   * 更新商品 (Admin)
   * PUT /api/products/:id
   */
  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    try {
      const requestBody: any = {};
      if (data.categoryId) requestBody.categoryId = Number(data.categoryId);
      if (data.name) requestBody.name = data.name;
      if (data.description !== undefined)
        requestBody.description = data.description;
      if (data.price !== undefined) requestBody.price = data.price;
      if (data.imageUrl !== undefined) requestBody.imageUrl = data.imageUrl;
      if (data.isListed !== undefined) requestBody.isListed = data.isListed;

      const backend: BackendProduct = await apiPut(
        `/products/${id}`,
        requestBody
      );
      const product = transformProduct(backend);

      // 取得 variants
      try {
        const variants = await this.getVariants(id);
        product.variants = variants;
        product.totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      } catch {
        // Variants 取得失敗
      }

      return product;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 刪除商品 (Admin)
   * DELETE /api/products/:id
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiDelete(`/products/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 上傳商品圖片
   * POST /api/upload/image
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    // 注意：後端尚未實作此端點，暫時回傳錯誤
    throw new Error("Image upload endpoint not implemented yet");
  },
};

// ============================================
// Variant API
// ============================================
export const variantApi = {
  /**
   * 取得商品所有規格
   * GET /api/variants/product/:productId
   */
  async getByProductId(productId: string): Promise<ProductVariant[]> {
    const backendVariants: BackendProductVariant[] = await apiGet(
      `/variants/product/${productId}`
    );
    return backendVariants.map(transformVariant);
  },

  /**
   * 新增規格
   * POST /api/variants
   */
  async create(
    productId: string,
    data: { color: string; size: string; stock: number }
  ): Promise<ProductVariant> {
    const requestBody = {
      productId: Number(productId),
      skuCode: "", // 後端會自動產生
      color: data.color,
      size: data.size,
      stock: data.stock,
    };
    const backend: BackendProductVariant = await apiPost(
      "/variants",
      requestBody
    );
    return transformVariant(backend);
  },

  /**
   * 更新規格
   * PUT /api/variants/:id
   */
  async update(
    id: string,
    data: Partial<ProductVariant>
  ): Promise<ProductVariant | null> {
    try {
      const requestBody: any = {};
      if (data.color) requestBody.color = data.color;
      if (data.size) requestBody.size = data.size;
      if (data.stock !== undefined) requestBody.stock = data.stock;
      if (data.skuCode) requestBody.skuCode = data.skuCode;

      const backend: BackendProductVariant = await apiPut(
        `/variants/${id}`,
        requestBody
      );
      return transformVariant(backend);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 刪除規格
   * DELETE /api/variants/:id
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiDelete(`/variants/${id}`);
      return true;
    } catch {
      return false;
    }
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
    const backendOrders: BackendOrder[] = await apiGet("/orders");
    return Promise.all(backendOrders.map(transformOrder));
  },

  /**
   * 取得自己的訂單
   * GET /api/orders/my
   */
  async getMy(): Promise<Order[]> {
    const backendOrders: BackendOrder[] = await apiGet("/orders/my");
    return Promise.all(backendOrders.map(transformOrder));
  },

  /**
   * 取得單一訂單
   * GET /api/orders/:id
   */
  async getById(id: string): Promise<Order | undefined> {
    try {
      const backend: BackendOrder = await apiGet(`/orders/${id}`);
      return transformOrder(backend);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return undefined;
      }
      throw error;
    }
  },

  /**
   * 建立新訂單
   * POST /api/orders
   */
  async create(orderData: {
    items: CartItem[];
    shippingDetails: ShippingDetails;
  }): Promise<Order> {
    // 轉換 CartItem[] 為後端 OrderItemRequest[]
    const items = orderData.items.map((item) => ({
      variantId: Number(item.variant.id),
      quantity: item.quantity,
    }));

    const requestBody = {
      shippingMethod:
        orderData.shippingDetails.method === "STORE_PICKUP" ? "STORE" : "MAIL",
      paymentMethod: orderData.shippingDetails.method,
      recipientName: orderData.shippingDetails.fullName,
      recipientPhone: orderData.shippingDetails.phone,
      shippingAddress:
        orderData.shippingDetails.address ||
        orderData.shippingDetails.storeName ||
        "",
      items,
    };

    const backend: BackendOrder = await apiPost("/orders", requestBody);
    return transformOrder(backend);
  },

  /**
   * 更新訂單狀態 (Admin)
   * PATCH /api/orders/:id/status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<boolean> {
    try {
      await apiPatch(`/orders/${id}/status`, { status });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 更新訂單付款備註
   * PATCH /api/orders/:id/payment-note
   */
  async updatePaymentNote(id: string, note: string): Promise<boolean> {
    try {
      await apiPatch(`/orders/${id}/payment-note`, { paymentNote: note });
      return true;
    } catch {
      return false;
    }
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
    const backendInquiries: BackendInquiry[] = await apiGet("/inquiries");
    return backendInquiries.map(transformInquiry);
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
    const backend: BackendInquiry = await apiPost("/inquiries", data);
    return transformInquiry(backend);
  },

  /**
   * 標記已回覆 (Admin)
   * PATCH /api/inquiries/:id/reply
   */
  async markAsReplied(id: string): Promise<boolean> {
    try {
      await apiPatch(`/inquiries/${id}/reply`);
      return true;
    } catch {
      return false;
    }
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
    const backend: BackendUserResponse = await apiPost("/auth/login", data);

    // 儲存 token
    if (backend.token) {
      setToken(backend.token);
    }

    return transformUser(backend);
  },

  /**
   * 註冊新會員
   * POST /api/auth/register
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    const backend: BackendUserResponse = await apiPost("/auth/register", data);

    // 儲存 token
    if (backend.token) {
      setToken(backend.token);
    }

    return transformUser(backend);
  },

  /**
   * 取得目前使用者
   * GET /api/auth/me
   */
  async getMe(): Promise<User | null> {
    try {
      const backend: BackendUserResponse = await apiGet("/auth/me");
      return transformUser(backend);
    } catch {
      return null;
    }
  },

  /**
   * 登出
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiPost("/auth/logout");
    } finally {
      removeToken();
    }
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
    const backendCategories: BackendCategory[] = await apiGet("/categories");
    return backendCategories.map(transformCategory);
  },

  /**
   * 取得單一分類
   * GET /api/categories/:id
   */
  async getById(id: string): Promise<Category | undefined> {
    try {
      const backend: BackendCategory = await apiGet(`/categories/${id}`);
      return transformCategory(backend);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return undefined;
      }
      throw error;
    }
  },

  /**
   * 新增分類 (Admin)
   * POST /api/categories
   */
  async create(data: Omit<Category, "id">): Promise<Category> {
    const backend: BackendCategory = await apiPost("/categories", data);
    return transformCategory(backend);
  },

  /**
   * 更新分類 (Admin)
   * PUT /api/categories/:id
   */
  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    try {
      const backend: BackendCategory = await apiPut(`/categories/${id}`, data);
      return transformCategory(backend);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 刪除分類 (Admin)
   * DELETE /api/categories/:id
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiDelete(`/categories/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

// ============================================
// Featured Products API (暫時保留 mock，待後端實作)
// ============================================
const FEATURED_STORAGE_KEY = "komorebi_featured_products";
const MAX_FEATURED = 5;

const saveFeaturedToStorage = (ids: string[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(ids));
  }
};

const loadFeaturedFromStorage = (): string[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(FEATURED_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
  }
  return [];
};

export const featuredApi = {
  /**
   * 取得所有新品上架商品 IDs
   * GET /api/featured (待後端實作)
   */
  async getAll(): Promise<string[]> {
    // 暫時使用 localStorage
    return loadFeaturedFromStorage();
  },

  /**
   * 取得新品上架商品列表
   * GET /api/featured/products (待後端實作)
   */
  async getProducts(): Promise<Product[]> {
    const featuredIds = await this.getAll();
    if (featuredIds.length === 0) return [];

    // 取得所有商品並過濾
    const allProducts = await productApi.getAll();
    return allProducts.filter((p) => featuredIds.includes(p.id));
  },

  /**
   * 新增商品到新品上架
   * POST /api/featured/:productId (待後端實作)
   */
  async add(productId: string): Promise<{ success: boolean; message: string }> {
    const featuredIds = loadFeaturedFromStorage();

    if (featuredIds.includes(productId)) {
      return { success: false, message: "此商品已在新品上架列表中" };
    }

    if (featuredIds.length >= MAX_FEATURED) {
      return {
        success: false,
        message: `新品上架最多 ${MAX_FEATURED} 個商品`,
      };
    }

    featuredIds.push(productId);
    saveFeaturedToStorage(featuredIds);
    return { success: true, message: "已加入新品上架" };
  },

  /**
   * 從新品上架移除商品
   * DELETE /api/featured/:productId (待後端實作)
   */
  async remove(
    productId: string
  ): Promise<{ success: boolean; message: string }> {
    const featuredIds = loadFeaturedFromStorage();
    const index = featuredIds.indexOf(productId);

    if (index === -1) {
      return { success: false, message: "此商品不在新品上架列表中" };
    }

    featuredIds.splice(index, 1);
    saveFeaturedToStorage(featuredIds);
    return { success: true, message: "已從新品上架移除" };
  },

  /**
   * 切換商品新品上架狀態
   * POST /api/featured/:productId/toggle (待後端實作)
   */
  async toggle(
    productId: string
  ): Promise<{ isFeatured: boolean; message: string }> {
    const featuredIds = loadFeaturedFromStorage();
    const index = featuredIds.indexOf(productId);

    if (index > -1) {
      featuredIds.splice(index, 1);
      saveFeaturedToStorage(featuredIds);
      return { isFeatured: false, message: "已從新品上架移除" };
    } else {
      if (featuredIds.length >= MAX_FEATURED) {
        return {
          isFeatured: false,
          message: `新品上架最多 ${MAX_FEATURED} 個商品`,
        };
      }
      featuredIds.push(productId);
      saveFeaturedToStorage(featuredIds);
      return { isFeatured: true, message: "已加入新品上架" };
    }
  },
};

/**
 * 後端 CartItem 格式
 */
interface BackendCartItem {
  cartItemId: number;
  variantId?: number;
  variant?: BackendProductVariant & {
    product?: BackendProduct;
  };
  quantity: number;
  createdAt?: string;
}

/**
 * 轉換後端 CartItem 為前端格式
 */
function transformCartItem(backend: BackendCartItem): CartItem {
  if (!backend.variant) {
    throw new Error("CartItem missing variant information");
  }

  const variant = transformVariant(backend.variant);
  const product = backend.variant.product
    ? transformProduct(backend.variant.product)
    : {
        id: String(backend.variant.productId),
        categoryId: "",
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        isListed: true,
      };

  return {
    product,
    variant,
    quantity: backend.quantity,
  };
}

// ============================================
// Cart API
// ============================================
export const cartApi = {
  /**
   * 取得購物車
   * GET /api/cart
   */
  async getAll(): Promise<CartItem[]> {
    const backendCartItems: BackendCartItem[] = await apiGet("/cart");
    return backendCartItems.map(transformCartItem);
  },

  /**
   * 加入購物車
   * POST /api/cart
   */
  async add(variantId: string, quantity: number): Promise<CartItem> {
    const backend: BackendCartItem = await apiPost("/cart", {
      variantId: Number(variantId),
      quantity,
    });
    return transformCartItem(backend);
  },

  /**
   * 更新數量
   * PUT /api/cart/:id
   */
  async updateQuantity(cartItemId: string, quantity: number): Promise<void> {
    await apiPut(`/cart/${cartItemId}`, { quantity });
  },

  /**
   * 移除項目
   * DELETE /api/cart/:id
   */
  async remove(cartItemId: string): Promise<void> {
    await apiDelete(`/cart/${cartItemId}`);
  },

  /**
   * 清空購物車
   * DELETE /api/cart
   */
  async clear(): Promise<void> {
    await apiDelete("/cart");
  },
};

/**
 * 後端 UserProfileResponse 格式
 */
interface BackendUserProfile {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
}

/**
 * 轉換後端 UserProfile 為前端格式
 */
function transformUserProfile(backend: BackendUserProfile): User {
  return {
    id: String(backend.id),
    email: backend.email,
    name: backend.name,
    phone: backend.phone,
    role: backend.role === "ADMIN" ? "ADMIN" : "MEMBER",
    orders: [], // 需要額外 API 呼叫取得訂單
  };
}

// ============================================
// User API
// ============================================
export const userApi = {
  /**
   * 取得個人資料
   * GET /api/users/me
   */
  async getMe(): Promise<User | null> {
    try {
      const backend: BackendUserProfile = await apiGet("/users/me");
      return transformUserProfile(backend);
    } catch {
      return null;
    }
  },

  /**
   * 更新個人資料
   * PUT /api/users/me
   */
  async updateMe(data: {
    name?: string;
    phone?: string;
    newPassword?: string;
  }): Promise<User> {
    const backend: BackendUserProfile = await apiPut("/users/me", data);
    return transformUserProfile(backend);
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
  featured: featuredApi,
  cart: cartApi,
  users: userApi,
};

export default api;
