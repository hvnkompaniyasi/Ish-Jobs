export type UserRole = "seeker" | "employer" | "admin";

export interface CompanyInfo {
  name?: string | null;
  logo?: string | null;
  website?: string | null;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  roles: UserRole[];
  activeRole: UserRole;
  avatar?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  company?: CompanyInfo;
  bio?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  role?: UserRole;
  company?: { name: string };
}
