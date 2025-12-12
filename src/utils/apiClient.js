/**
 * API Client Utility
 * 使用 axios 處理統一的 API 請求、JWT token、錯誤處理
 */
import axios from "axios";

// API Base URL - 從環境變數讀取，預設為開發環境
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/chooseMVP/api";

// Token 儲存 key
const TOKEN_KEY = "komorebi_auth_token";

/**
 * 取得儲存的 JWT token
 * @returns {string | null}
 */
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 儲存 JWT token
 * @param {string} token
 */
export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * 移除 JWT token
 */
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// 建立 axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 支援 CORS with credentials
});

// Request 攔截器 - 自動加入 Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 攔截器 - 處理錯誤和解析 ApiResponse
apiClient.interceptors.response.use(
  (response) => {
    // 解析 ApiResponse 格式
    const result = response.data;
    if (!result.success) {
      return Promise.reject(new Error(result.message || "API request failed"));
    }
    return result.data;
  },
  (error) => {
    let errorMessage = "Network error";

    if (error.response) {
      const { status, data } = error.response;
      errorMessage =
        data?.message || `HTTP ${status}: ${error.response.statusText}`;

      // 401 Unauthorized - token 過期或無效
      if (status === 401) {
        removeToken();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      }
    }

    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * GET 請求
 * @template T
 * @param {string} endpoint
 * @returns {Promise<T>}
 */
export async function apiGet(endpoint) {
  return apiClient.get(endpoint);
}

/**
 * POST 請求
 * @template T
 * @param {string} endpoint
 * @param {unknown} [body]
 * @returns {Promise<T>}
 */
export async function apiPost(endpoint, body) {
  return apiClient.post(endpoint, body);
}

/**
 * PUT 請求
 * @template T
 * @param {string} endpoint
 * @param {unknown} [body]
 * @returns {Promise<T>}
 */
export async function apiPut(endpoint, body) {
  return apiClient.put(endpoint, body);
}

/**
 * PATCH 請求
 * @template T
 * @param {string} endpoint
 * @param {unknown} [body]
 * @returns {Promise<T>}
 */
export async function apiPatch(endpoint, body) {
  return apiClient.patch(endpoint, body);
}

/**
 * DELETE 請求
 * @template T
 * @param {string} endpoint
 * @returns {Promise<T>}
 */
export async function apiDelete(endpoint) {
  return apiClient.delete(endpoint);
}

// 導出 axios instance 供特殊用途
export { apiClient };
