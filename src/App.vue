<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { api } from "./services/api";
import type {
  Product,
  ProductVariant,
  User,
  CartItem,
  Order,
  ShippingDetails,
  PageView,
  Inquiry,
  OrderStatus,
  Category,
} from "./types";

import Navbar from "./components/Navbar.vue";
import Hero from "./components/Hero.vue";
import NewArrivalsSection from "./components/NewArrivalsSection.vue";
import CollectionSection from "./components/CollectionSection.vue";
import ProductDetail from "./components/ProductDetail.vue";
import ContactSection from "./components/ContactSection.vue";
import AuthModal from "./components/AuthModal.vue";
import CartDrawer from "./components/CartDrawer.vue";
import UserDashboard from "./components/UserDashboard.vue";
import CheckoutPage from "./components/CheckoutPage.vue";
import AdminDashboard from "./components/AdminDashboard.vue";
import Footer from "./components/Footer.vue";
import ConfirmModal from "./components/ConfirmModal.vue";
import CartToast from "./components/CartToast.vue";
import { useConfirm } from "./composables/useConfirm";

// Confirm Modal
const { state: confirmState, handleConfirm, handleCancel } = useConfirm();

// Navigation State
const currentView = ref<PageView>("HOME");
const previousView = ref<PageView>("HOME");
const postLoginRedirect = ref<PageView | null>(null);

// App Data State
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const inquiries = ref<Inquiry[]>([]);
const allOrders = ref<Order[]>([]);

// Loading State
const isLoading = ref(true);
const loadError = ref<string | null>(null);

// UI State
const activeProduct = ref<Product | null>(null);
const isAuthOpen = ref(false);
const isCartOpen = ref(false);
const isDashboardOpen = ref(false);
type AdminTab = "INVENTORY" | "ORDERS" | "INQUIRIES" | "CATEGORIES";
const adminInitialTab = ref<AdminTab>("INVENTORY");
const isScrolled = ref(false);
const showCartToast = ref(false);

// User Data State - CartItem 現在以 variant 為單位
const cart = ref<CartItem[]>([]);
const user = ref<User | null>(null);

// New Arrivals (Featured) Products
const featuredProductIds = ref<string[]>([]);
const newArrivalsProducts = ref<Product[]>([]);

// Scroll Detection
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const reloadProductsForCurrentRole = async () => {
  if (user.value?.role === "ADMIN") {
    products.value = await api.products.getAllAdmin();
  } else {
    products.value = await api.products.getAll();
  }
};

