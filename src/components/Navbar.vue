<script setup lang="ts">
import { computed, ref } from "vue";
import type { User, CartItem } from "../types";

const props = defineProps<{
  isScrolled: boolean;
  user: User | null;
  cartItems: CartItem[];
}>();

const emit = defineEmits<{
  (e: "open-auth"): void;
  (e: "open-cart"): void;
  (e: "open-dashboard"): void;
  (e: "open-admin"): void;
  (e: "home"): void;
  (e: "collection"): void;
  (e: "contact"): void;
  (e: "logout"): void;
}>();

const isLoggingOut = ref(false);

const handleLogout = async () => {
  if (confirm("Are you sure you want to log out?")) {
    isLoggingOut.value = true;
    // Minimize delay for better UX, just enough to show action
    await new Promise((resolve) => setTimeout(resolve, 800));
    emit("logout");
    isLoggingOut.value = false;
  }
};

const cartCount = computed(() =>
  props.cartItems.reduce((acc, item) => acc + item.quantity, 0)
);
const isAdmin = computed(() => props.user?.role === "ADMIN");
</script>

<template>
  <nav
    class="fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out border-b"
    :class="[
      isScrolled
        ? 'bg-washi/90 backdrop-blur-sm py-4 border-stone-200/100'
        : 'bg-transparent py-8 border-stone-200/0',
    ]"
  >
    <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
      <button
        @click="emit('home')"
        class="text-2xl tracking-[0.2em] font-serif text-sumi hover:opacity-70 transition-opacity uppercase"
      >
        Choose
      </button>

      <div
        class="flex items-center gap-8 text-sm tracking-widest text-stone-600 font-light"
      >
        <!-- Admin Link -->
        <button
          v-if="isAdmin"
          @click="emit('open-admin')"
          class="text-red-900 font-medium hover:text-red-700 transition-colors uppercase border-b border-red-900/20"
        >
          Dashboard
        </button>

        <button
          @click="emit('collection')"
          class="hover:text-sumi transition-colors hidden md:block"
        >
          COLLECTION
        </button>

        <button
          v-if="!isAdmin"
          @click="emit('contact')"
          class="hover:text-sumi transition-colors hidden md:block"
        >
          CONTACT
        </button>

        <button
          @click="user ? emit('open-dashboard') : emit('open-auth')"
          class="hover:text-sumi transition-colors uppercase"
        >
          {{ user ? (isAdmin ? "Admin" : "Account") : "Login" }}
        </button>

        <button
          v-if="user"
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="hover:text-sumi transition-colors uppercase flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <span
            v-if="isLoggingOut"
            class="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"
          ></span>
          {{ isLoggingOut ? "Logging out..." : "Logout" }}
        </button>

        <button
          @click="emit('open-cart')"
          class="hover:text-sumi transition-colors uppercase flex items-center gap-2"
        >
          Cart
          <span
            v-if="cartCount > 0"
            class="flex items-center justify-center w-5 h-5 bg-sumi text-washi text-[10px] rounded-full"
          >
            {{ cartCount }}
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>
