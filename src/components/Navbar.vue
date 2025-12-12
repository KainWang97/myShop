<script setup>
import { computed, ref } from "vue";
import { useConfirm } from "../composables/useConfirm.js";

const props = defineProps({
  isScrolled: Boolean,
  user: Object,
  cartItems: Array,
});

const emit = defineEmits([
  "open-auth",
  "open-cart",
  "open-account",
  "open-admin",
  "home",
  "collection",
  "logout",
]);

const { confirm } = useConfirm();
const isLoggingOut = ref(false);

const handleLogout = async () => {
  const confirmed = await confirm({
    title: "登出確認",
    message: "確定要登出嗎？",
    confirmText: "登出",
    cancelText: "取消",
    variant: "warning",
  });

  if (!confirmed) return;

  isLoggingOut.value = true;
  // Minimize delay for better UX, just enough to show action
  setTimeout(() => {
    emit("logout");
    isLoggingOut.value = false;
  }, 800);
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

        <!-- Account Icon -->
        <button
          @click="user ? emit('open-account') : emit('open-auth')"
          class="hover:text-sumi transition-colors group relative"
          :title="user ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Login'"
        >
          <svg
            class="w-6 h-6 stroke-current stroke-1 group-hover:stroke-2 transition-all"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        <!-- Logout (Text Only - Keep visible if logged in) -->
        <button
          v-if="user"
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="hover:text-sumi transition-colors uppercase text-xs tracking-widest flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <span
            v-if="isLoggingOut"
            class="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"
          ></span>
          {{ isLoggingOut ? "..." : "LOGOUT" }}
        </button>

        <!-- Cart Icon -->
        <button
          @click="emit('open-cart')"
          class="hover:text-sumi transition-colors flex items-center gap-1 group"
        >
          <svg
            class="w-6 h-6 stroke-current stroke-1 group-hover:stroke-2 transition-all"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span
            v-if="cartCount > 0"
            class="text-sm font-light text-stone-600 group-hover:text-sumi transition-colors translate-y-[2px]"
          >
            {{ cartCount }}
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>
