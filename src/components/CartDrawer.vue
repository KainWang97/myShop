<script setup lang="ts">
import { computed } from 'vue';
import type { CartItem, Product } from '../types';

const props = defineProps<{
  isOpen: boolean;
  cartItems: CartItem[];
  products: Product[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'remove-item', id: string): void;
  (e: 'update-quantity', id: string, delta: number): void;
  (e: 'set-quantity', id: string, quantity: number): void;
  (e: 'checkout'): void;
}>();

// Helper to check stock status per item
const getStockInfo = (item: CartItem) => {
  const realTimeProduct = props.products.find(p => p.id === item.id);
  const stock = realTimeProduct?.stock || 0;
  return {
    stock,
    isSoldOut: stock <= 0,
    isOverStock: stock > 0 && item.quantity > stock,
    isAtMax: stock > 0 && item.quantity === stock
  };
};

// Check global validation
const validation = computed(() => {
  let hasSoldOut = false;
  let hasInsufficient = false;

  props.cartItems.forEach(item => {
    const { isSoldOut, isOverStock } = getStockInfo(item);
    if (isSoldOut) hasSoldOut = true;
    if (isOverStock) hasInsufficient = true;
  });

  return { hasSoldOut, hasInsufficient };
});

const total = computed(() => {
  return props.cartItems.reduce((acc, item) => {
    const { isSoldOut } = getStockInfo(item);
    if (isSoldOut) return acc;
    return acc + (item.price * item.quantity);
  }, 0);
});

const disableCheckout = computed(() => validation.value.hasSoldOut || validation.value.hasInsufficient);

const handleInput = (id: string, event: Event) => {
  const val = parseInt((event.target as HTMLInputElement).value, 10);
  if (!isNaN(val)) {
    emit('set-quantity', id, val);
  } else {
    emit('set-quantity', id, 1);
  }
};
</script>

<template>
  <!-- Backdrop -->
  <div 
    @click="emit('close')"
    class="fixed inset-0 z-[70] bg-stone-900/30 backdrop-blur-sm transition-opacity duration-500"
    :class="isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
  />

  <!-- Drawer -->
  <div 
    class="fixed inset-y-0 right-0 z-[80] w-full max-w-md bg-washi shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-stone-200 flex flex-col"
    :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <div class="p-6 md:p-8 flex justify-between items-center border-b border-stone-200">
      <h2 class="font-serif text-2xl text-sumi">Your Selection</h2>
      <button @click="emit('close')" class="text-stone-400 hover:text-sumi transition-colors">
        ✕
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
      <div v-if="cartItems.length === 0" class="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
        <p class="font-serif italic text-lg">Your collection is empty.</p>
        <button @click="emit('close')" class="text-xs uppercase tracking-widest border-b border-stone-400 pb-1">Continue Browsing</button>
      </div>

      <div v-else v-for="item in cartItems" :key="item.id">
        <!-- Stock Logic Loop -->
        <div 
           class="flex gap-4 animate-fade-in relative transition-all duration-300"
           :class="{ 'opacity-50 grayscale': getStockInfo(item).isSoldOut }"
        >
          <!-- Sold Out Overlay -->
          <div v-if="getStockInfo(item).isSoldOut" class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <span class="bg-stone-800 text-washi px-3 py-1 text-[10px] uppercase tracking-widest font-bold transform -rotate-12 border border-washi">
              Sold Out
            </span>
          </div>

          <div class="w-20 h-24 bg-stone-200 flex-shrink-0">
            <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 flex flex-col justify-between py-1">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-serif text-sumi">{{ item.name }}</h3>
                <p class="text-xs text-stone-500 uppercase tracking-wider mt-1">{{ item.category }}</p>
                <p v-if="getStockInfo(item).isOverStock" class="text-[10px] text-red-700 font-medium mt-1">
                    Only {{ getStockInfo(item).stock }} available
                </p>
                <p v-if="getStockInfo(item).isAtMax" class="text-[10px] text-red-800 font-medium mt-1 animate-pulse">
                    Max limit reached
                </p>
              </div>
              <p class="text-sm font-light" :class="getStockInfo(item).isSoldOut ? 'text-stone-400 line-through' : 'text-sumi'">
                ${{ item.price * item.quantity }}
              </p>
            </div>
            
            <div class="flex justify-between items-end">
              <div v-if="getStockInfo(item).isSoldOut" class="text-[10px] text-red-800 uppercase tracking-widest font-medium">
                 Item Unavailable
              </div>
              <div v-else class="flex items-center border border-stone-300">
                <button 
                  @click="emit('update-quantity', item.id, -1)"
                  class="px-2 py-1 text-stone-500 hover:bg-stone-100 transition-colors"
                >
                  -
                </button>
                
                <input 
                  type="number"
                  min="1"
                  :max="getStockInfo(item).stock"
                  :value="item.quantity"
                  @input="handleInput(item.id, $event)"
                  class="w-12 text-center bg-transparent text-xs font-mono focus:outline-none appearance-none m-0 [&::-webkit-inner-spin-button]:appearance-none"
                  :class="(getStockInfo(item).isOverStock || getStockInfo(item).isAtMax) ? 'text-red-800 font-bold' : 'text-stone-800'"
                />
                
                <button 
                  @click="emit('update-quantity', item.id, 1)"
                  class="px-2 py-1 text-stone-500 hover:bg-stone-100 transition-colors"
                  :class="{ 'opacity-30 cursor-not-allowed': item.quantity >= getStockInfo(item).stock }"
                  :disabled="item.quantity >= getStockInfo(item).stock"
                >
                  +
                </button>
              </div>
              
              <button 
                @click="emit('remove-item', item.id)"
                class="text-[10px] uppercase tracking-widest text-stone-400 hover:text-red-900 transition-colors"
                :class="{ 'pointer-events-auto z-20 underline': getStockInfo(item).isSoldOut }"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cartItems.length > 0" class="p-6 md:p-8 bg-stone-50 border-t border-stone-200 space-y-6">
      <div class="flex justify-between items-end">
        <span class="text-xs uppercase tracking-widest text-stone-500">Subtotal</span>
        <span class="font-serif text-2xl text-sumi">${{ total }}</span>
      </div>
      
      <div v-if="validation.hasSoldOut || validation.hasInsufficient" class="text-center bg-red-50 border border-red-100 p-2">
        <p class="text-[10px] uppercase tracking-widest text-red-800">
          {{ validation.hasSoldOut ? "Please remove sold out items" : "Quantity exceeds available stock" }}
        </p>
      </div>

      <button 
        @click="emit('checkout')"
        :disabled="disableCheckout"
        class="w-full py-4 uppercase tracking-[0.2em] text-xs transition-colors"
        :class="disableCheckout ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-sumi text-washi hover:bg-stone-800'"
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
</template>