onMounted(async () => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("auth:logout", handleLogout);

  try {
    isLoading.value = true;
    loadError.value = null;

    try {
      const currentUser = await api.auth.getMe();
      if (currentUser) {
        user.value = currentUser;
      }
    } catch (error) {
      console.log("Auto-login failed, token may be expired");
    }

    const categoriesData = await api.categories.getAll();
    categories.value = categoriesData;

    await reloadProductsForCurrentRole();

    if (user.value) {
      try {
        if (user.value.role === "ADMIN") {
          const [ordersData, inquiriesData] = await Promise.all([
            api.orders.getAll(),
            api.inquiries.getAll(),
          ]);
          allOrders.value = ordersData;
          inquiries.value = inquiriesData;
        } else {
          const ordersData = await api.orders.getMy();
          allOrders.value = ordersData;
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    }

    const [featuredIds, featuredProducts] = await Promise.all([
      api.featured.getAll(),
      api.featured.getProducts(),
    ]);
    featuredProductIds.value = featuredIds;
    newArrivalsProducts.value = featuredProducts;
  } catch (error) {
    console.error("Failed to load data:", error);
    loadError.value = "載入資料失敗，請重新整理頁面";
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("auth:logout", handleLogout);
});

// ============================================
// Navigation Handlers
// ============================================
const handleProductClick = (product: Product) => {
  activeProduct.value = product;
  previousView.value = currentView.value;
  currentView.value = "PRODUCT_DETAIL";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleCloseProduct = () => {
  activeProduct.value = null;
  currentView.value = previousView.value;
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
  adminInitialTab.value = "INVENTORY";
  currentView.value = "ADMIN_DASHBOARD";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleContactClick = () => {
  handleCloseProduct();
  currentView.value = "CONTACT";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ============================================
// Cart Logic (以 variantId 為單位)
// ============================================
const handleAddToCart = (product: Product, variant: ProductVariant) => {
  const stock = variant.stock || 0;
  if (stock <= 0) return;

  const existing = cart.value.find((item) => item.variant.id === variant.id);

  if (existing && existing.quantity + 1 > stock) {
    return;
  }

  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({
      product,
      variant,
      quantity: 1,
    });
  }
  // Show toast instead of opening cart
  showCartToast.value = true;
};

const handleRemoveFromCart = (variantId: string) => {
  cart.value = cart.value.filter((item) => item.variant.id !== variantId);
};

const handleUpdateQuantity = (variantId: string, delta: number) => {
  const item = cart.value.find((item) => item.variant.id === variantId);
  if (item) {
    // 從即時商品資料取得庫存
    const realTimeProduct = products.value.find(
      (p) => p.id === item.product.id
    );
    const realTimeVariant = realTimeProduct?.variants?.find(
      (v) => v.id === variantId
    );
    const stock = realTimeVariant?.stock || 0;

    if (delta > 0 && item.quantity + delta > stock) return;

    const newQty = item.quantity + delta;
    if (newQty > 0) item.quantity = newQty;
    else handleRemoveFromCart(variantId);
  }
};

const handleSetQuantity = (variantId: string, quantity: number) => {
  const item = cart.value.find((item) => item.variant.id === variantId);
  if (item) {
    const realTimeProduct = products.value.find(
      (p) => p.id === item.product.id
    );
    const realTimeVariant = realTimeProduct?.variants?.find(
      (v) => v.id === variantId
    );
    const stock = realTimeVariant?.stock || 0;

    let newQty = Math.floor(quantity);
    if (isNaN(newQty) || newQty < 1) newQty = 1;
    if (stock > 0 && newQty > stock) newQty = stock;
    item.quantity = newQty;
  }
};

// Helper: 取得購物車中某 variant 的數量
const getCartQuantityForVariant = (variantId: string): number => {
  const item = cart.value.find((i) => i.variant.id === variantId);
  return item ? item.quantity : 0;
};

const handleCheckoutStart = () => {
  if (!user.value) {
    postLoginRedirect.value = "CHECKOUT";
    isCartOpen.value = false;
    isAuthOpen.value = true;
    return;
  }
  isCartOpen.value = false;
  handleCloseProduct();
  currentView.value = "CHECKOUT";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handlePlaceOrder = async (shippingDetails: ShippingDetails) => {
  try {
    const newOrder = await api.orders.create({
      items: cart.value,
      shippingDetails,
    });

    // 重新載入商品資料以取得更新後的庫存
    products.value = await api.products.getAll();
    allOrders.value = await api.orders.getAll();

    if (user.value) {
      user.value.orders.unshift(newOrder);
    }

    cart.value = [];

    if (user.value?.role === "ADMIN") {
      adminInitialTab.value = "ORDERS";
      currentView.value = "ADMIN_DASHBOARD";
    } else {
      currentView.value = "USER_DASHBOARD";
      isDashboardOpen.value = true;

      if (shippingDetails.method === "BANK_TRANSFER") {
        setTimeout(() => {
          alert(
            "訂單已成功建立！\n\n請於匯款後，在訂單備註中補充以下資訊：\n• 匯款帳號末五碼\n• 匯款金額\n• 匯款時間"
          );
        }, 300);
      }
    }
  } catch (error) {
    console.error("Failed to place order:", error);
  }
};

// ============================================
// Auth Logic
// ============================================
const handleAuthClose = () => {
  isAuthOpen.value = false;
  postLoginRedirect.value = null;
};

const handleLogin = (loggedInUser: User) => {
  user.value = loggedInUser;
  isAuthOpen.value = false;

  if (loggedInUser.role === "ADMIN") {
    currentView.value = "ADMIN_DASHBOARD";
    postLoginRedirect.value = null;
    reloadProductsForCurrentRole();
    return;
  }

  if (postLoginRedirect.value) {
    currentView.value = postLoginRedirect.value;
    postLoginRedirect.value = null;
  }

  // 一般會員登入後也重新載入商品（確保最新庫存/狀態）
  reloadProductsForCurrentRole();
};

const handleLogout = async () => {
  try {
    await api.auth.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    user.value = null;
    isDashboardOpen.value = false;
    // 登出後用公開商品列表
    reloadProductsForCurrentRole();
    handleHomeClick();
  }
};

// ============================================
// Inquiry Logic
// ============================================
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

// ============================================
// Admin: Order & Inquiry
// ============================================
const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
  try {
    await api.orders.updateStatus(id, status);
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
    const inquiry = inquiries.value.find((i) => i.id === id);
    if (inquiry) inquiry.status = "REPLIED";
  } catch (error) {
    console.error("Failed to reply inquiry:", error);
  }
};

// ============================================
// Admin: Product CRUD
// ============================================
const handleCreateProduct = async (
  productData: Omit<Product, "id" | "variants" | "totalStock">
) => {
  try {
    const created = await api.products.create(productData);
    await reloadProductsForCurrentRole();
    return created;
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
      await reloadProductsForCurrentRole();
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
      await reloadProductsForCurrentRole();
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

// ============================================
// Admin: Variant CRUD
// ============================================
const refreshSingleProduct = async (productId: string) => {
  try {
    const refreshed = await api.products.getById(productId);
    if (!refreshed) return;
    const idx = products.value.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      products.value[idx] = refreshed;
    } else {
      products.value.push(refreshed);
    }
  } catch (error) {
    console.error("Failed to refresh product", productId, error);
  }
};

const handleCreateVariant = async (
  productId: string,
  data: { color: string; size: string; stock: number }
) => {
  try {
    const newVariant = await api.variants.create(productId, data);
    await refreshSingleProduct(productId);
    return newVariant;
  } catch (error) {
    console.error("Failed to create variant:", error);
    throw error;
  }
};

const handleUpdateVariant = async (
  id: string,
  data: Partial<ProductVariant>
) => {
  try {
    const updated = await api.variants.update(id, data);
    if (updated) {
      await refreshSingleProduct(updated.productId);
    } else {
      await reloadProductsForCurrentRole();
    }
    return updated;
  } catch (error) {
    console.error("Failed to update variant:", error);
    throw error;
  }
};

const handleDeleteVariant = async (id: string) => {
  try {
    const success = await api.variants.delete(id);
    if (success) {
      // 無法直接從回應得知 productId，重新載入較保險
      await reloadProductsForCurrentRole();
    }
    return success;
  } catch (error) {
    console.error("Failed to delete variant:", error);
    throw error;
  }
};

// ============================================
// User: Payment Note
// ============================================
const handleUpdatePaymentNote = async (orderId: string, note: string) => {
  try {
    await api.orders.updatePaymentNote(orderId, note);
    allOrders.value = await api.orders.getAll();

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

// ============================================
// Admin: Category CRUD
// ============================================
const handleCreateCategory = async (categoryData: Omit<Category, "id">) => {
  try {
    const newCategory = await api.categories.create(categoryData);
    categories.value.push(newCategory);
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

const handleUpdateCategory = async (
  id: string,
  categoryData: Partial<Category>
) => {
  try {
    const updated = await api.categories.update(id, categoryData);
    if (updated) {
      const index = categories.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories.value[index] = updated;
      }
    }
  } catch (error) {
    console.error("Failed to update category:", error);
    throw error;
  }
};

const handleDeleteCategory = async (id: string) => {
  try {
    const success = await api.categories.delete(id);
    if (success) {
      categories.value = categories.value.filter((c) => c.id !== id);
    }
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw error;
  }
};

// ============================================
// Admin: Featured Products
// ============================================
const handleToggleFeatured = async (productId: string) => {
  try {
    await api.featured.toggle(productId);
    // Reload featured data
    const [ids, products] = await Promise.all([
      api.featured.getAll(),
      api.featured.getProducts(),
    ]);
    featuredProductIds.value = ids;
    newArrivalsProducts.value = products;
  } catch (error) {
    console.error("Failed to toggle featured:", error);
  }
};
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
      @logout="handleLogout"
    />

    <main class="flex-grow pt-[89px]">
      <div v-if="currentView === 'HOME'">
        <Hero />
        <NewArrivalsSection
          :products="newArrivalsProducts"
          @product-click="handleProductClick"
        />
      </div>

      <div v-if="currentView === 'COLLECTION'">
        <CollectionSection
          :products="products"
          :categories="categories"
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
          :categories="categories"
          :orders="allOrders"
          :inquiries="inquiries"
          :featuredProductIds="featuredProductIds"
          @update-order-status="handleUpdateOrderStatus"
          @reply-inquiry="handleReplyInquiry"
          @create-product="handleCreateProduct"
          @update-product="handleUpdateProduct"
          @delete-product="handleDeleteProduct"
          @upload-image="handleUploadImage"
          @create-category="handleCreateCategory"
          @update-category="handleUpdateCategory"
          @delete-category="handleDeleteCategory"
          @create-variant="handleCreateVariant"
          @update-variant="handleUpdateVariant"
          @delete-variant="handleDeleteVariant"
          @toggle-featured="handleToggleFeatured"
          :initialTab="adminInitialTab"
        />
      </div>

      <div v-if="currentView === 'PRODUCT_DETAIL' && activeProduct">
        <ProductDetail
          :product="activeProduct"
          :currentQuantityForVariant="getCartQuantityForVariant"
          @close="handleCloseProduct"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <div v-if="currentView === 'CONTACT'">
        <ContactSection
          :initialName="user?.name"
          :initialEmail="user?.email"
          @submit="handleSubmitInquiry"
        />
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

    <!-- Global Confirm Modal -->
    <ConfirmModal
      :isOpen="confirmState.isOpen"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirmText="confirmState.confirmText"
      :cancelText="confirmState.cancelText"
      :variant="confirmState.variant"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <!-- Cart Toast -->
    <CartToast :show="showCartToast" @close="showCartToast = false" />
  </div>
</template>
