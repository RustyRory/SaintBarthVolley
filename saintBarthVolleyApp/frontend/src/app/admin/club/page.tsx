"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ClubForm } from "@/components/dashboard/admin/club-form";
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

interface Club {
  _id?: string;
  name: string;
  subtitle: string;
  homeDescription: string;
  clubDescription: string;
  ownerDescription: string;
  logo: string;
  photo: string;
  email: string;
  phone: string;
  address: string;
  social_links: Record<string, string>;
  legal_info: Record<string, string | null>;
}

interface Season {
  _id: string;
  name: string;
  status: string;
}
interface Member {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Assignment {
  _id: string;
  memberId: Member;
  role: string;
  customTitle: string;
  displayOrder: number;
  isPublic: boolean;
}

type EditingAssignment = Partial<Omit<Assignment, "_id" | "memberId">> & {
  _id?: string;
  memberId?: string;
};

const ROLE_LABELS: Record<string, string> = {
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

const EMPTY_ASSIGNMENT: EditingAssignment = {
  memberId: undefined,
  role: "other",
  customTitle: "",
  displayOrder: 0,
  isPublic: true,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClubPage() {
  const [tab, setTab] = useState<"infos" | "staff">("infos");

  // ── Infos club ──
  const [club, setClub] = useState<Club | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");

  // ── Staff ──
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editing, setEditing] = useState<EditingAssignment | null>(null);
  const [staffSaving, setStaffSaving] = useState(false);

  // ── Chargement initial ──
  useEffect(() => {
    Promise.all([
      apiFetch<Club[]>("/api/clubs"),
      apiFetch<Season[]>("/api/seasons"),
      apiFetch<Member[]>("/api/members"),
    ])
      .then(([clubs, seas, mems]) => {
        setClub(clubs[0] ?? null);
        setSeasons(seas);
        setMembers(mems);
        const active =
          seas.find((s) => s.status === "active") ?? seas[0] ?? null;
        setActiveSeason(active);
      })
      .catch(console.error);
  }, []);

  // ── Chargement assignments quand la saison change ──
  useEffect(() => {
    if (!activeSeason) return;
    apiFetch<Assignment[]>(`/api/club-assignments?seasonId=${activeSeason._id}`)
      .then(setAssignments)
      .catch(console.error);
  }, [activeSeason]);

  // ── Sauvegarder infos club ──
  const handleSaveClub = async () => {
    if (!club?._id) return;
    setSaving(true);
    setSaveStatus("");
    try {
      await apiFetch(`/api/clubs/${club._id}`, {
        method: "PUT",
        body: JSON.stringify(club),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 4000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // ── CRUD assignments ──
  const handleSaveAssignment = async () => {
    if (!editing || !activeSeason) return;
    setStaffSaving(true);
    try {
      const payload = { ...editing, seasonId: activeSeason._id };
      if (editing._id) {
        const updated = await apiFetch<Assignment>(
          `/api/club-assignments/${editing._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        setAssignments((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a)),
        );
      } else {
        const created = await apiFetch<Assignment>("/api/club-assignments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setAssignments((prev) => [...prev, created]);
      }
      setEditing(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setStaffSaving(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Supprimer ce membre du bureau ?")) return;
    try {
      await apiFetch(`/api/club-assignments/${id}`, { method: "DELETE" });
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleTogglePublic = async (a: Assignment) => {
    try {
      const updated = await apiFetch<Assignment>(
        `/api/club-assignments/${a._id}`,
        {
          method: "PUT",
          body: JSON.stringify({ isPublic: !a.isPublic }),
        },
      );
      setAssignments((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x)),
      );
    } catch {
      alert("Erreur");
    }
  };

  if (!club) return <div className="p-6">Chargement...</div>;

  const sortedAssignments = [...assignments].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full flex-1">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Gestion du club</h1>
        {tab === "infos" && (
          <div className="flex items-center gap-3">
            {saveStatus === "saved" && (
              <span className="text-sm text-green-600">✔ Sauvegardé</span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-red-600">❌ Erreur</span>
            )}
            <Button onClick={handleSaveClub} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Onglets ── */}
      <div className="border-b border-gray-200 flex gap-1">
        {(
          [
            { key: "infos", label: "Informations générales" },
            { key: "staff", label: "Bureau & Staff" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Onglet Infos ── */}
      {tab === "infos" && <ClubForm club={club} onChange={setClub} />}

      {/* ── Onglet Staff ── */}
      {tab === "staff" && (
        <div className="flex flex-col gap-6">
          {/* Sélecteur de saison */}
          <div className="flex items-center gap-3 flex-wrap">
            <Label className="shrink-0">Saison</Label>
            <Select
              value={activeSeason?._id ?? ""}
              onValueChange={(v) =>
                setActiveSeason(seasons.find((s) => s._id === v) ?? null)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choisir une saison" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                    {s.status === "active" ? " ✓" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setEditing({ ...EMPTY_ASSIGNMENT })}>
              + Ajouter un membre
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Membre</th>
                  <th className="p-3 text-left">Rôle</th>
                  <th className="p-3 text-left">Ordre</th>
                  <th className="p-3 text-left">Visibilité</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssignments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Aucun membre dans le bureau pour cette saison.
                    </td>
                  </tr>
                ) : (
                  sortedAssignments.map((a) => (
                    <tr key={a._id} className="border-t">
                      <td className="p-3 font-medium">
                        {a.memberId.firstName} {a.memberId.lastName}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {a.role === "other" && a.customTitle
                            ? a.customTitle
                            : (ROLE_LABELS[a.role] ?? a.role)}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {a.displayOrder}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.isPublic ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                        >
                          {a.isPublic ? "Public" : "Masqué"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditing({ ...a, memberId: a.memberId._id })
                            }
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant={a.isPublic ? "secondary" : "outline"}
                            onClick={() => handleTogglePublic(a)}
                          >
                            {a.isPublic ? "Masquer" : "Publier"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAssignment(a._id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal assignment ── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing._id ? "Modifier le membre" : "Ajouter un membre"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label>Membre *</Label>
                <Select
                  value={editing.memberId ?? ""}
                  onValueChange={(v) =>
                    setEditing((p) => p && { ...p, memberId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Rôle *</Label>
                <Select
                  value={editing.role ?? "other"}
                  onValueChange={(v) =>
                    setEditing((p) => p && { ...p, role: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editing.role === "other" && (
                <div className="flex flex-col gap-1">
                  <Label>Titre personnalisé</Label>
                  <Input
                    value={editing.customTitle ?? ""}
                    onChange={(e) =>
                      setEditing(
                        (p) => p && { ...p, customTitle: e.target.value },
                      )
                    }
                    placeholder="Ex : Responsable arbitrage"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Label>Ordre d&apos;affichage</Label>
                <Input
                  type="number"
                  value={editing.displayOrder ?? 0}
                  onChange={(e) =>
                    setEditing(
                      (p) =>
                        p && {
                          ...p,
                          displayOrder: parseInt(e.target.value) || 0,
                        },
                    )
                  }
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.isPublic ?? true}
                  onChange={(e) =>
                    setEditing((p) => p && { ...p, isPublic: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Visible sur le site public</span>
              </label>
            </div>

            <div className="p-5 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveAssignment}
                disabled={staffSaving || !editing.memberId || !editing.role}
              >
                {staffSaving
                  ? "Enregistrement..."
                  : editing._id
                    ? "Mettre à jour"
                    : "Ajouter"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
