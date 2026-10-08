"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, tokenStore, getErrorMessage } from "@/services";
import type { LoginPayload, RegisterPayload, User, UserRole } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string }) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<User>;
  switchRole: (role: UserRole) => Promise<User>;
  deleteAccount: (password: string) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = tokenStore.get();
        if (!token) {
          setUser(null);
          return;
        }
        const cached = authService.getCachedUser();
        if (cached) setUser(cached);
        try {
          const fresh = await authService.getMe();
          setUser(fresh);
          authService.setCachedUser(fresh);
        } catch {
          tokenStore.clear();
          setUser(null);
        }
      } finally {
        setLoading(false);
        setHydrated(true);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setError(null);
    try {
      const { user: u } = await authService.login(payload);
      setUser(u);
      return u;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setError(null);
    try {
      const { user: u } = await authService.register(payload);
      setUser(u);
      return u;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authService.getMe();
      setUser(fresh);
      authService.setCachedUser(fresh);
    } catch {
      await logout();
    }
  }, [logout]);

  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string }) => {
    setError(null);
    try {
      const updated = await authService.updateProfile(data);
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setError(null);
    try {
      await authService.changePassword(oldPassword, newPassword);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setError(null);
    try {
      const updated = await authService.uploadAvatar(file);
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    setError(null);
    try {
      const updated = await authService.switchRole(role);
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    setError(null);
    try {
      await authService.deleteAccount(password);
      setUser(null);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user, loading, hydrated, error,
      isAuthenticated: !!user,
      login, register, logout, refreshUser,
      updateProfile, changePassword, uploadAvatar, switchRole, deleteAccount, clearError,
    }),
    [user, loading, hydrated, error, login, register, logout, refreshUser,
     updateProfile, changePassword, switchRole, deleteAccount, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
