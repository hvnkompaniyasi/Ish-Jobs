import api, { tokenStore, USER_KEY } from "./api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  UserRole,
} from "@/types";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    if (data.accessToken) {
      tokenStore.set(data.accessToken, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    if (data.accessToken) {
      tokenStore.set(data.accessToken, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async updateProfile(payload: { firstName?: string; lastName?: string }): Promise<User> {
    const { data } = await api.patch<User>("/auth/me", payload);
    this.setCachedUser(data);
    return data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.patch("/auth/change-password", { oldPassword, newPassword });
  },

  async switchRole(role: UserRole): Promise<User> {
    const { data } = await api.patch<User>("/auth/switch-role", { role });
    this.setCachedUser(data);
    return data;
  },

  async deleteAccount(password: string): Promise<void> {
    await api.delete("/auth/me", { data: { password } });
    tokenStore.clear();
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStore.getRefresh();
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // ignore
    }
    tokenStore.clear();
  },

  getCachedUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  setCachedUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};
