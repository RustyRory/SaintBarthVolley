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

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  bio?: string;
  isActive: boolean;
}

interface Season {
  _id: string;
  name: string;
}

interface ClubAssignment {
  _id: string;
  memberId: string;
  seasonId: { _id: string; name: string } | string;
  role: string;
  customTitle?: string;
}

interface TeamAssignment {
  _id: string;
  teamId: { _id: string; name: string } | string;
  seasonId: { _id: string; name: string } | string;
  role: string;
  position?: string;
  isCaptain?: boolean;
  jerseyNumber?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CLUB_ROLES = [
  "president",
  "vice_president",
  "secretary",
  "treasurer",
  "communication",
  "sport_manager",
  "event_manager",
  "equipment_manager",
  "referee",
  "volunteer",
  "other",
] as const;

const CLUB_ROLE_LABELS: Record<string, string> = {
  president: "Président",
  vice_president: "Vice-président",
  secretary: "Secrétaire",
  treasurer: "Trésorier",
  communication: "Responsable communication",
  sport_manager: "Responsable sportif",
  event_manager: "Responsable événements",
  equipment_manager: "Responsable matériel",
  referee: "Arbitre",
  volunteer: "Bénévole",
  other: "Autre",
};

const TEAM_ROLE_LABELS: Record<string, string> = {
  player: "Joueur",
  coach: "Entraîneur",
  assistant_coach: "Assistant entraîneur",
};

const EMPTY_MEMBER: Omit<Member, "_id"> = {
  firstName: "",
  lastName: "",
  birthDate: "",
  bio: "",
  isActive: true,
};

const EMPTY_CLUB_ASSIGNMENT = {
  seasonId: "",
  role: "volunteer" as string,
  customTitle: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMembersPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [filtered, setFiltered] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [seasons, setSeasons] = React.useState<Season[]>([]);

  const [editing, setEditing] = React.useState<Partial<Member> | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [clubAssignments, setClubAssignments] = React.useState<
    ClubAssignment[]
  >([]);
  const [teamAssignments, setTeamAssignments] = React.useState<
    TeamAssignment[]
  >([]);
  const [addingClubRole, setAddingClubRole] = React.useState(false);
  const [newClubRole, setNewClubRole] = React.useState(EMPTY_CLUB_ASSIGNMENT);

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

  const fetchMemberAssignments = async (memberId: string) => {
    const [club, team] = await Promise.all([
      apiFetch<ClubAssignment[]>(
        `/api/club-assignments?memberId=${memberId}`,
      ).catch(() => [] as ClubAssignment[]),
      apiFetch<TeamAssignment[]>(
        `/api/team-assignments?memberId=${memberId}`,
      ).catch(() => [] as TeamAssignment[]),
    ]);
    setClubAssignments(club);
    setTeamAssignments(team);
  };

  const openEdit = (m: Member | Partial<Member>) => {
    setEditing(m);
    setAddingClubRole(false);
    setNewClubRole(EMPTY_CLUB_ASSIGNMENT);
    setClubAssignments([]);
    setTeamAssignments([]);
    if ((m as Member)._id) fetchMemberAssignments((m as Member)._id);
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
      if (editing._id) {
        const updated: Member = await apiFetch(`/api/members/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(editing),
        });
        setMembers((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m)),
        );
        setEditing(updated);
      } else {
        const created: Member = await apiFetch("/api/members", {
          method: "POST",
          body: JSON.stringify(editing),
        });
        await fetchMembers();
        setEditing(created);
        fetchMemberAssignments(created._id);
      }
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ── Club assignments ───────────────────────────────────────────────────────
  const handleAddClubRole = async () => {
    if (!editing?._id || !newClubRole.seasonId) return;
    try {
      await apiFetch("/api/club-assignments", {
        method: "POST",
        body: JSON.stringify({
          memberId: editing._id,
          seasonId: newClubRole.seasonId,
          role: newClubRole.role,
          customTitle: newClubRole.customTitle || undefined,
        }),
      });
      await fetchMemberAssignments(editing._id);
      setAddingClubRole(false);
      setNewClubRole(EMPTY_CLUB_ASSIGNMENT);
    } catch {
      alert("Erreur lors de l'ajout");
    }
  };

  const handleRemoveClubRole = async (assignmentId: string) => {
    if (!confirm("Retirer cette affectation ?")) return;
    try {
      await apiFetch(`/api/club-assignments/${assignmentId}`, {
        method: "DELETE",
      });
      setClubAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getLabel = (
    obj: { _id: string; name: string } | string,
    fallback: string,
  ) => (typeof obj === "object" ? obj.name : fallback);

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
        <Button onClick={() => openEdit({ ...EMPTY_MEMBER })}>
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
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
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
              <th className="p-3 text-left">Bio</th>
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
                  <td className="p-3 text-muted-foreground max-w-xs truncate">
                    {m.bio || "-"}
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
                      onClick={() => openEdit(m)}
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
                  colSpan={5}
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
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 pb-0 shrink-0">
              <h2 className="text-xl font-bold">
                {editing._id
                  ? `${editing.firstName} ${editing.lastName}`
                  : "Nouveau membre"}
              </h2>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-6 mt-5">
              {/* ── Informations ── */}
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

              {/* ── Rôles au club (ClubAssignment) — après création uniquement ── */}
              {editing._id && (
                <>
                  <section className="flex flex-col gap-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Rôles au club
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Fonctions au sein du club (hors équipe)
                        </p>
                      </div>
                      {!addingClubRole && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddingClubRole(true)}
                        >
                          + Ajouter
                        </Button>
                      )}
                    </div>

                    {clubAssignments.length === 0 && !addingClubRole && (
                      <p className="text-sm text-muted-foreground">
                        Aucun rôle au club.
                      </p>
                    )}

                    {clubAssignments.map((a) => (
                      <div
                        key={a._id}
                        className="flex items-start justify-between border rounded p-3 gap-3"
                      >
                        <div className="flex flex-col gap-0.5 text-sm min-w-0">
                          <div className="font-medium">
                            {a.role === "other" && a.customTitle
                              ? a.customTitle
                              : (CLUB_ROLE_LABELS[a.role] ?? a.role)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getLabel(
                              a.seasonId as
                                | { _id: string; name: string }
                                | string,
                              String(a.seasonId),
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 shrink-0"
                          onClick={() => handleRemoveClubRole(a._id)}
                        >
                          Retirer
                        </Button>
                      </div>
                    ))}

                    {addingClubRole && (
                      <div className="border rounded p-4 flex flex-col gap-3 bg-muted/20">
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">Saison *</Label>
                          <Select
                            value={newClubRole.seasonId}
                            onValueChange={(v) =>
                              setNewClubRole((p) => ({ ...p, seasonId: v }))
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
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">Rôle *</Label>
                          <Select
                            value={newClubRole.role}
                            onValueChange={(v) =>
                              setNewClubRole((p) => ({ ...p, role: v }))
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CLUB_ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {CLUB_ROLE_LABELS[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {newClubRole.role === "other" && (
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs">
                              Titre personnalisé
                            </Label>
                            <Input
                              className="h-9"
                              placeholder="Ex: Responsable transport"
                              value={newClubRole.customTitle}
                              onChange={(e) =>
                                setNewClubRole((p) => ({
                                  ...p,
                                  customTitle: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAddingClubRole(false);
                              setNewClubRole(EMPTY_CLUB_ASSIGNMENT);
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleAddClubRole}
                            disabled={!newClubRole.seasonId}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* ── Affectations équipe (lecture seule) ── */}
                  {teamAssignments.length > 0 && (
                    <section className="flex flex-col gap-3 border-t pt-4">
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Affectations équipe
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Gérez ces affectations depuis la page de
                          l&apos;équipe.
                        </p>
                      </div>
                      {teamAssignments.map((a) => (
                        <div
                          key={a._id}
                          className="border rounded p-3 text-sm bg-muted/10"
                        >
                          <div className="font-medium">
                            {getLabel(
                              a.teamId as
                                | { _id: string; name: string }
                                | string,
                              "Équipe",
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getLabel(
                              a.seasonId as
                                | { _id: string; name: string }
                                | string,
                              "",
                            )}
                            {" · "}
                            {TEAM_ROLE_LABELS[a.role] ?? a.role}
                            {a.position && ` · ${a.position}`}
                            {a.jerseyNumber ? ` · #${a.jerseyNumber}` : ""}
                            {a.isCaptain && " · Capitaine"}
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                </>
              )}

              {/* ── Actions ── */}
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setAddingClubRole(false);
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
