<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Product } from '../types';

const props = defineProps<{
  product: Product;
  currentQuantity: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-to-cart', product: Product): void;
}>();

const addedAnimation = ref(false);

onMounted(() => {
  window.scrollTo(0, 0);
});

const handleAddToCart = () => {
  emit('add-to-cart', props.product);
  addedAnimation.value = true;
  setTimeout(() => {
    addedAnimation.value = false;
  }, 2000);
};

const stock = computed(() => props.product.stock || 0);
const isSoldOut = computed(() => stock.value <= 0);
const isMaxReached = computed(() => props.currentQuantity >= stock.value);
const canAdd = computed(() => !isSoldOut.value && !isMaxReached.value);
</script>

<template>
  <div class="fixed inset-0 z-[60] bg-washi overflow-y-auto no-scrollbar animate-fade-in">
    <!-- Close Button -->
    <button 
      @click="emit('close')"
      class="fixed top-6 right-6 z-50 p-4 mix-blend-difference text-white hover:scale-110 transition-transform"
    >
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <div class="min-h-screen flex flex-col md:flex-row">
      <!-- Image Section -->
      <div class="w-full md:w-1/2 h-[50vh] md:h-screen bg-stone-200 relative">
         <img 
          :src="product.image" 
          :alt="product.name" 
          class="w-full h-full object-cover"
        />
        <div v-if="isSoldOut" class="absolute inset-0 bg-stone-900/10 flex items-center justify-center">
           <span class="bg-sumi text-washi px-6 py-2 text-sm uppercase tracking-widest border border-washi transform -rotate-12">
             Sold Out
           </span>
        </div>
      </div>

      <!-- Content Section -->
      <div class="w-full md:w-1/2 min-h-[50vh] md:min-h-screen p-8 md:p-20 flex flex-col justify-center bg-washi">
        <div class="max-w-md mx-auto w-full space-y-8 animate-slide-up">
          
          <div class="space-y-2 border-l-2 border-stone-800 pl-6">
            <p class="text-xs tracking-[0.2em] uppercase text-stone-500">{{ product.origin }}</p>
            <h2 class="text-4xl md:text-5xl font-serif text-sumi">{{ product.name }}</h2>
            <p class="text-xl font-light text-stone-800 pt-2">${{ product.price }}</p>
          </div>

          <div class="py-8 space-y-6 text-stone-600 font-light leading-relaxed">
            <p>{{ product.details }}</p>
            
            <div class="grid grid-cols-2 gap-4 text-sm border-t border-stone-200 pt-6">
              <div>
                <span class="block text-xs uppercase tracking-wider text-stone-400 mb-1">Material</span>
                {{ product.material }}
              </div>
              <div>
                <span class="block text-xs uppercase tracking-wider text-stone-400 mb-1">Category</span>
                {{ product.category }}
              </div>
            </div>
          </div>



          <div class="space-y-2">
            <button 
              @click="handleAddToCart"
              :disabled="!canAdd || addedAnimation"
              class="w-full py-4 uppercase tracking-[0.2em] text-xs transition-all duration-500 relative overflow-hidden"
              :class="!canAdd ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : (addedAnimation ? 'bg-stone-200 text-sumi' : 'bg-sumi text-washi hover:bg-stone-800')"
            >
              <span class="relative z-10" :class="addedAnimation ? 'opacity-0' : 'opacity-100'">
                {{ isSoldOut ? 'Sold Out' : (isMaxReached ? 'Max Limit Reached' : 'Add to Cart') }}
              </span>
              <span class="absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300" :class="addedAnimation ? 'opacity-100' : 'opacity-0'">
                Added to Collection
              </span>
            </button>

            <!-- Red warning text -->
            <p v-if="isMaxReached && !isSoldOut" class="text-center text-[10px] text-red-800 uppercase tracking-widest animate-fade-in">
              Maximum stock quantity reached ({{ stock }}/{{ stock }})
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>