"use client";

import * as React from "react";
import { getUsers, type User } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  React.useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let result = users;

    // 🔎 Recherche nom/email
    if (search) {
      result = result.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    // 🎭 Filtre rôle
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  if (loading) return <div>Chargement des utilisateurs...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>

      {/* 🔎 Filtres */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 📋 Table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Rôle</th>
              <th className="p-3 text-left">Actif</th>
              <th className="p-3 text-left">Créé le</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-3">
                  {user.firstName} {user.lastName}
                </td>

                <td className="p-3">{user.email}</td>

                <td className="p-3 capitalize">{user.role}</td>

                <td className="p-3">{user.isActive ? "✅ Oui" : "❌ Non"}</td>

                <td className="p-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">
                  <Button size="sm" variant="outline">
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
