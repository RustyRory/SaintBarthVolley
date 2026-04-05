"use client";

import * as React from "react";
import { apiFetch } from "@/lib/api";
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

interface TeamRole {
  _id: string; // subdoc ObjectId
  teamId?: string; // optionnel : absent = bénévole saison sans équipe
  seasonId: string;
  roles: string[];
  isCaptain: boolean;
  position?: string;
  photo?: string;
}

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  bio?: string;
  isActive: boolean;
  teamRoles: TeamRole[];
}

interface Season {
  _id: string;
  name: string;
  isActive: boolean;
}

interface Team {
  _id: string;
  name: string;
  seasonId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  "player",
  "coach",
  "staff",
  "referee",
  "volunteer",
  "owner",
] as const;
const ROLE_LABELS: Record<string, string> = {
  player: "Joueur",
  coach: "Entraîneur",
  staff: "Staff",
  referee: "Arbitre",
  volunteer: "Bénévole",
  owner: "Dirigeant",
};

const EMPTY_MEMBER: Omit<Member, "_id"> = {
  firstName: "",
  lastName: "",
  birthDate: "",
  height: undefined,
  weight: undefined,
  bio: "",
  isActive: true,
  teamRoles: [],
};

const EMPTY_NEW_ROLE = {
  seasonId: "",
  teamId: "",
  roles: ["player"] as string[],
  isCaptain: false,
  position: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMembersPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [filtered, setFiltered] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [allTeams, setAllTeams] = React.useState<Team[]>([]);

  const [editing, setEditing] = React.useState<Partial<Member> | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [addingRole, setAddingRole] = React.useState(false);
  const [newRole, setNewRole] = React.useState(EMPTY_NEW_ROLE);

  // ── Load ──────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    Promise.all([apiFetch("/api/members"), apiFetch("/api/seasons")])
      .then(([membersData, seasonsData]) => {
        setMembers(membersData as Member[]);
        setFiltered(membersData as Member[]);
        setSeasons(seasonsData as Season[]);
      })
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (seasons.length === 0) return;
    Promise.all(seasons.map((s) => apiFetch(`/api/teams?seasonId=${s._id}`)))
      .then((results) => setAllTeams(results.flat() as Team[]))
      .catch(() => {});
  }, [seasons]);

  React.useEffect(() => {
    if (!search) return setFiltered(members);
    const q = search.toLowerCase();
    setFiltered(
      members.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q),
      ),
    );
  }, [search, members]);

  const fetchMembers = async () => {
    const data: Member[] = await apiFetch("/api/members");
    setMembers(data);
    setFiltered(data);
    return data;
  };

  // ── CRUD membres ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await apiFetch(`/api/members/${id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let updated: Member;
      if (editing._id) {
        updated = await apiFetch(`/api/members/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(editing),
        });
        setMembers((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m)),
        );
        setEditing(updated);
      } else {
        updated = await apiFetch("/api/members", {
          method: "POST",
          body: JSON.stringify(editing),
        });
        setMembers((prev) => [updated, ...prev]);
        setEditing(null);
      }
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ── Gestion des rôles ─────────────────────────────────────────────────────
  const handleAddRole = async () => {
    if (!editing?._id || !newRole.seasonId) return;
    // teamId optionnel : absent pour les bénévoles sans équipe
    const payload = {
      seasonId: newRole.seasonId,
      teamId: newRole.teamId || undefined,
      roles: newRole.roles,
      isCaptain: newRole.isCaptain,
      position: newRole.position,
    };
    try {
      await apiFetch(`/api/members/${editing._id}/roles`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await fetchMembers();
      const refreshed = data.find((m) => m._id === editing._id);
      if (refreshed) setEditing(refreshed);
      setAddingRole(false);
      setNewRole(EMPTY_NEW_ROLE);
    } catch {
      alert("Erreur lors de l'ajout");
    }
  };

  const handleRemoveRole = async (memberId: string, roleId: string) => {
    if (!confirm("Retirer cette affectation ?")) return;
    try {
      await apiFetch(`/api/members/${memberId}/roles/${roleId}`, {
        method: "DELETE",
      });
      const data = await fetchMembers();
      const refreshed = data.find((m) => m._id === memberId);
      if (refreshed) setEditing(refreshed);
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getTeamName = (teamId?: string) =>
    teamId
      ? (allTeams.find((t) => t._id === teamId)?.name ?? "Équipe inconnue")
      : "—";
  const getSeasonName = (seasonId: string) =>
    seasons.find((s) => s._id === seasonId)?.name ?? seasonId;
  const teamsForSeason = (seasonId: string) =>
    allTeams.filter((t) => t.seasonId === seasonId);

  // Rôle est "sans équipe" si volunteer/owner/staff sans teamId
  const isSeasonOnlyRole = (tr: TeamRole) => !tr.teamId;

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          className="flex-1"
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setEditing({ ...EMPTY_MEMBER })}>
          + Nouveau membre
        </Button>
      </div>

      {/* Mobile — cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((m) => (
          <div
            key={m._id}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                {m.firstName} {m.lastName}
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
              >
                {m.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
            {m.birthDate && (
              <div className="text-sm text-muted-foreground">
                {new Date(m.birthDate).toLocaleDateString("fr-FR")}
              </div>
            )}
            {m.teamRoles?.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {m.teamRoles.map((tr) => getTeamName(tr.teamId)).join(", ")}
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="outline" onClick={() => setEditing(m)}>
                Modifier
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(m._id)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            Aucun membre
          </div>
        )}
      </div>

      {/* Desktop — table */}
      <div className="hidden md:block rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Naissance</th>
              <th className="p-3 text-left">Taille / Poids</th>
              <th className="p-3 text-left">Affectations</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((m) => (
                <tr key={m._id} className="border-t">
                  <td className="p-3 font-medium">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="p-3">
                    {m.birthDate
                      ? new Date(m.birthDate).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {m.height ? `${m.height} cm` : "-"} /{" "}
                    {m.weight ? `${m.weight} kg` : "-"}
                  </td>
                  <td className="p-3">
                    {m.teamRoles?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {m.teamRoles.map((tr) => (
                          <span
                            key={tr._id}
                            className={`px-1.5 py-0.5 rounded text-xs ${tr.teamId ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}
                          >
                            {tr.teamId
                              ? getTeamName(tr.teamId)
                              : `Bénévole · ${getSeasonName(tr.seasonId)}`}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                    >
                      {m.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(m)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(m._id)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="h-40 text-center text-muted-foreground"
                >
                  Aucun membre trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ══ Modal édition / création ══ */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl flex flex-col gap-5 max-h-[90vh]">
            <div className="p-6 pb-0 shrink-0">
              <h2 className="text-xl font-bold">
                {editing._id
                  ? `${editing.firstName} ${editing.lastName}`
                  : "Nouveau membre"}
              </h2>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-6">
              {/* Infos de base */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Informations
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label>Prénom *</Label>
                    <Input
                      value={editing.firstName || ""}
                      onChange={(e) =>
                        setEditing(
                          (p) => p && { ...p, firstName: e.target.value },
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Nom *</Label>
                    <Input
                      value={editing.lastName || ""}
                      onChange={(e) =>
                        setEditing(
                          (p) => p && { ...p, lastName: e.target.value },
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Date de naissance</Label>
                  <Input
                    type="date"
                    value={editing.birthDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditing(
                        (p) => p && { ...p, birthDate: e.target.value },
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label>Taille (cm)</Label>
                    <Input
                      type="number"
                      value={editing.height || ""}
                      onChange={(e) =>
                        setEditing(
                          (p) =>
                            p && {
                              ...p,
                              height: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Poids (kg)</Label>
                    <Input
                      type="number"
                      value={editing.weight || ""}
                      onChange={(e) =>
                        setEditing(
                          (p) =>
                            p && {
                              ...p,
                              weight: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Bio</Label>
                  <textarea
                    className="border rounded px-3 py-2 text-sm resize-none h-20 bg-background"
                    value={editing.bio || ""}
                    onChange={(e) =>
                      setEditing((p) => p && { ...p, bio: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editing.isActive ?? true}
                    onChange={(e) =>
                      setEditing(
                        (p) => p && { ...p, isActive: e.target.checked },
                      )
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">Membre actif</Label>
                </div>
              </section>

              {/* Affectations — seulement si membre existant */}
              {editing._id && (
                <section className="flex flex-col gap-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Affectations
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Équipe ou bénévolat pour une saison
                      </p>
                    </div>
                    {!addingRole && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingRole(true)}
                      >
                        + Ajouter
                      </Button>
                    )}
                  </div>

                  {(editing.teamRoles ?? []).length === 0 && !addingRole && (
                    <p className="text-sm text-muted-foreground">
                      Aucune affectation.
                    </p>
                  )}

                  {(editing.teamRoles ?? []).map((tr) => (
                    <div
                      key={tr._id}
                      className="flex items-start justify-between border rounded p-3 gap-3"
                    >
                      <div className="flex flex-col gap-0.5 text-sm min-w-0">
                        <div className="font-medium">
                          {isSeasonOnlyRole(tr) ? (
                            <span className="text-orange-700">
                              Club (sans équipe)
                            </span>
                          ) : (
                            getTeamName(tr.teamId)
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getSeasonName(tr.seasonId)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tr.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")}
                          {tr.isCaptain && " · Capitaine"}
                          {tr.position && ` · ${tr.position}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 shrink-0"
                        onClick={() => handleRemoveRole(editing._id!, tr._id)}
                      >
                        Retirer
                      </Button>
                    </div>
                  ))}

                  {addingRole && (
                    <div className="border rounded p-4 flex flex-col gap-3 bg-muted/20">
                      {/* Saison */}
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Saison *</Label>
                        <Select
                          value={newRole.seasonId}
                          onValueChange={(v) =>
                            setNewRole((p) => ({
                              ...p,
                              seasonId: v,
                              teamId: "",
                            }))
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Choisir une saison..." />
                          </SelectTrigger>
                          <SelectContent>
                            {seasons.map((s) => (
                              <SelectItem key={s._id} value={s._id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Équipe — optionnelle */}
                      {newRole.seasonId && (
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">
                            Équipe{" "}
                            <span className="text-muted-foreground">
                              (laisser vide si bénévole sans équipe)
                            </span>
                          </Label>
                          <Select
                            value={newRole.teamId || "__none__"}
                            onValueChange={(v) =>
                              setNewRole((p) => ({
                                ...p,
                                teamId: v === "__none__" ? "" : v,
                              }))
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">
                                — Sans équipe (bénévole club) —
                              </SelectItem>
                              {teamsForSeason(newRole.seasonId).map((t) => (
                                <SelectItem key={t._id} value={t._id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">Rôle *</Label>
                          <Select
                            value={newRole.roles[0]}
                            onValueChange={(v) =>
                              setNewRole((p) => ({ ...p, roles: [v] }))
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">Poste</Label>
                          <Input
                            className="h-9"
                            placeholder="Ex: Libéro"
                            value={newRole.position}
                            onChange={(e) =>
                              setNewRole((p) => ({
                                ...p,
                                position: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {newRole.teamId && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isCaptain"
                            checked={newRole.isCaptain}
                            onChange={(e) =>
                              setNewRole((p) => ({
                                ...p,
                                isCaptain: e.target.checked,
                              }))
                            }
                            className="h-4 w-4"
                          />
                          <Label htmlFor="isCaptain" className="text-sm">
                            Capitaine de l&apos;équipe
                          </Label>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAddingRole(false);
                            setNewRole(EMPTY_NEW_ROLE);
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddRole}
                          disabled={!newRole.seasonId}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setAddingRole(false);
                  }}
                >
                  {editing._id ? "Fermer" : "Annuler"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !editing.firstName || !editing.lastName}
                >
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
