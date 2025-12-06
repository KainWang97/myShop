<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { SEASONAL_INDICES } from "./constants";
import { api } from "./services/api";
import type {
  Product,
  User,
  CartItem,
  Order,
  ShippingDetails,
  PageView,
  Inquiry,
  OrderStatus,
} from "./types";

import Navbar from "./components/Navbar.vue";
import Hero from "./components/Hero.vue";
import SeasonalSection from "./components/SeasonalSection.vue";
import CollectionSection from "./components/CollectionSection.vue";
import ProductDetail from "./components/ProductDetail.vue";
import ContactSection from "./components/ContactSection.vue";
import AuthModal from "./components/AuthModal.vue";
import CartDrawer from "./components/CartDrawer.vue";
import UserDashboard from "./components/UserDashboard.vue";
import CheckoutPage from "./components/CheckoutPage.vue";
import AdminDashboard from "./components/AdminDashboard.vue";
import Footer from "./components/Footer.vue";

// Navigation State
const currentView = ref<PageView>("HOME");
const previousView = ref<PageView>("HOME"); // Track where user came from
const postLoginRedirect = ref<PageView | null>(null);

// App Data State
const products = ref<Product[]>([]);
const inquiries = ref<Inquiry[]>([]);
const allOrders = ref<Order[]>([]);

// Loading State (for async data)
const isLoading = ref(true);
const loadError = ref<string | null>(null);

// UI State
const activeProduct = ref<Product | null>(null);
const isAuthOpen = ref(false);
const isCartOpen = ref(false);
const isDashboardOpen = ref(false);
const isScrolled = ref(false);

// User Data State
const cart = ref<CartItem[]>([]);
const user = ref<User | null>(null);

// Seasonal Products (過濾掉尚未載入的 undefined 項目)
const seasonalProducts = computed(
  () =>
    SEASONAL_INDICES.map((index) => products.value[index]).filter(
      Boolean
    ) as Product[]
);

