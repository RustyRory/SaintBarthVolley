import { apiFetch } from "@/lib/api";

export type User = {
  _id: string;
  email: string;
  role: "admin" | "editor" | "user" | "other";
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export function getUsers(): Promise<User[]> {
  return apiFetch("/api/users");
}

export function createUser(data: Partial<User>) {
  return apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
