"use client";

import * as React from "react";
import Image from "next/image";
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

interface Season {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "future" | "archived";
}

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

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  bio?: string;
  isActive: boolean;
}

interface TeamAssignment {
  _id: string;
  memberId: { _id: string; firstName: string; lastName: string };
  teamId: string;
  seasonId: string;
  role: "player" | "coach" | "assistant_coach";
  position?: string;
  isCaptain?: boolean;
  jerseyNumber?: number;
  photo?: string;
}

interface CupPhase {
  _id: string;
  teamId: string;
  seasonId: string;
  name: string;
  type: "anjou" | "france" | "regional" | "other";
  url: string;
  notes: string;
}

interface ScrapedMatch {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  scoreHome: string | null;
  scoreAway: string | null;
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

const TEAM_ROLES = ["player", "coach", "assistant_coach"] as const;
const TEAM_ROLE_LABELS: Record<string, string> = {
  player: "Joueur",
  coach: "Entraîneur",
  assistant_coach: "Assistant entraîneur",
};

const POSITIONS: { value: string; label: string }[] = [
  { value: "__none__", label: "— Aucun poste —" },
  { value: "setter", label: "Passeur" },
  { value: "libero", label: "Libéro" },
  { value: "receiver", label: "Réceptionneur-attaquant" },
  { value: "middle", label: "Central" },
  { value: "universal", label: "Universel" },
  { value: "opposite", label: "Pointu" },
];

const CATEGORY_LABELS: Record<string, string> = {
  Young: "Jeune",
  Senior: "Senior",
  Veteran: "Vétéran",
};
const GENDER_LABELS: Record<string, string> = {
  Male: "Masculin",
  Female: "Féminin",
  Mixed: "Mixte",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  future: "Future",
  archived: "Archivée",
};
const CUP_TYPES = ["anjou", "france", "regional", "other"] as const;
const CUP_TYPE_LABELS: Record<string, string> = {
  anjou: "Coupe de l'Anjou",
  france: "Coupe de France",
  regional: "Coupe Régionale",
  other: "Autre coupe",
};
const CUP_TYPE_COLORS: Record<string, string> = {
  anjou: "bg-orange-100 text-orange-700",
  france: "bg-blue-100 text-blue-700",
  regional: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  future: "bg-blue-100 text-blue-700",
  archived: "bg-zinc-100 text-zinc-500",
};

const EMPTY_SEASON = {
  name: "",
  startDate: "",
  endDate: "",
  status: "future" as const,
};
const EMPTY_TEAM = {
  name: "",
  category: "Senior" as const,
  gender: "Male" as const,
  level: "",
  seasonId: "",
  federationUrl: "",
  trainingSchedule: [],
};
const EMPTY_MEMBER = {
  firstName: "",
  lastName: "",
  birthDate: "",
  bio: "",
  isActive: true,
};
const EMPTY_CUP: Omit<CupPhase, "_id" | "teamId" | "seasonId"> = {
  name: "",
  type: "anjou",
  url: "",
  notes: "",
};

const posToDb = (v: string) => (v === "__none__" ? "" : v);
const posToUi = (v: string | undefined) => (v ? v : "__none__");

// ─── Page principale ──────────────────────────────────────────────────────────

export default function SportifPage() {
  const [tab, setTab] = React.useState<"equipes" | "membres">("equipes");

  // Saisons
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = React.useState<Season | null>(null);
  const [seasonModal, setSeasonModal] = React.useState<Partial<Season> | null>(
    null,
  );
  const [seasonSaving, setSeasonSaving] = React.useState(false);

  // Équipes
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [teamModal, setTeamModal] = React.useState<Partial<Team> | null>(null);
  const [teamModalSaving, setTeamModalSaving] = React.useState(false);
  const [teamTab, setTeamTab] = React.useState<
    "composition" | "coupes" | "infos"
  >("composition");

  // Infos équipe sélectionnée (form inline)
  const [teamInfoForm, setTeamInfoForm] = React.useState<Team | null>(null);
  const [teamInfoSaving, setTeamInfoSaving] = React.useState(false);
  const [teamInfoSaved, setTeamInfoSaved] = React.useState(false);

  // Membres du club
  const [members, setMembers] = React.useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = React.useState("");
  const [memberModal, setMemberModal] = React.useState<Partial<Member> | null>(
    null,
  );
  const [memberSaving, setMemberSaving] = React.useState(false);

  // Affectations équipe
  const [assignments, setAssignments] = React.useState<TeamAssignment[]>([]);
  const [assignLoading, setAssignLoading] = React.useState(false);

  // Ajout en lot
  const [showBatchAdd, setShowBatchAdd] = React.useState(false);
  const [batchSearch, setBatchSearch] = React.useState("");
  const [batchSelected, setBatchSelected] = React.useState<Set<string>>(
    new Set(),
  );
  const [batchRole, setBatchRole] = React.useState<
    "player" | "coach" | "assistant_coach"
  >("player");
  const [batchSaving, setBatchSaving] = React.useState(false);

  // Coupes
  const [cupPhases, setCupPhases] = React.useState<CupPhase[]>([]);
  const [cupModal, setCupModal] = React.useState<Partial<CupPhase> | null>(
    null,
  );
  const [cupSaving, setCupSaving] = React.useState(false);
  const [scrapingCup, setScrapingCup] = React.useState<string | null>(null);
  const [cupMatches, setCupMatches] = React.useState<
    Record<string, ScrapedMatch[]>
  >({});

  // Modification affectation individuelle
  const [editingAssignment, setEditingAssignment] =
    React.useState<TeamAssignment | null>(null);
  const [editForm, setEditForm] = React.useState({
    role: "player",
    position: "__none__",
    isCaptain: false,
    jerseyNumber: "" as string | number,
  });
  const [editSaving, setEditSaving] = React.useState(false);

  const [loading, setLoading] = React.useState(true);

  // ── Chargement initial ────────────────────────────────────────────────────

  React.useEffect(() => {
    Promise.all([
      apiFetch<Season[]>("/api/seasons"),
      apiFetch<Member[]>("/api/members"),
    ])
      .then(([seasonsData, membersData]) => {
        setSeasons(seasonsData);
        setMembers(membersData);
        const active =
          seasonsData.find((s) => s.status === "active") ??
          seasonsData[0] ??
          null;
        setActiveSeason(active);
      })
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  // ── Équipes → reload quand saison change ──────────────────────────────────

  React.useEffect(() => {
    if (!activeSeason) {
      setTeams([]);
      return;
    }
    setSelectedTeam(null);
    setAssignments([]);
    apiFetch<Team[]>(`/api/teams?seasonId=${activeSeason._id}`)
      .then(setTeams)
      .catch(console.error);
  }, [activeSeason]);

  // ── Affectations + coupes → reload quand équipe change ───────────────────

  React.useEffect(() => {
    if (!selectedTeam || !activeSeason) return;
    setAssignLoading(true);
    setCupMatches({});
    Promise.all([
      apiFetch<TeamAssignment[]>(
        `/api/team-assignments?teamId=${selectedTeam._id}&seasonId=${activeSeason._id}`,
      ),
      apiFetch<CupPhase[]>(
        `/api/cup-phases?teamId=${selectedTeam._id}&seasonId=${activeSeason._id}`,
      ),
    ])
      .then(([assigns, cups]) => {
        setAssignments(assigns);
        setCupPhases(cups);
      })
      .catch(console.error)
      .finally(() => setAssignLoading(false));
  }, [selectedTeam, activeSeason]);

  // ── Sync form infos équipe ────────────────────────────────────────────────

  React.useEffect(() => {
    setTeamInfoForm(selectedTeam ? { ...selectedTeam } : null);
    setTeamInfoSaved(false);
  }, [selectedTeam]);

  // ── Computed ─────────────────────────────────────────────────────────────

  const assignedIds = React.useMemo(
    () => new Set(assignments.map((a) => a.memberId._id)),
    [assignments],
  );

  const availableForBatch = React.useMemo(() => {
    const q = batchSearch.toLowerCase();
    return members.filter((m) => {
      if (assignedIds.has(m._id)) return false;
      if (!q) return true;
      return `${m.firstName} ${m.lastName}`.toLowerCase().includes(q);
    });
  }, [members, assignedIds, batchSearch]);

  const players = assignments.filter((a) => a.role === "player");
  const staffList = assignments.filter((a) => a.role !== "player");

  const filteredMembers = React.useMemo(() => {
    const q = memberSearch.toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q),
    );
  }, [members, memberSearch]);

  // ── CRUD Saisons ─────────────────────────────────────────────────────────

  const handleSaveSeason = async () => {
    if (!seasonModal || !seasonModal.name) return;
    setSeasonSaving(true);
    try {
      if (seasonModal._id) {
        const updated = await apiFetch<Season>(
          `/api/seasons/${seasonModal._id}`,
          {
            method: "PUT",
            body: JSON.stringify(seasonModal),
          },
        );
        setSeasons((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s)),
        );
        if (activeSeason?._id === updated._id) setActiveSeason(updated);
      } else {
        const created = await apiFetch<Season>("/api/seasons", {
          method: "POST",
          body: JSON.stringify(seasonModal),
        });
        setSeasons((prev) => [...prev, created]);
        setActiveSeason(created);
      }
      setSeasonModal(null);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSeasonSaving(false);
    }
  };

