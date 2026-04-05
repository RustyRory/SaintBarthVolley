import { apiFetch } from "./api";

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "editor" | "user";
  isActive: boolean;
  isVerified: boolean;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiFetch<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),

  me: () => apiFetch<AuthUser>("/api/auth/me"),

  resendVerification: (email: string) =>
    apiFetch("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};
