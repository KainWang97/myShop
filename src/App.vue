<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { PRODUCTS, SEASONAL_INDICES } from './constants';
import type { Product, User, CartItem, Order, ShippingDetails, PageView, Inquiry, OrderStatus } from './types';

import Navbar from './components/Navbar.vue';
import Hero from './components/Hero.vue';
import SeasonalSection from './components/SeasonalSection.vue';
import CollectionSection from './components/CollectionSection.vue';
import ProductDetail from './components/ProductDetail.vue';
import ContactSection from './components/ContactSection.vue';
import AuthModal from './components/AuthModal.vue';
import CartDrawer from './components/CartDrawer.vue';
import UserDashboard from './components/UserDashboard.vue';
import CheckoutPage from './components/CheckoutPage.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import Footer from './components/Footer.vue';

// Navigation State
const currentView = ref<PageView>('HOME');
const postLoginRedirect = ref<PageView | null>(null);

// App Data State
const products = ref<Product[]>(PRODUCTS);
const inquiries = ref<Inquiry[]>([]);
const allOrders = ref<Order[]>([]);

// UI State
const activeProduct = ref<Product | null>(null);
const isAuthOpen = ref(false);
const isCartOpen = ref(false);
const isDashboardOpen = ref(false);
const isScrolled = ref(false);

// User Data State
const cart = ref<CartItem[]>([]);
const user = ref<User | null>(null);

// Seasonal Products
const seasonalProducts = computed(() => SEASONAL_INDICES.map(index => products.value[index]));

const contactSection = ref<InstanceType<typeof ContactSection> | null>(null);

const onContactClick = () => {
  contactSection.value?.$el.scrollIntoView({ behavior: 'smooth' });
};

// Scroll Detection
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Navigation Handlers
const handleProductClick = (product: Product) => {
  activeProduct.value = product;
  document.body.style.overflow = 'hidden';
};

const handleCloseProduct = () => {
  activeProduct.value = null;
  document.body.style.overflow = 'auto';
};

const handleHomeClick = () => {
  handleCloseProduct();
  currentView.value = 'HOME';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleCollectionClick = () => {
  handleCloseProduct();
  currentView.value = 'COLLECTION';
};

const handleAdminDashboardClick = () => {
  handleCloseProduct();
  currentView.value = 'ADMIN_DASHBOARD';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cart Logic
const handleAddToCart = (product: Product) => {
  const stock = product.stock || 0;
  if (stock <= 0) return;

  const existing = cart.value.find(item => item.id === product.id);
  
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
  cart.value = cart.value.filter(item => item.id !== id);
};

const handleUpdateQuantity = (id: string, delta: number) => {
  const item = cart.value.find(item => item.id === id);
  if (item) {
    // Check stock limit
    if (delta > 0) {
      const product = products.value.find(p => p.id === id);
      const stock = product?.stock || 0;
      if (item.quantity + delta > stock) return;
    }

    const newQty = item.quantity + delta;
    if (newQty > 0) item.quantity = newQty;
  }
};

const handleSetQuantity = (id: string, quantity: number) => {
  const item = cart.value.find(item => item.id === id);
  if (item) {
    const product = products.value.find(p => p.id === id);
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
    postLoginRedirect.value = 'CHECKOUT';
    isCartOpen.value = false;
    isAuthOpen.value = true;
    return;
  }
  isCartOpen.value = false;
  handleCloseProduct(); // This will set activeProduct to null
  currentView.value = 'CHECKOUT';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handlePlaceOrder = (shippingDetails: ShippingDetails) => {
  const newOrder: Order = {
    id: Math.floor(1000 + Math.random() * 9000).toString(),
    date: new Date().toLocaleDateString(),
    items: [...cart.value],
    total: cart.value.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    status: 'Processing',
    shippingDetails: shippingDetails
  };

  // Update User
  if (user.value) {
    user.value.orders.unshift(newOrder);
  }

  // Admin orders
  allOrders.value.unshift(newOrder);

  // Deduct Stock
  cart.value.forEach(cartItem => {
    const product = products.value.find(p => p.id === cartItem.id);
    if (product) {
      product.stock = Math.max(0, (product.stock || 0) - cartItem.quantity);
    }
  });

  cart.value = [];
  currentView.value = 'HOME';
  if (user.value?.role !== 'ADMIN') {
    isDashboardOpen.value = true;
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

  if (loggedInUser.role === 'ADMIN') {
    currentView.value = 'ADMIN_DASHBOARD';
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
const handleSubmitInquiry = (name: string, email: string, message: string) => {
  const newInquiry: Inquiry = {
    id: Date.now().toString(),
    name,
    email,
    message,
    date: new Date().toLocaleDateString(),
    status: 'PENDING'
  };
  inquiries.value.unshift(newInquiry);
};

// Admin Actions
const handleUpdateStock = (id: string, newStock: number) => {
  const product = products.value.find(p => p.id === id);
  if (product) {
    product.stock = Math.max(0, newStock);
  }
};

const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
  const order = allOrders.value.find(o => o.id === id);
  if (order) order.status = status;
  
  if (user.value) {
      const userOrder = user.value.orders.find(o => o.id === id);
      if (userOrder) userOrder.status = status;
  }
};

const handleReplyInquiry = (id: string) => {
  const inquiry = inquiries.value.find(i => i.id === id);
  if (inquiry) inquiry.status = 'REPLIED';
};

const getActiveProductQuantity = computed(() => {
    if(!activeProduct.value) return 0;
    const item = cart.value.find(i => i.id === activeProduct.value!.id);
    return item ? item.quantity : 0;
});
</script>

<template>
  <div class="min-h-screen bg-washi text-stone-900 font-sans selection:bg-stone-200 selection:text-sumi">
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
      @contact="onContactClick"
    />

    <main>
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
          @back="() => { currentView = 'HOME'; isCartOpen = true; }"
        />
      </div>

      <div v-if="currentView === 'ADMIN_DASHBOARD'">
        <AdminDashboard 
          :products="products"
          :orders="allOrders"
          :inquiries="inquiries"
          @update-stock="handleUpdateStock"
          @update-order-status="handleUpdateOrderStatus"
          @reply-inquiry="handleReplyInquiry"
        />
      </div>
      
      <!-- Contact Form -->
      <ContactSection 
        ref="contactSection"
        v-if="currentView !== 'CHECKOUT' && currentView !== 'ADMIN_DASHBOARD'" 
        @submit="handleSubmitInquiry" 
      />
    </main>

    <Footer v-if="currentView !== 'ADMIN_DASHBOARD'" />

    <!-- Overlays -->
    <ProductDetail 
      v-if="activeProduct"
      :product="activeProduct" 
      :currentQuantity="getActiveProductQuantity"
      @close="handleCloseProduct"
      @add-to-cart="handleAddToCart"
    />

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
    />
  </div>
</template>