"use client";

import * as React from "react";
import { getUsers, deleteUser, type User } from "@/services/userService";
import { UserForm } from "@/components/dashboard/admin/users-form";
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
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

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

    if (search) {
      result = result.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>

      {/* 🔎 Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          className="w-full"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Rôle" />
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

      {/* 📱 MOBILE → CARD VIEW */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="font-semibold">
              {user.firstName} {user.lastName}
            </div>

            <div className="text-sm text-muted-foreground">{user.email}</div>

            <div className="text-sm">
              Rôle : <span className="capitalize">{user.role}</span>
            </div>

            <div className="text-sm">
              Actif : {user.isActive ? "Oui" : "Non"}
            </div>

            <div className="text-xs text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingUser(user)}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(user._id)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center text-muted-foreground py-10 md:hidden">
            Aucun utilisateur
          </div>
        )}
      </div>

      {/* 💻 DESKTOP → TABLE */}
      <div className="hidden md:flex flex-col flex-1 rounded-lg border">
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-3">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3">{user.isActive ? "Oui" : "Non"}</td>
                  <td className="p-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user._id)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="h-60">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <p className="text-sm">Aucun utilisateur</p>
                    <p className="text-xs">Commencez par en créer un</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📝 Modal */}
      {editingUser && (
        <UserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updatedUser) => {
            setUsers((prev) =>
              prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
            );
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}
