import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

// ═══════════════════════════════════════════════════════════
// TOKEN STORE
// ═══════════════════════════════════════════════════════════
export const TOKEN_KEY = "ishjobs_token";
export const REFRESH_KEY = "ishjobs_refresh_token";
export const USER_KEY = "ishjobs_user";

const isBrowser = () => typeof window !== "undefined";

export const tokenStore = {
  get(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(token: string, refresh?: string) {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  setUser(user: unknown) {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
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
  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
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
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════
// SILENT REFRESH WITH QUEUE
// ───────────────────────────────────────────────────────────
// Agar bir vaqtda 5 ta so'rov 401 qaytarsa — faqat 1 marta
// refresh qilamiz, qolganlari navbatda kutadi.
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

  // To'g'ridan-to'g'ri axios (interceptor chetlab o'tiladi)
  const res = await axios.post<{
    data?: { token?: string; accessToken?: string; refreshToken?: string };
    token?: string;
    accessToken?: string;
    refreshToken?: string;
  }>(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    },
  );

  const body = res.data;
  const newAccess =
    body?.data?.token ?? body?.data?.accessToken ?? body?.token ?? body?.accessToken;
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
    // Login/Register sahifasida bo'lmasa — yo'naltirish
    if (path !== "/login" && path !== "/register") {
      const next = encodeURIComponent(path + window.location.search);
      window.location.href = `/login?next=${next}`;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR — 401 bo'lsa silent refresh
// ═══════════════════════════════════════════════════════════
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    // Refresh endpointining o'zida 401 bo'lsa — qayta urinmaymiz
    const isRefreshCall = original?.url?.includes("/auth/refresh");
    const isAuthCall =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register");

    // Faqat 401, bir marta retry, va auth/refresh emas
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

    // ─── Agar refresh jarayoni ketayotgan bo'lsa — navbatga qo'shamiz ───
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

    // ─── Birinchi 401 — refresh boshlaymiz ───
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
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: Array<{ message?: string }> }
      | undefined;
    return (
      data?.message ||
      data?.errors?.[0]?.message ||
      err.message ||
      "Xatolik yuz berdi"
    );
  }
  if (err instanceof Error) return err.message;
  return "Xatolik yuz berdi";
}

export default api;
