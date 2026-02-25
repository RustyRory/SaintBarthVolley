"use client";

import { useEffect, useState } from "react";
import { getUsers, User } from "@/services/userService";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les utilisateurs.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Users</h1>

      {users.length === 0 && <p>Aucun utilisateur trouvé.</p>}

      {users.map((user) => (
        <div key={user._id}>
          {user.firstName} {user.lastName} — {user.role}
        </div>
      ))}
    </div>
  );
}
