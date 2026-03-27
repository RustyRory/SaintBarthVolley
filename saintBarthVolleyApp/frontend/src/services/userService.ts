// services/userService.ts
import { apiFetch } from "@/lib/api";

export type Role = "admin" | "editor" | "user" | "other";

export type User = {
  _id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  isVerified: boolean;
};

// Récupérer tous les utilisateurs
export function getUsers(): Promise<User[]> {
  return apiFetch("/api/admin/users");
}

// Créer un utilisateur
export function createUser(data: Partial<User>) {
  return apiFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Mettre à jour un utilisateur complet
export function updateUser(id: string, data: Partial<User>): Promise<User> {
  return apiFetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Mettre à jour uniquement le rôle
export function updateUserRole(id: string, role: Role) {
  return apiFetch(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

// Activer / désactiver un utilisateur
export function toggleUserActive(id: string, isActive: boolean) {
  return apiFetch(`/api/admin/users/${id}/activate`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// Supprimer un utilisateur
export function deleteUser(id: string) {
  return apiFetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}
