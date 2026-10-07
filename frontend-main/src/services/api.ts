import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type { AuthResponse } from "@/types";

export const TOKEN_KEY = "ishjobs_token";
export const REFRESH_KEY = "ishjobs_refresh";
export const USER_KEY = "ishjobs_user";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(token: string, refresh?: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─────────────────────────────────────────────
// Request interceptor
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// Response interceptor — backend formatini ochish
// Backend: {statusCode, success, message, data}
// Biz: data.data ni qaytaramiz (toza ma'lumot)
// ─────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      return { ...response, data: body.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !original._retry &&
      tokenStore.getRefresh() &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            if (original.headers) {
              original.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStore.getRefresh();
        const res = await axios.post<{ data: AuthResponse }>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );
        const authData = res.data.data;
        tokenStore.set(authData.accessToken, authData.refreshToken);
        refreshQueue.forEach((cb) => cb(authData.accessToken));
        refreshQueue = [];
        if (original.headers) {
          original.headers.Authorization = `Bearer ${authData.accessToken}`;
        }
        return api(original);
      } catch {
        tokenStore.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// Xato xabarini olish
// ─────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || error.message || "Xatolik yuz berdi";
  }
  if (error instanceof Error) return error.message;
  return "Kutilmagan xatolik";
}

export default api;
