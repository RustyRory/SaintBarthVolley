import { apiFetch } from "@/lib/api";

export type Role = "admin" | "editor" | "user";

export type User = {
  _id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
};

export const getUsers = (): Promise<User[]> => apiFetch("/api/admin/users");

export const createUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
}): Promise<User> =>
  apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(data) });

export const updateUser = (id: string, data: Partial<User>): Promise<User> =>
  apiFetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteUser = (id: string): Promise<void> =>
  apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });

export const resendVerification = (id: string): Promise<{ message: string }> =>
  apiFetch(`/api/admin/users/${id}/resend-verification`, { method: "POST" });
