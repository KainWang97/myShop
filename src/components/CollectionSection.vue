<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Product, Category } from "../types";
import ProductCard from "./ProductCard.vue";
import FilterBar from "./FilterBar.vue";

const props = defineProps<{
  products: Product[];
  categories: Category[];
}>();

const emit = defineEmits<{
  (e: "product-click", product: Product): void;
}>();

const activeCategory = ref("All");

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const categoryOptions = computed(() => {
  const names = props.categories.map((c) => c.name);
  return ["All", ...names];
});

const filteredProducts = computed(() => {
  return props.products.filter((product) => {
    // 只顯示已上架且有庫存的商品
    const isListed = product.isListed !== false;
    const hasStock = (product.totalStock || 0) > 0;
    const matchesCategory =
      activeCategory.value === "All" ||
      product.category === activeCategory.value;
    return isListed && hasStock && matchesCategory;
  });
});
</script>

<template>
  <div class="min-h-screen bg-washi pt-32 pb-24">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col items-center mb-16 space-y-6 text-center">
        <h2 class="text-4xl font-serif text-sumi tracking-wider">All Items</h2>
        <p class="text-xs tracking-[0.2em] text-stone-500 uppercase">
          Life is what you choose
        </p>
      </div>

      <FilterBar
        :categories="categoryOptions"
        :activeCategory="activeCategory"
        @select-category="activeCategory = $event"
      />

      <div
        v-if="filteredProducts.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 animate-fade-in"
      >
        <ProductCard
          v-for="(product, index) in filteredProducts"
          :key="product.id"
          :product="product"
          :index="index"
          @click="emit('product-click', product)"
        />
      </div>
      <div v-else class="text-center py-20 text-stone-500 font-serif italic">
        {{
          activeCategory === "All" && products.length > 0
            ? "All items are currently sold out."
            : "No items found in this category."
        }}
      </div>
    </div>
  </div>
</template>
