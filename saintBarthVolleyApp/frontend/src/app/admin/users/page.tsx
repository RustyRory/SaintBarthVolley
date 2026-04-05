"use client";

import * as React from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resendVerification,
  type User,
  type Role,
} from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
};

type CreateForm = EditForm & { password: string; confirmPassword: string };

const EMPTY_CREATE: CreateForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
  isActive: true,
  isVerified: true,
};

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  editor: "Éditeur",
  user: "Utilisateur",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editForm, setEditForm] = React.useState<EditForm | null>(null);
  const [editSaving, setEditSaving] = React.useState(false);

  const [showCreate, setShowCreate] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<CreateForm>(EMPTY_CREATE);
  const [createSaving, setCreateSaving] = React.useState(false);
  const [createError, setCreateError] = React.useState("");

  const [resending, setResending] = React.useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    let r = users;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "all") r = r.filter((u) => u.role === roleFilter);
    return r;
  }, [users, search, roleFilter]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = React.useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      unverified: users.filter((u) => !u.isVerified).length,
    }),
    [users],
  );

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      isVerified: u.isVerified,
    });
  };

  const handleEditSave = async () => {
    if (!editingUser || !editForm) return;
    setEditSaving(true);
    try {
      const updated = await updateUser(editingUser._id, editForm);
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u)),
      );
      setEditingUser(null);
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setEditSaving(false);
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    setCreateError("");
    if (
      !createForm.firstName ||
      !createForm.lastName ||
      !createForm.email ||
      !createForm.password
    ) {
      return setCreateError(
        "Tous les champs obligatoires doivent être remplis.",
      );
    }
    if (createForm.password !== createForm.confirmPassword) {
      return setCreateError("Les mots de passe ne correspondent pas.");
    }
    if (createForm.password.length < 8) {
      return setCreateError("Mot de passe trop court (8 caractères minimum).");
    }
    setCreateSaving(true);
    try {
      const created = await createUser({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        isActive: createForm.isActive,
      });
      setUsers((prev) => [created, ...prev]);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error ? err.message : "Erreur lors de la création",
      );
    } finally {
      setCreateSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (u: User) => {
    if (!confirm(`Supprimer ${u.firstName} ${u.lastName} ?`)) return;
    try {
      await deleteUser(u._id);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  // ── Resend verification ───────────────────────────────────────────────────
  const handleResend = async (u: User) => {
    setResending(u._id);
    try {
      await resendVerification(u._id);
      alert(`Email de vérification renvoyé à ${u.email}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setResending(null);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const StatusBadge = ({ u }: { u: User }) => {
    if (!u.isVerified)
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">
          Non vérifié
        </span>
      );
    if (!u.isActive)
      return (
        <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-500 font-medium">
          Inactif
        </span>
      );
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
        Actif
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: Role }) => {
    const colors: Record<Role, string> = {
      admin: "bg-purple-100 text-purple-700",
      editor: "bg-blue-100 text-blue-700",
      user: "bg-zinc-100 text-zinc-600",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${colors[role]}`}
      >
        {ROLE_LABELS[role]}
      </span>
    );
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Actifs", value: stats.active, color: "text-green-600" },
          {
            label: "Non vérifiés",
            value: stats.unverified,
            color: "text-orange-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border rounded-lg p-4 flex flex-col gap-1"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres + actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          className="flex-1"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Éditeur</SelectItem>
            <SelectItem value="user">Utilisateur</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setShowCreate(true);
            setCreateForm(EMPTY_CREATE);
            setCreateError("");
          }}
        >
          + Nouvel utilisateur
        </Button>
      </div>

      {/* Mobile — cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((u) => (
          <div
            key={u._id}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">
                  {u.firstName} {u.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{u.email}</div>
              </div>
              <StatusBadge u={u} />
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={u.role} />
              <span className="text-xs text-muted-foreground">
                {new Date(u.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                Modifier
              </Button>
              {!u.isVerified && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResend(u)}
                  disabled={resending === u._id}
                >
                  {resending === u._id ? "Envoi..." : "Renvoyer l'email"}
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(u)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            Aucun utilisateur
          </div>
        )}
      </div>

      {/* Desktop — table */}
      <div className="hidden md:block rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Rôle</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Créé le</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((u) => (
                <tr
                  key={u._id}
                  className="border-t hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="p-3">
                    <StatusBadge u={u} />
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(u)}
                      >
                        Modifier
                      </Button>
                      {!u.isVerified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResend(u)}
                          disabled={resending === u._id}
                        >
                          {resending === u._id ? "Envoi..." : "Renvoyer email"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(u)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="h-40 text-center text-muted-foreground"
                >
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══ Modal : Modifier utilisateur ══ */}
      {editingUser && editForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">
                Modifier l&apos;utilisateur
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label>Prénom *</Label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm(
                        (p) => p && { ...p, firstName: e.target.value },
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Nom *</Label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm(
                        (p) => p && { ...p, lastName: e.target.value },
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((p) => p && { ...p, email: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(v) =>
                    setEditForm((p) => p && { ...p, role: v as Role })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Éditeur</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 border rounded-lg p-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Compte actif</div>
                    <div className="text-xs text-muted-foreground">
                      L&apos;utilisateur peut se connecter
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm((p) => p && { ...p, isActive: !p.isActive })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isActive ? "bg-green-500" : "bg-zinc-300"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${editForm.isActive ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Email vérifié</div>
                    <div className="text-xs text-muted-foreground">
                      Activer manuellement sans email
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm(
                        (p) => p && { ...p, isVerified: !p.isVerified },
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isVerified ? "bg-green-500" : "bg-zinc-300"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${editForm.isVerified ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>

              {!editingUser.isVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResend(editingUser)}
                  disabled={resending === editingUser._id}
                >
                  {resending === editingUser._id
                    ? "Envoi en cours..."
                    : "Renvoyer l'email de vérification"}
                </Button>
              )}
            </div>

            <div className="p-5 border-t flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Annuler
              </Button>
              <Button onClick={handleEditSave} disabled={editSaving}>
                {editSaving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal : Créer utilisateur ══ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">Nouvel utilisateur</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              {createError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label>Prénom *</Label>
                  <Input
                    value={createForm.firstName}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        firstName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Nom *</Label>
                  <Input
                    value={createForm.lastName}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Mot de passe *</Label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Min. 8 caractères"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Confirmer le mot de passe *</Label>
                <Input
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Rôle</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(v) =>
                    setCreateForm((p) => ({ ...p, role: v as Role }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Éditeur</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground">
                Le compte créé par un administrateur est directement actif et
                vérifié.
              </p>
            </div>

            <div className="p-5 border-t flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={createSaving}>
                {createSaving ? "Création..." : "Créer le compte"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
