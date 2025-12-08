/**
 * API Client Utility
 * 處理統一的 API 請求、JWT token、錯誤處理
 */

// API Base URL - 從環境變數讀取，預設為開發環境
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/chooseMVP/api";

// Token 儲存 key
const TOKEN_KEY = "komorebi_auth_token";

/**
 * 取得儲存的 JWT token
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 儲存 JWT token
 */
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * 移除 JWT token
 */
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * 後端 ApiResponse 格式
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * 統一的 API 請求函數
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // 如果有 token，加入 Authorization header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // 支援 CORS with credentials
  });

  // 處理 HTTP 錯誤狀態
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData: ApiResponse<null> = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // 如果回應不是 JSON，使用預設錯誤訊息
    }

    // 401 Unauthorized - token 過期或無效
    if (response.status === 401) {
      removeToken();
      // 可以觸發登出事件或重導向到登入頁
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }

    throw new Error(errorMessage);
  }

  // 解析 ApiResponse 格式
  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.message || "API request failed");
  }

  return result.data;
}

/**
 * GET 請求
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

/**
 * POST 請求
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 請求
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH 請求
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 請求
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}

