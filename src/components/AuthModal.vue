<script setup>
import { ref } from "vue";
import { api } from "../services/api.js";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close", "login"]);

// Form state
const isLogin = ref(true);
const email = ref("");
const password = ref("");
const name = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

// Reset form
const resetForm = () => {
  email.value = "";
  password.value = "";
  name.value = "";
  errorMessage.value = "";
};

// Handle login
const handleLogin = async () => {
  // Clear previous error
  errorMessage.value = "";

  // Validate required fields
  if (!email.value || !password.value) {
    errorMessage.value = "請填寫 Email 和密碼";
    return;
  }

  isLoading.value = true;
  try {
    const loggedInUser = await api.auth.login({
      email: email.value,
      password: password.value,
    });

    emit("login", loggedInUser);
    emit("close");
    resetForm();
  } catch (error) {
    errorMessage.value =
      error.message === "Invalid credentials"
        ? "帳號或密碼錯誤"
        : "登入失敗，請稍後再試";
  } finally {
    isLoading.value = false;
  }
};

// Handle register
const handleRegister = async () => {
  errorMessage.value = "";

  if (!name.value || !email.value || !password.value) {
    errorMessage.value = "請填寫所有欄位";
    return;
  }

  if (password.value.length < 4) {
    errorMessage.value = "密碼至少需要 4 個字元";
    return;
  }

  isLoading.value = true;
  try {
    const newUser = await api.auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    emit("login", newUser);
    emit("close");
    resetForm();
  } catch (error) {
    errorMessage.value =
      error.message === "Email already registered"
        ? "此 Email 已被註冊"
        : "註冊失敗，請稍後再試";
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = () => {
  if (isLogin.value) {
    handleLogin();
  } else {
    handleRegister();
  }
};

// Toggle mode and reset error
const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = "";
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      @click="emit('close')"
    />

    <!-- Modal -->
    <div
      class="relative bg-washi w-full max-w-md p-12 shadow-xl animate-fade-in-up"
    >
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-stone-400 hover:text-sumi"
      >
        ✕
      </button>

      <h2 class="text-2xl font-serif text-center mb-8 text-sumi">
        {{ isLogin ? "登入" : "註冊會員" }}
      </h2>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Name field (register only) -->
        <div v-if="!isLogin">
          <label
            class="block text-xs uppercase tracking-widest text-stone-500 mb-2"
            >姓名</label
          >
          <input
            type="text"
            v-model="name"
            placeholder="請輸入姓名"
            class="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none"
          />
        </div>

        <!-- Email field -->
        <div>
          <label
            class="block text-xs uppercase tracking-widest text-stone-500 mb-2"
            >Email</label
          >
          <input
            type="email"
            v-model="email"
            :placeholder="isLogin ? 'admin@komorebi.com' : '請輸入 Email'"
            class="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none"
          />
        </div>

        <!-- Password field -->
        <div>
          <label
            class="block text-xs uppercase tracking-widest text-stone-500 mb-2"
            >密碼</label
          >
          <input
            type="password"
            v-model="password"
            :placeholder="isLogin ? '請輸入密碼' : '設定密碼 (至少 4 字元)'"
            class="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none"
          />
        </div>

        <!-- Error message -->
        <p
          v-if="errorMessage"
          class="text-red-600 text-xs text-center animate-pulse"
        >
          {{ errorMessage }}
        </p>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-sumi text-washi py-3 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span
            v-if="isLoading"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          {{ isLogin ? "登入" : "註冊" }}
        </button>
      </form>

      <!-- Toggle login/register -->
      <div class="mt-8 text-center">
        <button
          @click="toggleMode"
          class="text-xs text-stone-500 border-b border-transparent hover:border-stone-500 transition-colors"
        >
          {{ isLogin ? "還沒有帳號？立即註冊" : "已有帳號？立即登入" }}
        </button>
      </div>

      <!-- Test credentials hint (for development) -->
      <div
        v-if="isLogin"
        class="mt-6 p-4 bg-stone-100/50 text-xs text-stone-500"
      >
        <!-- <p class="font-medium mb-2">測試帳號：</p>
        <p>管理員：admin@komorebi.com / admin</p>
        <p>會員：test@test.com / test123</p> -->
      </div>
    </div>
  </div>
</template>
