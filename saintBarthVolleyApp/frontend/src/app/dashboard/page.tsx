"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur introuvable</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>
        Bienvenue {user.firstName} {user.lastName}
      </p>

      {user.role === "admin" ? <AdminPanel /> : <EditorPanel />}
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-2">Dashboard Admin</h2>
      <p>Gestion des utilisateurs (à compléter)</p>
    </div>
  );
}

function EditorPanel() {
  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-2">Dashboard Éditeur</h2>
      <p>Interface simple pour l’éditeur</p>
    </div>
  );
}
