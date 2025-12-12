<script setup>
/**
 * CollectionView - 商品列表頁
 */
import { inject } from "vue";
import CollectionSection from "../components/CollectionSection.vue";

// 從 App.vue 注入資料
const products = inject("products");
const categories = inject("categories");

// 從 App.vue 注入方法
const handleProductClick = inject("handleProductClick");
</script>

<template>
  <div class="pt-24">
    <CollectionSection
      :products="products"
      :categories="categories"
      @product-click="handleProductClick"
    />
  </div>
</template>
