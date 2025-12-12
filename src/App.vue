<script setup>
import { ref, computed, provide, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "./services/api.js";
import { setGetUserFunction } from "./router/index.js";
import { encodeProductSlug } from "./utils/productSlug.js";

import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import AuthModal from "./components/AuthModal.vue";
import CartDrawer from "./components/CartDrawer.vue";
import ConfirmModal from "./components/ConfirmModal.vue";
import CartToast from "./components/CartToast.vue";
import { useConfirm } from "./composables/useConfirm.js";

const router = useRouter();
const route = useRoute();

// Confirm Modal
const { state: confirmState, handleConfirm, handleCancel } = useConfirm();

// App Data State
const products = ref([]);
const categories = ref([]);
const inquiries = ref([]);
const allOrders = ref([]);

// Loading State
const isLoading = ref(true);
const loadError = ref(null);

// UI State
const isAuthOpen = ref(false);
const isCartOpen = ref(false);
const isScrolled = ref(false);
const showCartToast = ref(false);
const postLoginRedirect = ref(null);

// User Data State
const cart = ref([]);
const user = ref(null);

// New Arrivals (Featured) Products
const featuredProductIds = ref([]);
const newArrivalsProducts = ref([]);

// 設定 router guard 可以取得用戶資料
setGetUserFunction(() => user.value);

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

    // 處理 URL query 參數 (例如 showLogin)
    if (route.query.showLogin === "true") {
      isAuthOpen.value = true;
      if (route.query.redirect) {
        postLoginRedirect.value = route.query.redirect;
      }
    }
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
// Navigation Handlers (使用 router)
// ============================================
const handleProductClick = (product) => {
  const slug = encodeProductSlug(product.id, product.name);
  router.push({ name: "product", params: { slug } });
};

const handleHomeClick = () => {
  router.push("/");
};

const handleCollectionClick = () => {
  router.push("/collection");
};

const handleAdminDashboardClick = () => {
  router.push("/admin");
};

const handleContactClick = () => {
  router.push("/contact");
};

// ============================================
// Cart Logic (以 variantId 為單位)
// ============================================
const handleAddToCart = (product, variant) => {
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
  showCartToast.value = true;
};

const handleRemoveFromCart = (variantId) => {
  cart.value = cart.value.filter((item) => item.variant.id !== variantId);
};

const handleUpdateQuantity = (variantId, delta) => {
  const item = cart.value.find((item) => item.variant.id === variantId);
  if (item) {
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

const handleSetQuantity = (variantId, quantity) => {
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

const getCartQuantityForVariant = (variantId) => {
  const item = cart.value.find((i) => i.variant.id === variantId);
  return item ? item.quantity : 0;
};

const handleCheckoutStart = () => {
  if (!user.value) {
    postLoginRedirect.value = "/checkout";
    isCartOpen.value = false;
    isAuthOpen.value = true;
    return;
  }
  isCartOpen.value = false;
  router.push("/checkout");
};

const handlePlaceOrder = async (shippingDetails) => {
  try {
    const newOrder = await api.orders.create({
      items: cart.value,
      shippingDetails,
    });

    await reloadProductsForCurrentRole();
    if (user.value?.role === "ADMIN") {
      allOrders.value = await api.orders.getAll();
    } else {
      allOrders.value = await api.orders.getMy();
    }

    if (user.value) {
      user.value.orders.unshift(newOrder);
    }

    cart.value = [];

    if (user.value?.role === "ADMIN") {
      router.push("/admin?tab=orders");
    } else {
      // 導向會員中心
      router.push("/account");

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
  // 清除 URL query
  if (route.query.showLogin) {
    router.replace({ query: {} });
  }
};

const handleLogin = async (loggedInUser) => {
  user.value = loggedInUser;
  isAuthOpen.value = false;

  await reloadProductsForCurrentRole();

  if (loggedInUser.role === "ADMIN") {
    // Admin 資料需要重新載入
    const [ordersData, inquiriesData] = await Promise.all([
      api.orders.getAll(),
      api.inquiries.getAll(),
    ]);
    allOrders.value = ordersData;
    inquiries.value = inquiriesData;

    if (postLoginRedirect.value) {
      router.push(postLoginRedirect.value);
    } else {
      router.push("/admin");
    }
    postLoginRedirect.value = null;
    return;
  }

  // 一般會員
  if (postLoginRedirect.value) {
    router.push(postLoginRedirect.value);
    postLoginRedirect.value = null;
  }
};

const handleLogout = async () => {
  try {
    await api.auth.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    user.value = null;
    reloadProductsForCurrentRole();
    router.push("/");
  }
};

// ============================================
// Inquiry Logic
// ============================================
const handleContactSubmit = async (name, email, message) => {
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
const handleUpdateOrderStatus = async (id, status) => {
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

const handleReplyInquiry = async (id) => {
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
const handleCreateProduct = async (productData) => {
  try {
    const created = await api.products.create(productData);
    await reloadProductsForCurrentRole();
    return created;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
};

const handleUpdateProduct = async (id, productData) => {
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

const handleDeleteProduct = async (id) => {
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

const handleUploadImage = async (file) => {
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
const refreshSingleProduct = async (productId) => {
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

const handleCreateVariant = async (productId, data) => {
  try {
    const newVariant = await api.variants.create(productId, data);
    await refreshSingleProduct(productId);
    return newVariant;
  } catch (error) {
    console.error("Failed to create variant:", error);
    throw error;
  }
};

const handleUpdateVariant = async (id, data) => {
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

const handleDeleteVariant = async (id) => {
  try {
    const success = await api.variants.delete(id);
    if (success) {
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
const handleUpdatePaymentNote = async (orderId, note) => {
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
const handleCreateCategory = async (categoryData) => {
  try {
    const newCategory = await api.categories.create(categoryData);
    categories.value.push(newCategory);
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

const handleUpdateCategory = async (id, categoryData) => {
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

const handleDeleteCategory = async (id) => {
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
const handleToggleFeatured = async (productId) => {
  try {
    await api.featured.toggle(productId);
    const [ids, prods] = await Promise.all([
      api.featured.getAll(),
      api.featured.getProducts(),
    ]);
    featuredProductIds.value = ids;
    newArrivalsProducts.value = prods;
  } catch (error) {
    console.error("Failed to toggle featured:", error);
  }
};

// ============================================
// Provide data and methods for child views
// ============================================
provide("products", products);
provide("categories", categories);
provide("allOrders", allOrders);
provide("inquiries", inquiries);
provide("featuredProductIds", featuredProductIds);
provide("newArrivalsProducts", newArrivalsProducts);
provide("cart", cart);
provide("user", user);

provide("handleProductClick", handleProductClick);
provide("handleAddToCart", handleAddToCart);
provide("handleContactSubmit", handleContactSubmit);
provide("handlePlaceOrder", handlePlaceOrder);
provide("handleUpdateOrderStatus", handleUpdateOrderStatus);
provide("handleReplyInquiry", handleReplyInquiry);
provide("handleCreateProduct", handleCreateProduct);
provide("handleUpdateProduct", handleUpdateProduct);
provide("handleDeleteProduct", handleDeleteProduct);
provide("handleUploadImage", handleUploadImage);
provide("handleCreateCategory", handleCreateCategory);
provide("handleUpdateCategory", handleUpdateCategory);
provide("handleDeleteCategory", handleDeleteCategory);
provide("handleCreateVariant", handleCreateVariant);
provide("handleUpdateVariant", handleUpdateVariant);
provide("handleDeleteVariant", handleDeleteVariant);
provide("handleToggleFeatured", handleToggleFeatured);
provide("handleLogout", handleLogout);
provide("handleUpdatePaymentNote", handleUpdatePaymentNote);

// 判斷是否隱藏 Footer (在 Admin 頁面)
const hideFooter = computed(() => route.path.startsWith("/admin"));
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
      @open-account="router.push('/account')"
      @open-admin="handleAdminDashboardClick"
      @home="handleHomeClick"
      @collection="handleCollectionClick"
      @logout="handleLogout"
    />

    <main class="flex-grow">
      <router-view />
    </main>

    <Footer v-if="!hideFooter" />

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
