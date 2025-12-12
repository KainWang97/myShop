<script setup>
/**
 * AdminView - 管理後台頁面
 * 只有 ADMIN 角色可以存取
 */
import { inject, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AdminDashboard from "../components/AdminDashboard.vue";

const route = useRoute();

// 從 App.vue 注入資料
const products = inject("products");
const categories = inject("categories");
const allOrders = inject("allOrders");
const inquiries = inject("inquiries");
const featuredProductIds = inject("featuredProductIds");

// 從 App.vue 注入方法
const handleUpdateOrderStatus = inject("handleUpdateOrderStatus");
const handleReplyInquiry = inject("handleReplyInquiry");
const handleCreateProduct = inject("handleCreateProduct");
const handleUpdateProduct = inject("handleUpdateProduct");
const handleDeleteProduct = inject("handleDeleteProduct");
const handleUploadImage = inject("handleUploadImage");
const handleCreateCategory = inject("handleCreateCategory");
const handleUpdateCategory = inject("handleUpdateCategory");
const handleDeleteCategory = inject("handleDeleteCategory");
const handleCreateVariant = inject("handleCreateVariant");
const handleUpdateVariant = inject("handleUpdateVariant");
const handleDeleteVariant = inject("handleDeleteVariant");
const handleToggleFeatured = inject("handleToggleFeatured");

// 初始 Tab (可從 query 參數設定)
const adminInitialTab = ref("INVENTORY");

watch(
  () => route.query.tab,
  (tab) => {
    if (tab) {
      adminInitialTab.value = tab.toUpperCase();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="pt-24 min-h-screen bg-stone-50">
    <AdminDashboard
      :products="products"
      :categories="categories"
      :orders="allOrders"
      :inquiries="inquiries"
      :featured-product-ids="featuredProductIds"
      :initial-tab="adminInitialTab"
      @update-order-status="handleUpdateOrderStatus"
      @reply-inquiry="handleReplyInquiry"
      @create-product="handleCreateProduct"
      @update-product="handleUpdateProduct"
      @delete-product="handleDeleteProduct"
      @upload-image="handleUploadImage"
      @create-category="handleCreateCategory"
      @update-category="handleUpdateCategory"
      @delete-category="handleDeleteCategory"
      @create-variant="handleCreateVariant"
      @update-variant="handleUpdateVariant"
      @delete-variant="handleDeleteVariant"
      @toggle-featured="handleToggleFeatured"
    />
  </div>
</template>
