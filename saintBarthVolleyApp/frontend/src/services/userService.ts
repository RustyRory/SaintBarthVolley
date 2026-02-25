import { apiFetch } from "@/lib/api";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function getUsers(): Promise<User[]> {
  return apiFetch("/api/users");
}

export function createUser(data: Partial<User>) {
  return apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
