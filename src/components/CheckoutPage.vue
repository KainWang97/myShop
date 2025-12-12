<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  cartItems: Array,
  userEmail: String,
  userName: String,
});

const emit = defineEmits(["place-order", "back"]);

const step = ref("INFO");
const paymentMethod = ref("BANK_TRANSFER");
const isPlacingOrder = ref(false);

const formData = ref({
  fullName: props.userName || "",
  email: props.userEmail || "",
  phone: "",
  method: "BANK_TRANSFER",
  city: "",
  address: "",
  storeCode: "",
  storeName: "",
});

// 計算總價 (使用新 CartItem 結構)
const total = computed(() =>
  props.cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )
);
const shippingCost = computed(() => (total.value > 1000 ? 0 : 60));
const finalTotal = computed(() => total.value + shippingCost.value);

const handleSubmitInfo = () => {
  step.value = "PAYMENT";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleFinalSubmit = () => {
  isPlacingOrder.value = true;
  emit("place-order", { ...formData.value, method: paymentMethod.value });
};
</script>

<template>
  <div class="min-h-screen bg-washi pt-32 pb-24 animate-fade-in">
    <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
      <!-- Left Column: Forms -->
      <div>
        <button
          @click="emit('back')"
          class="text-xs uppercase tracking-widest text-stone-400 hover:text-sumi mb-8 flex items-center gap-2"
        >
          ← Back to Cart
        </button>

        <h1 class="text-3xl font-serif text-sumi mb-12">Checkout</h1>

        <form
          v-if="step === 'INFO'"
          @submit.prevent="handleSubmitInfo"
          class="space-y-8 animate-slide-up"
        >
          <h2
            class="text-sm uppercase tracking-widest text-stone-500 border-b border-stone-200 pb-2"
          >
            Contact Information
          </h2>

          <div class="space-y-6">
            <div>
              <label
                class="block text-xs uppercase tracking-widest text-stone-400 mb-2"
                >Email</label
              >
              <input
                required
                type="email"
                v-model="formData.email"
                class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
              />
            </div>
            <div>
              <label
                class="block text-xs uppercase tracking-widest text-stone-400 mb-2"
                >Full Name</label
              >
              <input
                required
                type="text"
                v-model="formData.fullName"
                class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
              />
            </div>
            <div>
              <label
                class="block text-xs uppercase tracking-widest text-stone-400 mb-2"
                >Phone</label
              >
              <input
                required
                type="tel"
                v-model="formData.phone"
                class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
              />
            </div>
          </div>

          <div class="pt-8">
            <button
              type="submit"
              class="bg-sumi text-washi px-8 py-3 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors w-full md:w-auto"
            >
              Continue to Payment
            </button>
          </div>
        </form>

        <form
          v-else
          @submit.prevent="handleFinalSubmit"
          class="space-y-10 animate-slide-up"
        >
          <!-- Payment Method Selection -->
          <div>
            <h2
              class="text-sm uppercase tracking-widest text-stone-500 border-b border-stone-200 pb-2 mb-6"
            >
              Payment & Delivery Method
            </h2>

            <div class="space-y-4">
              <label
                class="block border p-6 cursor-pointer transition-all duration-300"
                :class="
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-sumi bg-stone-50'
                    : 'border-stone-200 opacity-60 hover:opacity-100'
                "
              >
                <div class="flex items-center gap-4">
                  <input
                    type="radio"
                    value="BANK_TRANSFER"
                    v-model="paymentMethod"
                    class="accent-sumi"
                  />
                  <div>
                    <span class="block font-serif text-lg"
                      >Bank Transfer (匯款)</span
                    >
                    <span class="text-xs text-stone-500 font-light"
                      >Direct transfer. Delivery to home address.</span
                    >
                  </div>
                </div>
              </label>

              <label
                class="block border p-6 cursor-pointer transition-all duration-300"
                :class="
                  paymentMethod === 'STORE_PICKUP'
                    ? 'border-sumi bg-stone-50'
                    : 'border-stone-200 opacity-60 hover:opacity-100'
                "
              >
                <div class="flex items-center gap-4">
                  <input
                    type="radio"
                    value="STORE_PICKUP"
                    v-model="paymentMethod"
                    class="accent-sumi"
                  />
                  <div>
                    <span class="block font-serif text-lg"
                      >Store Pickup / COD (店到店貨到付款)</span
                    >
                    <span class="text-xs text-stone-500 font-light"
                      >Pay when you pick up at a convenience store.</span
                    >
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Dynamic Shipping Fields -->
          <div class="bg-white p-6 border border-stone-200">
            <div
              v-if="paymentMethod === 'BANK_TRANSFER'"
              class="space-y-6 animate-fade-in"
            >
              <h3 class="font-serif text-sumi">Shipping Address</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    class="block text-xs uppercase tracking-widest text-stone-400 mb-2"
                    >City</label
                  >
                  <input
                    required
                    v-model="formData.city"
                    class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                  />
                </div>
                <div></div>
              </div>
              <div>
                <label
                  class="block text-xs uppercase tracking-widest text-stone-400 mb-2"
                  >Address</label
                >
                <input
                  required
                  v-model="formData.address"
                  class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                />
              </div>

              <div
                class="bg-stone-100 p-4 text-xs text-stone-600 space-y-1 font-mono mt-4"
              >
                <p class="uppercase tracking-widest text-stone-400 mb-2">
                  請將訂單總金額匯入以下帳戶，若有任何問題，請聯繫我們。
                </p>
                <p>Bank: Choose Bank (808)</p>
                <p>Account: 1234-5678-9012</p>
                <p>Name: Choose Select Ltd.</p>
              </div>
              <p
                class="font-bold text-stone-400 text-sm tracking-widest text-red-800"
              >
                請於匯款後，在訂單頁面提供匯款資訊，
                <br />
                我們將在收到匯款後進行訂單確認，煩請耐心等候。
                <br />
                如有任何問題，請聯繫我們，會盡快為您處理。
              </p>
            </div>

            <div v-else class="space-y-6 animate-fade-in">
              <h3 class="font-serif text-sumi">Store Details</h3>
              <p class="text-xs text-stone-500">
                請提供便利商店的店號以及店名。
              </p>

              <div>
                <label
                  class="block text-xs uppercase tracking-widest text-stone-400 mb-2"
                  >Store Code (店號)</label
                >
                <input
                  required
                  v-model="formData.storeCode"
                  placeholder="e.g. 123456"
                  class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                />
              </div>
              <div>
                <label
                  class="block text-xs uppercase tracking-widest text-stone-400 mb-2"
                  >Store Name (店名)</label
                >
                <input
                  required
                  v-model="formData.storeName"
                  placeholder="e.g. 7-11 Shinjuku Branch"
                  class="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi rounded-none"
                />
              </div>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="button"
              @click="step = 'INFO'"
              :disabled="isPlacingOrder"
              class="px-6 py-3 border border-stone-300 text-stone-500 uppercase tracking-widest text-xs hover:border-sumi hover:text-sumi transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              :disabled="isPlacingOrder"
              class="flex-1 bg-sumi text-washi px-8 py-3 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <span
                v-if="isPlacingOrder"
                class="inline-block w-4 h-4 border-2 border-washi border-t-transparent rounded-full animate-spin"
              ></span>
              {{
                isPlacingOrder ? "結帳中..." : `Place Order — $${finalTotal}`
              }}
            </button>
          </div>
        </form>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="bg-stone-50 p-8 h-fit border border-stone-200">
        <h2 class="font-serif text-xl text-sumi mb-6">訂單總覽</h2>

        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
          <div
            v-for="item in cartItems"
            :key="item.variant.id"
            class="flex gap-4"
          >
            <div class="w-16 h-20 bg-stone-200 flex-shrink-0">
              <img
                :src="item.product.imageUrl"
                :alt="item.product.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 py-1">
              <div class="flex justify-between items-start">
                <h3 class="font-serif text-sm text-sumi">
                  {{ item.product.name }}
                </h3>
                <p class="text-sm font-light text-stone-600">
                  ${{ item.product.price * item.quantity }}
                </p>
              </div>
              <!-- 顯示規格資訊 -->
              <p class="text-xs text-stone-400 mt-1">
                {{ item.variant.color }} / {{ item.variant.size }} · Qty:
                {{ item.quantity }}
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-stone-200 pt-6 space-y-2">
          <div class="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span>${{ total }}</span>
          </div>
          <div class="flex justify-between text-sm text-stone-600">
            <span>Shipping</span>
            <span>{{ shippingCost === 0 ? "Free" : `$${shippingCost}` }}</span>
          </div>
          <div
            class="flex justify-between items-end pt-4 border-t border-stone-200 mt-4"
          >
            <span class="text-xs uppercase tracking-widest text-stone-500"
              >Total</span
            >
            <span class="font-serif text-2xl text-sumi">${{ finalTotal }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
