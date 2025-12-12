<script setup>
/**
 * HomeView - 首頁
 * 包含 Hero 和 New Arrivals 區塊
 */
import { inject } from "vue";
import Hero from "../components/Hero.vue";
import NewArrivalsSection from "../components/NewArrivalsSection.vue";

// 從 App.vue 注入資料
const newArrivalsProducts = inject("newArrivalsProducts");

// 從 App.vue 注入方法
const handleProductClick = inject("handleProductClick");
</script>

<template>
  <div>
    <Hero />
    <NewArrivalsSection
      :products="newArrivalsProducts"
      @product-click="handleProductClick"
    />
  </div>
</template>
