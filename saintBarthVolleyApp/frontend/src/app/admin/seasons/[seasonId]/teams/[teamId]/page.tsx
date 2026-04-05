"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrainingSlot {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface Team {
  _id: string;
  name: string;
  category: "Young" | "Senior" | "Veteran";
  gender: "Male" | "Female" | "Mixed";
  level?: string;
  seasonId: string;
  federationUrl?: string;
  trainingSchedule: TrainingSlot[];
}

interface Standing {
  _id: string;
  teamName: string;
  rank: number;
  points: number;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
}

interface Match {
  _id: string;
  opponentName: string;
  date: string;
  homeAway: "home" | "away";
  status: "scheduled" | "played";
  scoreFor?: number;
  scoreAgainst?: number;
}

interface TeamRole {
  _id: string; // subdoc ObjectId
  teamId: string;
  seasonId: string;
  roles: string[];
  isCaptain: boolean;
  position?: string;
  photo?: string; // photo propre à cette affectation
}

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  teamRoles: TeamRole[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const DAY_LABELS: Record<string, string> = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};
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
const CLUB_NAME = "AS SAINT-BARTHELEMY D'ANJOU V.B.";

const EMPTY_ROLE_FORM = {
  roles: ["player"] as string[],
  position: "",
  isCaptain: false,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamDetailPage() {
  const { seasonId, teamId } = useParams();
  const router = useRouter();

  const id = Array.isArray(teamId) ? teamId[0] : (teamId as string);
  const sid = Array.isArray(seasonId) ? seasonId[0] : (seasonId as string);

  // Core data
  const [team, setTeam] = React.useState<Team | null>(null);
  const [form, setForm] = React.useState<Team | null>(null);
  const [standings, setStandings] = React.useState<Standing[]>([]);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [allClubMembers, setAllClubMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Add member modal (2 steps: pick → configure)
  const [showAdd, setShowAdd] = React.useState(false);
  const [addSearch, setAddSearch] = React.useState("");
  const [addSelected, setAddSelected] = React.useState<Member | null>(null);
  const [addForm, setAddForm] = React.useState(EMPTY_ROLE_FORM);
  const [addSaving, setAddSaving] = React.useState(false);

  // Edit member in team modal
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [editRoleId, setEditRoleId] = React.useState<string>("");
  const [editForm, setEditForm] = React.useState(EMPTY_ROLE_FORM);
  const [editSaving, setEditSaving] = React.useState(false);
  const [photoUploading, setPhotoUploading] = React.useState(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  const teamMembers = allClubMembers.filter((m) =>
    m.teamRoles?.some((tr) => tr.teamId === id),
  );
  const availableMembers = allClubMembers.filter(
    (m) => !m.teamRoles?.some((tr) => tr.teamId === id),
  );
  const filteredAvailable = availableMembers.filter((m) => {
    if (!addSearch) return true;
    return `${m.firstName} ${m.lastName}`
      .toLowerCase()
      .includes(addSearch.toLowerCase());
  });

  const players = teamMembers.filter((m) =>
    m.teamRoles.some((tr) => tr.teamId === id && tr.roles.includes("player")),
  );
  const staffMembers = teamMembers.filter((m) =>
    m.teamRoles.some(
      (tr) => tr.teamId === id && tr.roles.some((r) => r !== "player"),
    ),
  );

  // ── Load ──────────────────────────────────────────────────────────────────
  const refreshMembers = React.useCallback(async () => {
    const data = await apiFetch<Member[]>("/api/members");
    setAllClubMembers(data);
  }, []);

  React.useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<Team>(`/api/teams/${id}`),
      apiFetch<Standing[]>(`/api/standings?teamId=${id}`),
      apiFetch<Member[]>("/api/members"),
      apiFetch<Match[]>(`/api/matches?teamId=${id}`),
    ])
      .then(([teamData, standingsData, membersData, matchesData]) => {
        setTeam(teamData);
        setForm({
          ...teamData,
          trainingSchedule: teamData.trainingSchedule ?? [],
        });
        setStandings(standingsData);
        setAllClubMembers(membersData);
        setMatches(matchesData);
      })
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Team save ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Team>(`/api/teams/${form._id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setTeam(updated);
      setForm({ ...updated, trainingSchedule: updated.trainingSchedule ?? [] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ── Add member ────────────────────────────────────────────────────────────
  const handleAddMember = async () => {
    if (!addSelected) return;
    setAddSaving(true);
    try {
      await apiFetch(`/api/members/${addSelected._id}/roles`, {
        method: "POST",
        body: JSON.stringify({ teamId: id, seasonId: sid, ...addForm }),
      });
      await refreshMembers();
      setShowAdd(false);
      setAddSelected(null);
      setAddSearch("");
      setAddForm(EMPTY_ROLE_FORM);
    } catch {
      alert("Erreur lors de l'ajout");
    } finally {
      setAddSaving(false);
    }
  };

  // ── Edit member role ──────────────────────────────────────────────────────
  const openEdit = (m: Member) => {
    const role = m.teamRoles.find((tr) => tr.teamId === id);
    setEditingMember(m);
    setEditRoleId(role?._id ?? "");
    setEditForm({
      roles: role?.roles ?? ["player"],
      position: role?.position ?? "",
      isCaptain: role?.isCaptain ?? false,
    });
  };

  const handleEditSave = async () => {
    if (!editingMember || !editRoleId) return;
    setEditSaving(true);
    try {
      await apiFetch(`/api/members/${editingMember._id}/roles/${editRoleId}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      await refreshMembers();
      // Keep modal open so admin can also change photo
      const refreshed: Member[] = await apiFetch("/api/members");
      const updated = refreshed.find((m) => m._id === editingMember._id);
      if (updated) setEditingMember(updated);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoUpload = async (
    file: File,
    memberId: string,
    roleId: string,
    oldPhoto?: string,
  ) => {
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (oldPhoto) fd.append("oldFile", oldPhoto.replace("/uploads/", ""));
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const { fileUrl } = await res.json();
      // Sauvegarder la photo sur le rôle (affectation équipe), pas sur le membre global
      await apiFetch(`/api/members/${memberId}/roles/${roleId}`, {
        method: "PUT",
        body: JSON.stringify({ photo: fileUrl }),
      });
      await refreshMembers();
      // Mettre à jour le membre dans la modal
      const refreshed: Member[] = await apiFetch("/api/members");
      const updated = refreshed.find((m) => m._id === memberId);
      if (updated) setEditingMember(updated);
    } catch {
      alert("Erreur lors de l'upload de la photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  // ── Remove member from team ───────────────────────────────────────────────
  const handleRemove = async (m: Member) => {
    if (!confirm(`Retirer ${m.firstName} ${m.lastName} de l'équipe ?`)) return;
    const role = m.teamRoles.find((tr) => tr.teamId === id);
    if (!role) return;
    try {
      await apiFetch(`/api/members/${m._id}/roles/${role._id}`, {
        method: "DELETE",
      });
      await refreshMembers();
    } catch {
      alert("Erreur lors du retrait");
    }
  };

  // ── Training schedule ─────────────────────────────────────────────────────
  const addSlot = () =>
    setForm((p) =>
      p
        ? {
            ...p,
            trainingSchedule: [
              ...p.trainingSchedule,
              {
                day: "Monday",
                startTime: "18:00",
                endTime: "20:00",
                location: "",
              },
            ],
          }
        : p,
    );
  const removeSlot = (idx: number) =>
    setForm((p) =>
      p
        ? {
            ...p,
            trainingSchedule: p.trainingSchedule.filter((_, i) => i !== idx),
          }
        : p,
    );
  const updateSlot = (idx: number, field: keyof TrainingSlot, value: string) =>
    setForm((p) => {
      if (!p) return p;
      const slots = [...p.trainingSchedule];
      slots[idx] = { ...slots[idx], [field]: value };
      return { ...p, trainingSchedule: slots };
    });

  // ── Render helpers ────────────────────────────────────────────────────────
  const Avatar = ({
    member,
    photo,
    size = "md",
  }: {
    member: Member;
    photo?: string;
    size?: "sm" | "md" | "lg";
  }) => {
    const cls =
      size === "lg"
        ? "h-16 w-16 text-base"
        : size === "sm"
          ? "h-7 w-7 text-xs"
          : "h-10 w-10 text-sm";
    if (photo) {
      return (
        <img
          src={`${API}${photo}`}
          alt={`${member.firstName} ${member.lastName}`}
          className={`${cls} rounded-full object-cover shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${cls} rounded-full bg-muted flex items-center justify-center font-bold shrink-0`}
      >
        {member.firstName[0]}
        {member.lastName[0]}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return <div className="p-6">Chargement...</div>;
  if (!form || !team)
    return <div className="p-6 text-red-600">Équipe introuvable</div>;

  const sortedStandings = [...standings].sort((a, b) => a.rank - b.rank);
  const ourRank = sortedStandings.find((s) => s.teamName === CLUB_NAME);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-10">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/seasons/${sid}/teams`)}
        >
          ← Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-sm text-muted-foreground">
            {team.category} · {team.gender}
            {team.level ? ` · ${team.level}` : ""}
          </p>
        </div>
      </div>

      {/* ── Classement ── */}
      {sortedStandings.length > 0 && (
        <section className="border rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold">Classement</h2>
            {ourRank && (
              <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {ourRank.rank}e · {ourRank.points} pts · {ourRank.wins}V{" "}
                {ourRank.losses}D
              </span>
            )}
          </div>
          <div className="overflow-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 text-left">Équipe</th>
                  <th className="p-2 text-center">Pts</th>
                  <th className="p-2 text-center">J</th>
                  <th className="p-2 text-center">V</th>
                  <th className="p-2 text-center">D</th>
                  <th className="p-2 text-center hidden sm:table-cell">S+</th>
                  <th className="p-2 text-center hidden sm:table-cell">S-</th>
                </tr>
              </thead>
              <tbody>
                {sortedStandings.map((s) => {
                  const isUs = s.teamName === CLUB_NAME;
                  return (
                    <tr
                      key={s._id}
                      className={`border-t ${isUs ? "bg-blue-50 font-semibold" : ""}`}
                    >
                      <td className="p-2 text-center text-muted-foreground">
                        {s.rank}
                      </td>
                      <td className="p-2">
                        {isUs ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            {s.teamName}
                          </span>
                        ) : (
                          s.teamName
                        )}
                      </td>
                      <td className="p-2 text-center font-bold">{s.points}</td>
                      <td className="p-2 text-center">{s.played}</td>
                      <td className="p-2 text-center text-green-600">
                        {s.wins}
                      </td>
                      <td className="p-2 text-center text-red-500">
                        {s.losses}
                      </td>
                      <td className="p-2 text-center hidden sm:table-cell">
                        {s.setsFor}
                      </td>
                      <td className="p-2 text-center hidden sm:table-cell">
                        {s.setsAgainst}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Matches ── */}
      {matches.length > 0 && (
        <section className="border rounded-lg p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">
            Matches
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({matches.length})
            </span>
          </h2>
          <div className="overflow-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Adversaire</th>
                  <th className="p-2 text-center">D/E</th>
                  <th className="p-2 text-center">Statut</th>
                  <th className="p-2 text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {[...matches]
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )
                  .map((m) => (
                    <tr key={m._id} className="border-t">
                      <td className="p-2 whitespace-nowrap text-muted-foreground">
                        {new Date(m.date).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-2 font-medium">{m.opponentName}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            m.homeAway === "home"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {m.homeAway === "home" ? "Dom." : "Ext."}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            m.status === "played"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {m.status === "played" ? "Joué" : "Prévu"}
                        </span>
                      </td>
                      <td className="p-2 text-center font-mono">
                        {m.status === "played"
                          ? `${m.scoreFor} - ${m.scoreAgainst}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Joueurs & Staff ── */}
      <section className="border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Joueurs & Staff
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {teamMembers.length} membre{teamMembers.length !== 1 ? "s" : ""}
            </span>
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setShowAdd(true);
              setAddSelected(null);
              setAddSearch("");
              setAddForm(EMPTY_ROLE_FORM);
            }}
          >
            + Ajouter un membre
          </Button>
        </div>

        {teamMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun membre assigné à cette équipe.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Joueurs */}
            {players.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Joueurs ({players.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {players.map((m) => {
                    const role = m.teamRoles.find((tr) => tr.teamId === id);
                    return (
                      <MemberCard
                        key={m._id}
                        member={m}
                        role={role}
                        Avatar={<Avatar member={m} photo={role?.photo} />}
                        onEdit={() => openEdit(m)}
                        onRemove={() => handleRemove(m)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Staff */}
            {staffMembers.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Staff ({staffMembers.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {staffMembers.map((m) => {
                    const role = m.teamRoles.find((tr) => tr.teamId === id);
                    return (
                      <MemberCard
                        key={m._id}
                        member={m}
                        role={role}
                        Avatar={<Avatar member={m} photo={role?.photo} />}
                        onEdit={() => openEdit(m)}
                        onRemove={() => handleRemove(m)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Infos générales ── */}
      <section className="border rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Informations générales</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm((p) => p && { ...p, name: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Catégorie *</Label>
            <Select
              value={form.category}
              onValueChange={(v) =>
                setForm((p) => p && { ...p, category: v as Team["category"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Young">Young</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Veteran">Veteran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Genre *</Label>
            <Select
              value={form.gender}
              onValueChange={(v) =>
                setForm((p) => p && { ...p, gender: v as Team["gender"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Masculin</SelectItem>
                <SelectItem value="Female">Féminin</SelectItem>
                <SelectItem value="Mixed">Mixte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="level">Niveau</Label>
          <Input
            id="level"
            value={form.level || ""}
            onChange={(e) =>
              setForm((p) => p && { ...p, level: e.target.value })
            }
            placeholder="Ex: Régional 1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="federationUrl">URL FFVB</Label>
          <Input
            id="federationUrl"
            value={form.federationUrl || ""}
            onChange={(e) =>
              setForm((p) => p && { ...p, federationUrl: e.target.value })
            }
            placeholder="https://www.ffvb.org/..."
          />
          <p className="text-xs text-muted-foreground">
            Utilisée pour le scraping automatique des matches et classements.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {saved && (
            <span className="text-sm text-green-600 self-center">
              ✓ Sauvegardé
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </section>

      {/* ── Planning d'entraînement ── */}
      <section className="border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Planning d&apos;entraînement
          </h2>
          <Button size="sm" variant="outline" onClick={addSlot}>
            + Ajouter un créneau
          </Button>
        </div>

        {form.trainingSchedule.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun créneau d&apos;entraînement.
          </p>
        )}

        {form.trainingSchedule.map((slot, idx) => (
          <div
            key={idx}
            className="border rounded p-4 flex flex-col gap-3 bg-muted/20"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Jour</Label>
                <Select
                  value={slot.day}
                  onValueChange={(v) => updateSlot(idx, "day", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DAY_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Lieu</Label>
                <Input
                  className="h-9"
                  value={slot.location}
                  onChange={(e) => updateSlot(idx, "location", e.target.value)}
                  placeholder="Gymnase..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Début</Label>
                <Input
                  type="time"
                  className="h-9"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(idx, "startTime", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Fin</Label>
                <Input
                  type="time"
                  className="h-9"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(idx, "endTime", e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="self-end"
              onClick={() => removeSlot(idx)}
            >
              Supprimer
            </Button>
          </div>
        ))}

        {form.trainingSchedule.length > 0 && (
          <div className="flex justify-end gap-3">
            {saved && (
              <span className="text-sm text-green-600 self-center">
                ✓ Sauvegardé
              </span>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Sauvegarde..." : "Sauvegarder le planning"}
            </Button>
          </div>
        )}
      </section>

      {/* ══ Modal : Ajouter un membre ══ */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">
                {addSelected
                  ? `Configurer · ${addSelected.firstName} ${addSelected.lastName}`
                  : "Choisir un membre"}
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            {!addSelected ? (
              /* Step 1 — pick from roster */
              <>
                <div className="p-4 border-b shrink-0">
                  <Input
                    placeholder="Rechercher..."
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  {filteredAvailable.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-6 text-center">
                      {availableMembers.length === 0
                        ? "Tous les membres du club sont déjà dans cette équipe."
                        : "Aucun résultat."}
                    </p>
                  ) : (
                    filteredAvailable.map((m) => (
                      <button
                        key={m._id}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted text-left transition-colors"
                        onClick={() => setAddSelected(m)}
                      >
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                          {m.firstName[0]}
                          {m.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {m.firstName} {m.lastName}
                          </div>
                          {!m.isActive && (
                            <div className="text-xs text-muted-foreground">
                              Inactif
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Step 2 — configure role */
              <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Rôle *</Label>
                    <Select
                      value={addForm.roles[0]}
                      onValueChange={(v) =>
                        setAddForm((p) => ({ ...p, roles: [v] }))
                      }
                    >
                      <SelectTrigger>
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
                      placeholder="Ex: Libéro"
                      value={addForm.position}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, position: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addCaptain"
                    checked={addForm.isCaptain}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, isCaptain: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="addCaptain">Capitaine de l&apos;équipe</Label>
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddSelected(null)}
                  >
                    ← Retour
                  </Button>
                  <Button onClick={handleAddMember} disabled={addSaving}>
                    {addSaving ? "Ajout en cours..." : "Ajouter à l'équipe"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Modal : Modifier membre dans l'équipe ══ */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">
                {editingMember.firstName} {editingMember.lastName}
              </h2>
              <button
                onClick={() => setEditingMember(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
              {/* Photo */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">
                  Photo
                </Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Photo pour cette équipe (peut être différente d&apos;une
                  saison à l&apos;autre)
                </p>
                <div className="flex items-center gap-4">
                  {(() => {
                    const role = editingMember.teamRoles.find(
                      (tr) => tr.teamId === id,
                    );
                    const rolePhoto = role?.photo;
                    return (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold overflow-hidden shrink-0">
                        {rolePhoto ? (
                          <img
                            src={`${API}${rolePhoto}`}
                            className="h-full w-full object-cover"
                            alt=""
                          />
                        ) : (
                          <>
                            {editingMember.firstName[0]}
                            {editingMember.lastName[0]}
                          </>
                        )}
                      </div>
                    );
                  })()}
                  <div className="flex flex-col gap-1">
                    <label className="cursor-pointer">
                      <span
                        className={`inline-block px-3 py-1.5 rounded border text-sm font-medium hover:bg-muted transition-colors ${photoUploading ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        {photoUploading
                          ? "Upload en cours..."
                          : "Changer la photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={photoUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const role = editingMember.teamRoles.find(
                              (tr) => tr.teamId === id,
                            );
                            handlePhotoUpload(
                              file,
                              editingMember._id,
                              editRoleId,
                              role?.photo,
                            );
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG — max 5 Mo
                    </p>
                  </div>
                </div>
              </div>

              {/* Rôle dans l'équipe */}
              <div className="flex flex-col gap-3 border-t pt-4">
                <Label className="text-xs font-semibold uppercase tracking-wide">
                  Rôle dans l&apos;équipe
                </Label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Rôle</Label>
                    <Select
                      value={editForm.roles[0]}
                      onValueChange={(v) =>
                        setEditForm((p) => ({ ...p, roles: [v] }))
                      }
                    >
                      <SelectTrigger>
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
                      placeholder="Ex: Libéro"
                      value={editForm.position}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, position: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editCaptain"
                    checked={editForm.isCaptain}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        isCaptain: e.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="editCaptain">
                    Capitaine de l&apos;équipe
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <Button onClick={handleEditSave} disabled={editSaving}>
                    {editSaving ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Member Card Component ─────────────────────────────────────────────────────

function MemberCard({
  member,
  role,
  Avatar,
  onEdit,
  onRemove,
}: {
  member: Member;
  role?: TeamRole;
  Avatar: React.ReactNode;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border rounded-lg p-3 hover:bg-muted/30 transition-colors">
      {Avatar}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate flex items-center gap-1.5">
          {member.firstName} {member.lastName}
          {role?.isCaptain && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-normal">
              C
            </span>
          )}
          {!member.isActive && (
            <span className="text-xs text-muted-foreground font-normal">
              · Inactif
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {role?.position ||
            role?.roles
              .map(
                (r) =>
                  ({
                    player: "Joueur",
                    coach: "Entraîneur",
                    staff: "Staff",
                    referee: "Arbitre",
                    volunteer: "Bénévole",
                    owner: "Dirigeant",
                  })[r] ?? r,
              )
              .join(", ")}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          onClick={onEdit}
        >
          Modifier
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs text-red-500 hover:text-red-700"
          onClick={onRemove}
        >
          Retirer
        </Button>
      </div>
    </div>
  );
}