  const handleDeleteSeason = async (s: Season) => {
    if (
      !confirm(
        `Supprimer la saison "${s.name}" ? Toutes les équipes associées seront supprimées.`,
      )
    )
      return;
    try {
      await apiFetch(`/api/seasons/${s._id}`, { method: "DELETE" });
      const next = seasons.filter((x) => x._id !== s._id);
      setSeasons(next);
      setActiveSeason(next[0] ?? null);
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  // ── CRUD Équipes ──────────────────────────────────────────────────────────

  const handleSaveTeamModal = async () => {
    if (!teamModal || !activeSeason) return;
    setTeamModalSaving(true);
    try {
      const payload = { ...teamModal, seasonId: activeSeason._id };
      if (teamModal._id) {
        const updated = await apiFetch<Team>(`/api/teams/${teamModal._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setTeams((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t)),
        );
        if (selectedTeam?._id === updated._id) setSelectedTeam(updated);
      } else {
        const created = await apiFetch<Team>("/api/teams", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setTeams((prev) => [...prev, created]);
        setSelectedTeam(created);
        setTeamTab("composition");
      }
      setTeamModal(null);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setTeamModalSaving(false);
    }
  };

  const handleDeleteTeam = async (t: Team) => {
    if (!confirm(`Supprimer l'équipe "${t.name}" ?`)) return;
    try {
      await apiFetch(`/api/teams/${t._id}`, { method: "DELETE" });
      setTeams((prev) => prev.filter((x) => x._id !== t._id));
      if (selectedTeam?._id === t._id) {
        setSelectedTeam(null);
        setAssignments([]);
      }
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSaveTeamInfo = async () => {
    if (!teamInfoForm) return;
    setTeamInfoSaving(true);
    try {
      const updated = await apiFetch<Team>(`/api/teams/${teamInfoForm._id}`, {
        method: "PUT",
        body: JSON.stringify(teamInfoForm),
      });
      setTeams((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t)),
      );
      setSelectedTeam(updated);
      setTeamInfoSaved(true);
      setTimeout(() => setTeamInfoSaved(false), 2500);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setTeamInfoSaving(false);
    }
  };

  // ── Training slots ────────────────────────────────────────────────────────

  const addSlot = () =>
    setTeamInfoForm((p) =>
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
  const removeSlot = (i: number) =>
    setTeamInfoForm((p) =>
      p
        ? {
            ...p,
            trainingSchedule: p.trainingSchedule.filter((_, j) => j !== i),
          }
        : p,
    );
  const updateSlot = (i: number, field: keyof TrainingSlot, value: string) =>
    setTeamInfoForm((p) => {
      if (!p) return p;
      const slots = [...p.trainingSchedule];
      slots[i] = { ...slots[i], [field]: value };
      return { ...p, trainingSchedule: slots };
    });

  // ── Ajout en lot ──────────────────────────────────────────────────────────

  const handleBatchAdd = async () => {
    if (!selectedTeam || !activeSeason || batchSelected.size === 0) return;
    setBatchSaving(true);
    try {
      await Promise.all(
        Array.from(batchSelected).map((memberId) =>
          apiFetch("/api/team-assignments", {
            method: "POST",
            body: JSON.stringify({
              memberId,
              teamId: selectedTeam._id,
              seasonId: activeSeason._id,
              role: batchRole,
            }),
          }),
        ),
      );
      const fresh = await apiFetch<TeamAssignment[]>(
        `/api/team-assignments?teamId=${selectedTeam._id}&seasonId=${activeSeason._id}`,
      );
      setAssignments(fresh);
      setShowBatchAdd(false);
      setBatchSelected(new Set());
      setBatchSearch("");
    } catch {
      alert("Erreur lors de l'ajout");
    } finally {
      setBatchSaving(false);
    }
  };

  const toggleBatchAll = () => {
    const allSelected = availableForBatch.every((m) =>
      batchSelected.has(m._id),
    );
    setBatchSelected(
      allSelected ? new Set() : new Set(availableForBatch.map((m) => m._id)),
    );
  };

  // ── Affectations individuelles ────────────────────────────────────────────

  const openEditAssignment = (a: TeamAssignment) => {
    setEditingAssignment(a);
    setEditForm({
      role: a.role,
      position: posToUi(a.position),
      isCaptain: a.isCaptain ?? false,
      jerseyNumber: a.jerseyNumber ?? "",
    });
  };

  const handleSaveAssignment = async () => {
    if (!editingAssignment) return;
    setEditSaving(true);
    try {
      const updated = await apiFetch<TeamAssignment>(
        `/api/team-assignments/${editingAssignment._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            role: editForm.role,
            position: posToDb(editForm.position) || undefined,
            isCaptain: editForm.isCaptain,
            jerseyNumber:
              editForm.jerseyNumber !== ""
                ? Number(editForm.jerseyNumber)
                : undefined,
          }),
        },
      );
      setAssignments((prev) =>
        prev.map((a) => (a._id === updated._id ? { ...a, ...updated } : a)),
      );
      setEditingAssignment(null);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemoveAssignment = async (a: TeamAssignment) => {
    if (
      !confirm(
        `Retirer ${a.memberId.firstName} ${a.memberId.lastName} de l'équipe ?`,
      )
    )
      return;
    try {
      await apiFetch(`/api/team-assignments/${a._id}`, { method: "DELETE" });
      setAssignments((prev) => prev.filter((x) => x._id !== a._id));
    } catch {
      alert("Erreur lors du retrait");
    }
  };

  // ── CRUD Coupes ───────────────────────────────────────────────────────────

  const handleSaveCup = async () => {
    if (!cupModal || !selectedTeam || !activeSeason) return;
    setCupSaving(true);
    try {
      const payload = {
        ...cupModal,
        teamId: selectedTeam._id,
        seasonId: activeSeason._id,
      };
      if (cupModal._id) {
        const updated = await apiFetch<CupPhase>(
          `/api/cup-phases/${cupModal._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        setCupPhases((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
      } else {
        const created = await apiFetch<CupPhase>("/api/cup-phases", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setCupPhases((prev) => [...prev, created]);
      }
      setCupModal(null);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setCupSaving(false);
    }
  };

  const handleDeleteCup = async (c: CupPhase) => {
    if (!confirm(`Supprimer la phase "${c.name}" ?`)) return;
    try {
      await apiFetch(`/api/cup-phases/${c._id}`, { method: "DELETE" });
      setCupPhases((prev) => prev.filter((x) => x._id !== c._id));
      setCupMatches((prev) => {
        const n = { ...prev };
        delete n[c._id];
        return n;
      });
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleScrapeCup = async (c: CupPhase) => {
    if (!c.url) return;
    setScrapingCup(c._id);
    try {
      const res = await fetch(
        `/api/scrape-cup?url=${encodeURIComponent(c.url)}`,
      );
      const data = await res.json();
      setCupMatches((prev) => ({ ...prev, [c._id]: data.matches ?? [] }));
    } catch {
      alert("Erreur lors du scraping");
    } finally {
      setScrapingCup(null);
    }
  };

  // ── CRUD Membres ──────────────────────────────────────────────────────────

  const handleSaveMember = async () => {
    if (!memberModal) return;
    setMemberSaving(true);
    try {
      if ((memberModal as Member)._id) {
        const updated = await apiFetch<Member>(
          `/api/members/${(memberModal as Member)._id}`,
          {
            method: "PUT",
            body: JSON.stringify(memberModal),
          },
        );
        setMembers((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m)),
        );
      } else {
        const created = await apiFetch<Member>("/api/members", {
          method: "POST",
          body: JSON.stringify(memberModal),
        });
        setMembers((prev) => [...prev, created]);
      }
      setMemberModal(null);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setMemberSaving(false);
    }
  };

  const handleDeleteMember = async (m: Member) => {
    if (
      !confirm(
        `Supprimer ${m.firstName} ${m.lastName} ? Cette action est irréversible.`,
      )
    )
      return;
    try {
      await apiFetch(`/api/members/${m._id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((x) => x._id !== m._id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* Header */}
      <h1 className="text-2xl font-bold">Gestion sportive</h1>

      {/* Onglets principaux */}
      <div className="border-b border-gray-200 flex gap-1">
        {(
          [
            { key: "equipes", label: "Saisons & Équipes" },
            { key: "membres", label: `Membres du club (${members.length})` },
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

      {/* ══════════════════════════════════════════════════════════════════════
          TAB : Saisons & Équipes
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "equipes" && (
        <div className="flex flex-col gap-4">
          {/* Barre de saison */}
          <div className="flex items-center gap-3 flex-wrap p-4 bg-muted/30 rounded-lg border">
            <span className="text-sm font-semibold shrink-0">
              Saison active
            </span>

            {seasons.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                Aucune saison créée
              </span>
            ) : (
              <Select
                value={activeSeason?._id ?? ""}
                onValueChange={(v) =>
                  setActiveSeason(seasons.find((s) => s._id === v) ?? null)
                }
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Choisir une saison" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      <span className="flex items-center gap-2">
                        {s.name}
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status]}`}
                        >
                          {STATUS_LABELS[s.status]}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {activeSeason && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSeasonModal({ ...activeSeason })}
                >
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteSeason(activeSeason)}
                >
                  Supprimer
                </Button>
              </>
            )}

            <Button
              size="sm"
              className="ml-auto"
              onClick={() => setSeasonModal({ ...EMPTY_SEASON })}
            >
              + Nouvelle saison
            </Button>
          </div>

          {/* Layout 2 colonnes */}
          {!activeSeason ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <p className="font-medium text-lg">
                Commencez par créer une saison
              </p>
              <p className="text-sm">
                Une saison regroupe vos équipes, matchs et classements.
              </p>
              <Button onClick={() => setSeasonModal({ ...EMPTY_SEASON })}>
                + Créer la première saison
              </Button>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4"
              style={{ minHeight: 600 }}
            >
              {/* Colonne gauche : liste équipes */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Équipes de la saison ({teams.length})
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setTeamModal({ ...EMPTY_TEAM })}
                  >
                    + Créer
                  </Button>
                </div>

                {teams.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      Aucune équipe pour cette saison.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTeamModal({ ...EMPTY_TEAM })}
                    >
                      Créer la première équipe
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {teams.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => {
                          setSelectedTeam(t);
                          setTeamTab("composition");
                        }}
                        className={`w-full text-left border rounded-lg p-3 transition-all ${
                          selectedTeam?._id === t._id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "hover:bg-muted/40 bg-background border-border"
                        }`}
                      >
                        <div className="font-semibold text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <span>{CATEGORY_LABELS[t.category]}</span>
                          <span>·</span>
                          <span>{GENDER_LABELS[t.gender]}</span>
                          {t.level && (
                            <>
                              <span>·</span>
                              <span>{t.level}</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Colonne droite : détail équipe */}
              <div className="border rounded-lg bg-background flex flex-col overflow-hidden">
                {!selectedTeam ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground gap-2">
                    <p className="font-medium">← Sélectionnez une équipe</p>
                    <p className="text-sm">ou créez-en une nouvelle</p>
                  </div>
                ) : (
                  <>
                    {/* En-tête équipe */}
                    <div className="p-4 border-b flex items-center justify-between gap-3 flex-wrap bg-muted/20">
                      <div>
                        <h2 className="text-lg font-bold">
                          {selectedTeam.name}
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{CATEGORY_LABELS[selectedTeam.category]}</span>
                          <span>·</span>
                          <span>{GENDER_LABELS[selectedTeam.gender]}</span>
                          {selectedTeam.level && (
                            <>
                              <span>·</span>
                              <span>{selectedTeam.level}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>
                            {assignments.length} membre
                            {assignments.length !== 1 ? "s" : ""}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTeamModal({ ...selectedTeam })}
                        >
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteTeam(selectedTeam)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>

                    {/* Sous-onglets équipe */}
                    <div className="border-b flex gap-1 px-4">
                      {(
                        [
                          { key: "composition", label: "Joueurs & Staff" },
                          {
                            key: "coupes",
                            label: `Coupes${cupPhases.length > 0 ? ` (${cupPhases.length})` : ""}`,
                          },
                          { key: "infos", label: "Infos & Planning" },
                        ] as const
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setTeamTab(key)}
                          className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            teamTab === key
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* ── Composition ── */}
                    {teamTab === "composition" && (
                      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm text-muted-foreground">
                            {assignments.length === 0
                              ? "Aucun membre dans cette équipe."
                              : `${players.length} joueur${players.length !== 1 ? "s" : ""}, ${staffList.length} staff`}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => {
                              setShowBatchAdd(true);
                              setBatchSelected(new Set());
                              setBatchSearch("");
                              setBatchRole("player");
                            }}
                          >
                            + Ajouter des membres
                          </Button>
                        </div>

                        {assignLoading ? (
                          <p className="text-sm text-muted-foreground">
                            Chargement...
                          </p>
                        ) : assignments.length === 0 ? (
                          <div className="border-2 border-dashed rounded-lg p-10 text-center flex flex-col gap-3">
                            <p className="text-muted-foreground text-sm">
                              L&apos;équipe est vide.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mx-auto"
                              onClick={() => {
                                setShowBatchAdd(true);
                                setBatchSelected(new Set());
                              }}
                            >
                              Ajouter des joueurs
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-5">
                            {players.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                  Joueurs ({players.length})
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {players.map((a) => (
                                    <AssignmentCard
                                      key={a._id}
                                      assignment={a}
                                      onEdit={() => openEditAssignment(a)}
                                      onRemove={() => handleRemoveAssignment(a)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {staffList.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                  Staff ({staffList.length})
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {staffList.map((a) => (
                                    <AssignmentCard
                                      key={a._id}
                                      assignment={a}
                                      onEdit={() => openEditAssignment(a)}
                                      onRemove={() => handleRemoveAssignment(a)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Coupes ── */}
                    {teamTab === "coupes" && (
                      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm text-muted-foreground">
                            {cupPhases.length === 0
                              ? "Aucune coupe pour cette équipe."
                              : `${cupPhases.length} phase${cupPhases.length > 1 ? "s" : ""} de coupe`}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setCupModal({ ...EMPTY_CUP })}
                          >
                            + Ajouter une coupe
                          </Button>
                        </div>

                        {cupPhases.length === 0 ? (
                          <div className="border-2 border-dashed rounded-lg p-10 text-center flex flex-col gap-3">
                            <p className="text-muted-foreground text-sm">
                              Coupe de France, Coupe de l&apos;Anjou…
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mx-auto"
                              onClick={() => setCupModal({ ...EMPTY_CUP })}
                            >
                              Ajouter une phase de coupe
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {cupPhases.map((c) => (
                              <div
                                key={c._id}
                                className="border rounded-lg overflow-hidden"
                              >
                                {/* Card coupe */}
                                <div className="p-4 flex items-start justify-between gap-3 flex-wrap">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CUP_TYPE_COLORS[c.type]}`}
                                      >
                                        {CUP_TYPE_LABELS[c.type]}
                                      </span>
                                      <span className="font-semibold text-sm">
                                        {c.name}
                                      </span>
                                    </div>
                                    {c.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {c.notes}
                                      </p>
                                    )}
                                    {c.url && (
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        🔗 {c.url}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    {c.url && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={scrapingCup === c._id}
                                        onClick={() => handleScrapeCup(c)}
                                      >
                                        {scrapingCup === c._id
                                          ? "Chargement..."
                                          : cupMatches[c._id]
                                            ? "Actualiser"
                                            : "Voir les matchs"}
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setCupModal({ ...c })}
                                    >
                                      Modifier
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => handleDeleteCup(c)}
                                    >
                                      Supprimer
                                    </Button>
                                  </div>
                                </div>

                                {/* Matchs scrapés */}
                                {cupMatches[c._id] && (
                                  <div className="border-t bg-muted/20">
                                    {cupMatches[c._id].length === 0 ? (
                                      <p className="text-sm text-muted-foreground p-4">
                                        Aucun match trouvé à cette URL.
                                      </p>
                                    ) : (
                                      <div className="overflow-auto">
                                        <table className="w-full text-xs">
                                          <thead className="bg-muted">
                                            <tr>
                                              <th className="p-2 text-left">
                                                Date
                                              </th>
                                              <th className="p-2 text-left">
                                                Domicile
                                              </th>
                                              <th className="p-2 text-center">
                                                Score
                                              </th>
                                              <th className="p-2 text-left">
                                                Extérieur
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {cupMatches[c._id].map((m) => {
                                              const isUs =
                                                m.homeTeam.includes(
                                                  "SAINT-BARTH",
                                                ) ||
                                                m.awayTeam.includes(
                                                  "SAINT-BARTH",
                                                );
                                              return (
                                                <tr
                                                  key={m.id}
                                                  className={`border-t ${isUs ? "bg-primary/5 font-medium" : ""}`}
                                                >
                                                  <td className="p-2 whitespace-nowrap text-muted-foreground">
                                                    {m.date}
                                                  </td>
                                                  <td className="p-2 truncate max-w-32">
                                                    {m.homeTeam}
                                                  </td>
                                                  <td className="p-2 text-center font-mono">
                                                    {m.scoreHome !== null &&
                                                    m.scoreAway !== null
                                                      ? `${m.scoreHome} – ${m.scoreAway}`
                                                      : "–"}
                                                  </td>
                                                  <td className="p-2 truncate max-w-32">
                                                    {m.awayTeam}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Infos & Planning ── */}
                    {teamTab === "infos" && teamInfoForm && (
                      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <Label>Nom de l&apos;équipe</Label>
                            <Input
                              value={teamInfoForm.name}
                              onChange={(e) =>
                                setTeamInfoForm(
                                  (p) => p && { ...p, name: e.target.value },
                                )
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label>Catégorie</Label>
                            <Select
                              value={teamInfoForm.category}
                              onValueChange={(v) =>
                                setTeamInfoForm(
                                  (p) =>
                                    p && {
                                      ...p,
                                      category: v as Team["category"],
                                    },
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Young">Jeune</SelectItem>
                                <SelectItem value="Senior">Senior</SelectItem>
                                <SelectItem value="Veteran">Vétéran</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label>Genre</Label>
                            <Select
                              value={teamInfoForm.gender}
                              onValueChange={(v) =>
                                setTeamInfoForm(
                                  (p) =>
                                    p && { ...p, gender: v as Team["gender"] },
                                )
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
                          <div className="flex flex-col gap-1">
                            <Label>Niveau</Label>
                            <Input
                              placeholder="Ex: Régional 1"
                              value={teamInfoForm.level ?? ""}
                              onChange={(e) =>
                                setTeamInfoForm(
                                  (p) => p && { ...p, level: e.target.value },
                                )
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label>URL FFVB (scraping)</Label>
                            <Input
                              placeholder="https://www.ffvb.org/..."
                              value={teamInfoForm.federationUrl ?? ""}
                              onChange={(e) =>
                                setTeamInfoForm(
                                  (p) =>
                                    p && {
                                      ...p,
                                      federationUrl: e.target.value,
                                    },
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Créneaux entraînement */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold">
                                Créneaux d&apos;entraînement
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Affiché dans le calendrier visiteur
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={addSlot}
                            >
                              + Ajouter un créneau
                            </Button>
                          </div>

                          {teamInfoForm.trainingSchedule.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Aucun créneau configuré.
                            </p>
                          )}

                          <div className="flex flex-col gap-2">
                            {teamInfoForm.trainingSchedule.map((slot, i) => (
                              <div
                                key={i}
                                className="border rounded-lg p-3 flex flex-col gap-2 bg-muted/10"
                              >
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Jour</Label>
                                    <Select
                                      value={slot.day}
                                      onValueChange={(v) =>
                                        updateSlot(i, "day", v)
                                      }
                                    >
                                      <SelectTrigger className="h-8">
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
                                    <Label className="text-xs">
                                      Lieu / Gymnase
                                    </Label>
                                    <Input
                                      className="h-8"
                                      value={slot.location}
                                      onChange={(e) =>
                                        updateSlot(
                                          i,
                                          "location",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Gymnase municipal..."
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Début</Label>
                                    <Input
                                      type="time"
                                      className="h-8"
                                      value={slot.startTime}
                                      onChange={(e) =>
                                        updateSlot(
                                          i,
                                          "startTime",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Fin</Label>
                                    <Input
                                      type="time"
                                      className="h-8"
                                      value={slot.endTime}
                                      onChange={(e) =>
                                        updateSlot(i, "endTime", e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="self-end h-7"
                                  onClick={() => removeSlot(i)}
                                >
                                  Supprimer ce créneau
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                          {teamInfoSaved && (
                            <span className="text-sm text-green-600 self-center">
                              ✓ Sauvegardé
                            </span>
                          )}
                          <Button
                            onClick={handleSaveTeamInfo}
                            disabled={teamInfoSaving}
                          >
                            {teamInfoSaving
                              ? "Sauvegarde..."
                              : "Enregistrer les infos"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB : Membres du club
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "membres" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 flex-wrap">
            <Input
              className="flex-1 min-w-48"
              placeholder="Rechercher un membre..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            <Button onClick={() => setMemberModal({ ...EMPTY_MEMBER })}>
              + Nouveau membre
            </Button>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-medium">Aucun membre trouvé.</p>
              {members.length === 0 && (
                <Button
                  className="mt-4"
                  onClick={() => setMemberModal({ ...EMPTY_MEMBER })}
                >
                  Créer le premier membre
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMembers.map((m) => (
                <div
                  key={m._id}
                  className="border rounded-lg p-4 bg-background flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">
                        {m.firstName} {m.lastName}
                      </div>
                      {m.birthDate && (
                        <div className="text-xs text-muted-foreground">
                          Né le{" "}
                          {new Date(m.birthDate).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {m.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  {m.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {m.bio}
                    </p>
                  )}
                  <div className="flex gap-2 mt-auto pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMemberModal({ ...m })}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteMember(m)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ Modal : Saison ══ */}
      {seasonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-5 p-6">
            <h2 className="text-lg font-bold">
              {seasonModal._id ? "Modifier la saison" : "Nouvelle saison"}
            </h2>
            <div className="flex flex-col gap-1">
              <Label>Nom *</Label>
              <Input
                placeholder="Ex: 2024-2025"
                value={seasonModal.name ?? ""}
                onChange={(e) =>
                  setSeasonModal((p) => p && { ...p, name: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label>Début</Label>
                <Input
                  type="date"
                  value={seasonModal.startDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setSeasonModal(
                      (p) => p && { ...p, startDate: e.target.value },
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Fin</Label>
                <Input
                  type="date"
                  value={seasonModal.endDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setSeasonModal(
                      (p) => p && { ...p, endDate: e.target.value },
                    )
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Statut</Label>
              <Select
                value={seasonModal.status ?? "future"}
                onValueChange={(v) =>
                  setSeasonModal(
                    (p) => p && { ...p, status: v as Season["status"] },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="future">Future</SelectItem>
                  <SelectItem value="active">
                    Active (saison en cours)
                  </SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSeasonModal(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveSeason}
                disabled={seasonSaving || !seasonModal.name}
              >
                {seasonSaving ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal : Équipe (créer / modifier) ══ */}
      {teamModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-5 p-6">
            <h2 className="text-lg font-bold">
              {teamModal._id ? "Modifier l'équipe" : "Nouvelle équipe"}
            </h2>
            <div className="flex flex-col gap-1">
              <Label>Nom de l&apos;équipe *</Label>
              <Input
                placeholder="Ex: Senior Masculin 1"
                value={teamModal.name ?? ""}
                onChange={(e) =>
                  setTeamModal((p) => p && { ...p, name: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label>Catégorie</Label>
                <Select
                  value={teamModal.category ?? "Senior"}
                  onValueChange={(v) =>
                    setTeamModal(
                      (p) => p && { ...p, category: v as Team["category"] },
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Young">Jeune</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Veteran">Vétéran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Genre</Label>
                <Select
                  value={teamModal.gender ?? "Male"}
                  onValueChange={(v) =>
                    setTeamModal(
                      (p) => p && { ...p, gender: v as Team["gender"] },
                    )
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
            <div className="flex flex-col gap-1">
              <Label>
                Niveau{" "}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </Label>
              <Input
                placeholder="Ex: Régional 1, Départemental 2..."
                value={teamModal.level ?? ""}
                onChange={(e) =>
                  setTeamModal((p) => p && { ...p, level: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setTeamModal(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveTeamModal}
                disabled={teamModalSaving || !teamModal.name}
              >
                {teamModalSaving ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Drawer : Ajout de membres en lot ══ */}
      {showBatchAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold">Ajouter des membres</h2>
                <p className="text-sm text-muted-foreground">
                  {batchSelected.size === 0
                    ? "Cochez les membres à ajouter"
                    : `${batchSelected.size} sélectionné${batchSelected.size > 1 ? "s" : ""}`}
                </p>
              </div>
              <button
                onClick={() => setShowBatchAdd(false)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Filtres */}
            <div className="p-4 border-b shrink-0 flex gap-3 items-end flex-wrap">
              <div className="flex flex-col gap-1 flex-1 min-w-32">
                <Label className="text-xs">Rôle à attribuer</Label>
                <Select
                  value={batchRole}
                  onValueChange={(v) => setBatchRole(v as typeof batchRole)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {TEAM_ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-32">
                <Label className="text-xs">Rechercher</Label>
                <Input
                  className="h-9"
                  placeholder="Nom, prénom..."
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Liste */}
            <div className="overflow-y-auto flex-1">
              {availableForBatch.length === 0 ? (
                <p className="text-sm text-muted-foreground p-8 text-center">
                  {members.length <= assignedIds.size
                    ? "Tous les membres sont déjà dans cette équipe."
                    : "Aucun résultat pour cette recherche."}
                </p>
              ) : (
                <>
                  <button
                    onClick={toggleBatchAll}
                    className="w-full text-left px-5 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors border-b"
                  >
                    {availableForBatch.every((m) => batchSelected.has(m._id))
                      ? `Tout désélectionner (${availableForBatch.length})`
                      : `Tout sélectionner (${availableForBatch.length})`}
                  </button>
                  {availableForBatch.map((m) => (
                    <label
                      key={m._id}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted cursor-pointer border-b last:border-0 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 accent-primary"
                        checked={batchSelected.has(m._id)}
                        onChange={(e) => {
                          const next = new Set(batchSelected);
                          if (e.target.checked) next.add(m._id);
                          else next.delete(m._id);
                          setBatchSelected(next);
                        }}
                      />
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                        {m.firstName[0]}
                        {m.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {m.firstName} {m.lastName}
                        </div>
                        {!m.isActive && (
                          <div className="text-xs text-muted-foreground">
                            Inactif
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Le rôle peut être modifié après l&apos;ajout.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBatchAdd(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleBatchAdd}
                  disabled={batchSelected.size === 0 || batchSaving}
                >
                  {batchSaving
                    ? "Ajout en cours..."
                    : `Ajouter ${batchSelected.size > 0 ? batchSelected.size : ""} membre${batchSelected.size > 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal : Modifier affectation ══ */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingAssignment.memberId.firstName}{" "}
                {editingAssignment.memberId.lastName}
              </h2>
              <button
                onClick={() => setEditingAssignment(null)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {TEAM_ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editForm.role === "player" && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Poste</Label>
                  <Select
                    value={editForm.position}
                    onValueChange={(v) =>
                      setEditForm((p) => ({ ...p, position: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs">N° de maillot</Label>
              <Input
                type="number"
                placeholder="Ex: 10"
                value={editForm.jerseyNumber}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, jerseyNumber: e.target.value }))
                }
              />
            </div>

            {editForm.role === "player" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={editForm.isCaptain}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, isCaptain: e.target.checked }))
                  }
                />
                <span className="text-sm">Capitaine de l&apos;équipe</span>
              </label>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingAssignment(null)}
              >
                Annuler
              </Button>
              <Button onClick={handleSaveAssignment} disabled={editSaving}>
                {editSaving ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal : Coupe ══ */}
      {cupModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {cupModal._id ? "Modifier la coupe" : "Nouvelle phase de coupe"}
              </h2>
              <button
                onClick={() => setCupModal(null)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Type de coupe</Label>
              <Select
                value={cupModal.type ?? "anjou"}
                onValueChange={(v) =>
                  setCupModal((p) => p && { ...p, type: v as CupPhase["type"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CUP_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Nom du tour / phase *</Label>
              <Input
                autoFocus
                placeholder="Ex: 1/8 de finale, Tour régional…"
                value={cupModal.name ?? ""}
                onChange={(e) =>
                  setCupModal((p) => p && { ...p, name: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>
                URL FFVB{" "}
                <span className="text-muted-foreground font-normal">
                  (pour le scraping des matchs)
                </span>
              </Label>
              <Input
                placeholder="https://www.ffvb.org/..."
                value={cupModal.url ?? ""}
                onChange={(e) =>
                  setCupModal((p) => p && { ...p, url: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </Label>
              <textarea
                className="border rounded px-3 py-2 text-sm resize-none h-16 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Informations complémentaires…"
                value={cupModal.notes ?? ""}
                onChange={(e) =>
                  setCupModal((p) => p && { ...p, notes: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCupModal(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveCup}
                disabled={cupSaving || !cupModal.name}
              >
                {cupSaving ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal : Membre ══ */}
      {memberModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {(memberModal as Member)._id
                  ? "Modifier le membre"
                  : "Nouveau membre"}
              </h2>
              <button
                onClick={() => setMemberModal(null)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label>Prénom *</Label>
                <Input
                  autoFocus
                  value={memberModal.firstName ?? ""}
                  onChange={(e) =>
                    setMemberModal(
                      (p) => p && { ...p, firstName: e.target.value },
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Nom *</Label>
                <Input
                  value={memberModal.lastName ?? ""}
                  onChange={(e) =>
                    setMemberModal(
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
                value={memberModal.birthDate?.split("T")[0] ?? ""}
                onChange={(e) =>
                  setMemberModal(
                    (p) => p && { ...p, birthDate: e.target.value },
                  )
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>
                Bio{" "}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </Label>
              <textarea
                className="border rounded px-3 py-2 text-sm resize-none h-16 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={memberModal.bio ?? ""}
                onChange={(e) =>
                  setMemberModal((p) => p && { ...p, bio: e.target.value })
                }
                placeholder="Quelques mots sur ce membre..."
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={memberModal.isActive ?? true}
                onChange={(e) =>
                  setMemberModal(
                    (p) => p && { ...p, isActive: e.target.checked },
                  )
                }
              />
              <span className="text-sm">Membre actif</span>
            </label>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMemberModal(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveMember}
                disabled={
                  memberSaving ||
                  !memberModal.firstName ||
                  !memberModal.lastName
                }
              >
                {memberSaving ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant carte membre dans l'équipe ────────────────────────────────────

function AssignmentCard({
  assignment,
  onEdit,
  onRemove,
}: {
  assignment: TeamAssignment;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const {
    memberId: m,
    role,
    position,
    isCaptain,
    jerseyNumber,
    photo,
  } = assignment;
  const label =
    role === "player" && position ? position : (TEAM_ROLE_LABELS[role] ?? role);
  const src = photo
    ? photo.startsWith("http")
      ? photo
      : `${API}${photo}`
    : null;

  return (
    <div className="flex items-center gap-3 border rounded-lg p-3 bg-background hover:bg-muted/20 transition-colors">
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
        {src ? (
          <Image
            src={src}
            alt=""
            width={36}
            height={36}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          `${m.firstName[0]}${m.lastName[0]}`
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
          {m.firstName} {m.lastName}
          {isCaptain && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
              Capitaine
            </span>
          )}
          {jerseyNumber && (
            <span className="text-xs text-muted-foreground font-normal">
              #{jerseyNumber}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground capitalize">{label}</div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={onEdit}
        >
          Modifier
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
          onClick={onRemove}
        >
          Retirer
        </Button>
      </div>
    </div>
  );
}
