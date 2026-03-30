"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { updateUser, type User, type Role } from "@/services/userService";
import { Label } from "@/components/ui/label";

interface UserFormProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const UserForm = ({ user, onClose, onSave }: UserFormProps) => {
  const [form, setForm] = React.useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean;
  }>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });

  const [loading, setLoading] = React.useState(false);

  // Changement input classique
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Changement rôle
  const handleRoleChange = (role: string) => {
    setForm((prev) => ({ ...prev, role: role as Role }));
  };

  // Changement actif
  const handleActiveChange = () => {
    setForm((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateUser(user._id, form);
      onSave(updatedUser);
      onClose(); // si tu veux fermer la modal après sauvegarde
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold">Modifier l&apos;utilisateur</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Rôle</Label>
          <Select value={form.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={handleActiveChange}
            />
            <span className="ml-2">Actif</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </form>
    </div>
  );
};
