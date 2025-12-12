/**
 * Vue Router 設定
 * 包含路由定義和權限驗證
 */
import { createRouter, createWebHistory } from "vue-router";
import { getToken } from "../utils/apiClient.js";

// Views - 懶加載
const HomeView = () => import("../views/HomeView.vue");
const CollectionView = () => import("../views/CollectionView.vue");
const ProductView = () => import("../views/ProductView.vue");
const ContactView = () => import("../views/ContactView.vue");
const CheckoutView = () => import("../views/CheckoutView.vue");
const AdminView = () => import("../views/AdminView.vue");

// 路由定義
const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { title: "Choose - 選擇有品味的生活" },
  },
  {
    path: "/collection",
    name: "collection",
    component: CollectionView,
    meta: { title: "Collection - Choose" },
  },
  {
    path: "/product/:slug",
    name: "product",
    component: ProductView,
    meta: { title: "Product - Choose" },
  },
  {
    path: "/contact",
    name: "contact",
    component: ContactView,
    meta: { title: "Contact - Choose" },
  },
  {
    path: "/checkout",
    name: "checkout",
    component: CheckoutView,
    meta: { title: "Checkout - Choose", requiresAuth: true },
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminView,
    meta: { title: "Admin Dashboard - Choose", requiresAdmin: true },
  },
];

// 建立 Router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// 用於存儲用戶資料的 getter (由 App.vue 提供)
let getUserFn = null;

/**
 * 設定取得用戶的函數
 * @param {Function} fn
 */
export const setGetUserFunction = (fn) => {
  getUserFn = fn;
};

// Navigation Guard - 權限驗證
router.beforeEach(async (to, from, next) => {
  // 更新頁面標題
  document.title = to.meta.title || "Choose";

  const token = getToken();
  const user = getUserFn ? getUserFn() : null;

  // 需要 Admin 權限的路由
  if (to.meta.requiresAdmin) {
    if (!token) {
      // 未登入 - 重導向首頁並顯示登入
      next({
        path: "/",
        query: { showLogin: "true", redirect: to.fullPath },
      });
      return;
    }

    if (!user || user.role !== "ADMIN") {
      // 已登入但非 Admin - 重導向首頁
      next({
        path: "/",
        query: { error: "unauthorized" },
      });
      return;
    }
  }

  // 需要登入的路由
  if (to.meta.requiresAuth && !token) {
    next({
      path: "/",
      query: { showLogin: "true", redirect: to.fullPath },
    });
    return;
  }

  next();
});

export default router;
