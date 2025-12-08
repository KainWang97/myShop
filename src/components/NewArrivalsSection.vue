<script setup lang="ts">
import type { Product } from "../types";
import SeasonalItem from "./SeasonalItem.vue";

defineProps<{
  products: Product[];
}>();

const emit = defineEmits<{
  (e: "product-click", product: Product): void;
}>();
</script>

<template>
  <section class="bg-washi py-32 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 mb-24 text-center">
      <h2 class="text-xl font-serif text-sumi tracking-widest mb-4">
        新品上架
      </h2>
      <p class="text-xs uppercase tracking-[0.2em] text-stone-500">
        New Arrivals
      </p>
    </div>

    <div v-if="products.length === 0" class="text-center text-stone-400 py-12">
      <p class="text-sm">目前沒有新品上架</p>
      <p class="text-xs mt-2">管理員可在後台設定精選商品</p>
    </div>

    <div v-else class="max-w-6xl mx-auto space-y-32 px-6">
      <SeasonalItem
        v-for="(product, index) in products"
        :key="product.id"
        :product="product"
        :index="index"
        @click="emit('product-click', product)"
      />
    </div>
  </section>
</template>
