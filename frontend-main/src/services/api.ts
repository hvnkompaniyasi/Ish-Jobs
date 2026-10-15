import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { AuthResponse } from "@/types";

// ═══════════════════════════════════════════════════════════
// TOKEN STORE
// ═══════════════════════════════════════════════════════════
export const TOKEN_KEY = "ishjobs_token";
export const REFRESH_KEY = "ishjobs_refresh"; // ← eski qiymat (foydalanuvchilar tokenni yo'qotmasin)
export const USER_KEY = "ishjobs_user";

const isBrowser = () => typeof window !== "undefined";

export const tokenStore = {
  get(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (!isBrowser()) return null;
    // Yangi kalitni birinchi, keyin eskisini sinab ko'ramiz
    return (
      localStorage.getItem(REFRESH_KEY) ||
      localStorage.getItem("ishjobs_refresh_token")
    );
  },
  set(token: string, refresh?: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  setUser(user: unknown): void {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  },
  getUser<T = unknown>(): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("ishjobs_refresh_token");
    localStorage.removeItem(USER_KEY);
  },
};

// ═══════════════════════════════════════════════════════════
// API URL
// ═══════════════════════════════════════════════════════════
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ═══════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ═══════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR — token qo'shish
// ═══════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════
// SILENT REFRESH WITH QUEUE
// ═══════════════════════════════════════════════════════════
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  // Interceptorni chetlab o'tib, to'g'ridan-to'g'ri so'rov
  const res = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    },
  );
  const body = res.data as {
    data?: { token?: string; accessToken?: string; refreshToken?: string };
    token?: string;
    accessToken?: string;
    refreshToken?: string;
  };

  const newAccess =
    body?.data?.token ??
    body?.data?.accessToken ??
    body?.token ??
    body?.accessToken;
  const newRefresh =
    body?.data?.refreshToken ?? body?.refreshToken ?? refreshToken;

  if (!newAccess) {
    throw new Error("Refresh response missing access token");
  }

  tokenStore.set(newAccess, newRefresh);
  return newAccess;
}

function forceLogout() {
  tokenStore.clear();
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path !== "/login" && path !== "/register") {
      const next = encodeURIComponent(path + window.location.search);
      window.location.href = `/login?next=${next}`;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR — backend formatini ochish + silent refresh
// ═══════════════════════════════════════════════════════════
api.interceptors.response.use(
  (response) => {
    // Backend formatini ochish: {statusCode, success, message, data} → data
    const d = response.data;
    if (
      d &&
      typeof d === "object" &&
      "success" in d &&
      "data" in d
    ) {
      response.data = d.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    const isRefreshCall = original?.url?.includes("/auth/refresh");
    const isAuthCall =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register");

    // Faqat 401, bir marta retry, auth endpoint emas
    if (
      status !== 401 ||
      !original ||
      original._retry ||
      isRefreshCall ||
      isAuthCall
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    // Refresh davom etayotgan bo'lsa — navbatga qo'shamiz
    if (isRefreshing && refreshPromise) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    // Birinchi 401 — refresh boshlaymiz
    isRefreshing = true;
    refreshPromise = refreshAccessToken();

    try {
      const newToken = await refreshPromise;
      flushQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      flushQueue(err, null);
      forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  },
);

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; errors?: Array<{ message?: string }> }
      | undefined;
    return (
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      error.message ||
      "Xatolik yuz berdi"
    );
  }
  if (error instanceof Error) return error.message;
  return "Kutilmagan xatolik";
}

export default api;
export type { AuthResponse };