// Scroll Detection (保留 Scroll 但不需要 Contact Ref 了)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(async () => {
  window.addEventListener("scroll", handleScroll);

  // 非同步載入資料 (模擬 API 請求)
  try {
    isLoading.value = true;
    loadError.value = null;

    // 並行載入所有資料
    const [productsData, ordersData, inquiriesData] = await Promise.all([
      api.products.getAll(),
      api.orders.getAll(),
      api.inquiries.getAll(),
    ]);

    products.value = productsData;
    allOrders.value = ordersData;
    inquiries.value = inquiriesData;
  } catch (error) {
    console.error("Failed to load data:", error);
    loadError.value = "載入資料失敗，請重新整理頁面";
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Navigation Handlers
const handleProductClick = (product: Product) => {
  activeProduct.value = product;
  previousView.value = currentView.value; // Save current view before navigating
  currentView.value = "PRODUCT_DETAIL";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleCloseProduct = () => {
  activeProduct.value = null;
  currentView.value = previousView.value; // Return to previous view
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleHomeClick = () => {
  handleCloseProduct();
  currentView.value = "HOME";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleCollectionClick = () => {
  handleCloseProduct();
  currentView.value = "COLLECTION";
};

const handleAdminDashboardClick = () => {
  handleCloseProduct();
  currentView.value = "ADMIN_DASHBOARD";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleContactClick = () => {
  handleCloseProduct();
  currentView.value = "CONTACT";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Cart Logic
const handleAddToCart = (product: Product) => {
  const stock = product.stock || 0;
  if (stock <= 0) return;

  const existing = cart.value.find((item) => item.id === product.id);

  if (existing && existing.quantity + 1 > stock) {
    return;
  }

  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
  isCartOpen.value = true;
};

const handleRemoveFromCart = (id: string) => {
  cart.value = cart.value.filter((item) => item.id !== id);
};

const handleUpdateQuantity = (id: string, delta: number) => {
  const item = cart.value.find((item) => item.id === id);
  if (item) {
    // Check stock limit
    if (delta > 0) {
      const product = products.value.find((p) => p.id === id);
      const stock = product?.stock || 0;
      if (item.quantity + delta > stock) return;
    }

    const newQty = item.quantity + delta;
    if (newQty > 0) item.quantity = newQty;
  }
};

const handleSetQuantity = (id: string, quantity: number) => {
  const item = cart.value.find((item) => item.id === id);
  if (item) {
    const product = products.value.find((p) => p.id === id);
    const stock = product?.stock || 0;

    let newQty = Math.floor(quantity);
    if (isNaN(newQty) || newQty < 1) newQty = 1;

    if (stock > 0 && newQty > stock) {
      newQty = stock;
    }
    item.quantity = newQty;
  }
};

const handleCheckoutStart = () => {
  if (!user.value) {
    postLoginRedirect.value = "CHECKOUT";
    isCartOpen.value = false;
    isAuthOpen.value = true;
    return;
  }
  isCartOpen.value = false;
  handleCloseProduct(); // This will set activeProduct to null
  currentView.value = "CHECKOUT";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handlePlaceOrder = async (shippingDetails: ShippingDetails) => {
  try {
    // 透過 API 建立訂單
    const newOrder = await api.orders.create({
      items: cart.value.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingDetails,
    });

    // 重新載入商品資料以取得更新後的庫存
    products.value = await api.products.getAll();
    allOrders.value = await api.orders.getAll();

    // Update User's local order list
    if (user.value) {
      user.value.orders.unshift(newOrder);
    }

    cart.value = [];

    // 根據角色跳轉到對應的訂單管理區塊
    if (user.value?.role === "ADMIN") {
      // Admin 跳轉到 Admin Dashboard (Orders tab)
      currentView.value = "ADMIN_DASHBOARD";
    } else {
      // 一般使用者跳回首頁並開啟訂單管理區塊
      currentView.value = "HOME";
      isDashboardOpen.value = true;

      // 如果是匯款方式，提示使用者補充匯款資訊
      if (shippingDetails.method === "BANK_TRANSFER") {
        // 延遲一下讓 Dashboard 先打開
        setTimeout(() => {
          alert(
            "訂單已成功建立！\n\n請於匯款後，在訂單備註中補充以下資訊：\n• 匯款帳號末五碼\n• 匯款金額\n• 匯款時間"
          );
        }, 300);
      }
    }
  } catch (error) {
    console.error("Failed to place order:", error);
    // 可加入錯誤提示 UI
  }
};

// Auth Logic
const handleAuthClose = () => {
  isAuthOpen.value = false;
  postLoginRedirect.value = null;
};

const handleLogin = (loggedInUser: User) => {
  user.value = loggedInUser;
  isAuthOpen.value = false; // Close modal on successful login

  if (loggedInUser.role === "ADMIN") {
    currentView.value = "ADMIN_DASHBOARD";
    postLoginRedirect.value = null; // Always clear redirect for admin
    return;
  }

  // If a redirect was planned (e.g., to checkout), execute it
  if (postLoginRedirect.value) {
    currentView.value = postLoginRedirect.value;
    postLoginRedirect.value = null; // Reset redirect state after using it
  }
};

const handleLogout = () => {
  user.value = null;
  isDashboardOpen.value = false;
  handleHomeClick();
};

// Inquiry Logic
const handleSubmitInquiry = async (
  name: string,
  email: string,
  message: string
) => {
  try {
    const newInquiry = await api.inquiries.create({ name, email, message });
    inquiries.value.unshift(newInquiry);
  } catch (error) {
    console.error("Failed to submit inquiry:", error);
  }
};

// Admin Actions

const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
  try {
    await api.orders.updateStatus(id, status);
    // 更新本地狀態
    const order = allOrders.value.find((o) => o.id === id);
    if (order) order.status = status;

    if (user.value) {
      const userOrder = user.value.orders.find((o) => o.id === id);
      if (userOrder) userOrder.status = status;
    }
  } catch (error) {
    console.error("Failed to update order status:", error);
  }
};

const handleReplyInquiry = async (id: string) => {
  try {
    await api.inquiries.markAsReplied(id);
    // 更新本地狀態
    const inquiry = inquiries.value.find((i) => i.id === id);
    if (inquiry) inquiry.status = "REPLIED";
  } catch (error) {
    console.error("Failed to reply inquiry:", error);
  }
};

// Product CRUD Handlers
const handleCreateProduct = async (productData: Omit<Product, "id">) => {
  try {
    const newProduct = await api.products.create(productData);
    products.value.push(newProduct);
    return newProduct;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
};

const handleUpdateProduct = async (
  id: string,
  productData: Partial<Product>
) => {
  try {
    const updated = await api.products.update(id, productData);
    if (updated) {
      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        products.value[index] = updated;
      }
    }
    return updated;
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

const handleDeleteProduct = async (id: string) => {
  try {
    const success = await api.products.delete(id);
    if (success) {
      products.value = products.value.filter((p) => p.id !== id);
    }
    return success;
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw error;
  }
};

const handleUploadImage = async (file: File): Promise<string> => {
  try {
    const result = await api.products.uploadImage(file);
    return result.url;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
};

// Order Payment Note Handler
const handleUpdatePaymentNote = async (orderId: string, note: string) => {
  try {
    await api.orders.updatePaymentNote(orderId, note);

    // 重新載入訂單資料以確保 UI 即時更新
    allOrders.value = await api.orders.getAll();

    // Update user's order - 使用新陣列來觸發響應式更新
    if (user.value) {
      const updatedOrders = user.value.orders.map((o) =>
        o.id === orderId ? { ...o, paymentNote: note } : o
      );
      user.value = { ...user.value, orders: updatedOrders };
    }
  } catch (error) {
    console.error("Failed to update payment note:", error);
    throw error;
  }
};

const getActiveProductQuantity = computed(() => {
  if (!activeProduct.value) return 0;
  const item = cart.value.find((i) => i.id === activeProduct.value!.id);
  return item ? item.quantity : 0;
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-washi text-stone-900 font-sans selection:bg-stone-200 selection:text-sumi"
  >
    <Navbar
      :isScrolled="isScrolled"
      :user="user"
      :cartItems="cart"
      @open-auth="isAuthOpen = true"
      @open-cart="isCartOpen = true"
      @open-dashboard="isDashboardOpen = true"
      @open-admin="handleAdminDashboardClick"
      @home="handleHomeClick"
      @collection="handleCollectionClick"
      @contact="handleContactClick"
    />

    <main class="flex-grow pt-[89px]">
      <div v-if="currentView === 'HOME'">
        <Hero />
        <SeasonalSection
          :products="seasonalProducts"
          @product-click="handleProductClick"
        />
      </div>

      <div v-if="currentView === 'COLLECTION'">
        <CollectionSection
          :products="products"
          @product-click="handleProductClick"
        />
      </div>

      <div v-if="currentView === 'CHECKOUT'">
        <CheckoutPage
          :cartItems="cart"
          :userEmail="user?.email"
          :userName="user?.name"
          @place-order="handlePlaceOrder"
          @back="
            () => {
              currentView = 'HOME';
              isCartOpen = true;
            }
          "
        />
      </div>

      <div v-if="currentView === 'ADMIN_DASHBOARD'">
        <AdminDashboard
          :products="products"
          :orders="allOrders"
          :inquiries="inquiries"
          @update-order-status="handleUpdateOrderStatus"
          @reply-inquiry="handleReplyInquiry"
          @create-product="handleCreateProduct"
          @update-product="handleUpdateProduct"
          @delete-product="handleDeleteProduct"
          @upload-image="handleUploadImage"
        />
      </div>

      <div v-if="currentView === 'PRODUCT_DETAIL' && activeProduct">
        <ProductDetail
          :product="activeProduct"
          :currentQuantity="getActiveProductQuantity"
          @close="handleCloseProduct"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <div v-if="currentView === 'CONTACT'">
        <ContactSection @submit="handleSubmitInquiry" />
      </div>
    </main>

    <Footer v-if="currentView !== 'ADMIN_DASHBOARD'" />

    <!-- Overlays -->

    <AuthModal
      :isOpen="isAuthOpen"
      @close="handleAuthClose"
      @login="handleLogin"
    />

    <CartDrawer
      :isOpen="isCartOpen"
      :cartItems="cart"
      :products="products"
      @close="isCartOpen = false"
      @remove-item="handleRemoveFromCart"
      @update-quantity="handleUpdateQuantity"
      @set-quantity="handleSetQuantity"
      @checkout="handleCheckoutStart"
    />

    <UserDashboard
      v-if="user"
      :user="user"
      :isOpen="isDashboardOpen"
      @close="isDashboardOpen = false"
      @logout="handleLogout"
      @update-payment-note="handleUpdatePaymentNote"
    />
  </div>
</template>
