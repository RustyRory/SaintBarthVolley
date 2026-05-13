"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  _id: string;
  name: string;
}

interface EventForm {
  title: string;
  type: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  teamId: string;
  isPublic: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES: {
  value: string;
  label: string;
  icon: string;
  color: string;
}[] = [
  {
    value: "loto",
    label: "Loto",
    icon: "🎲",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "ag",
    label: "Assemblée Générale",
    icon: "🗳",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "tournament",
    label: "Tournoi",
    icon: "🏆",
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "partner",
    label: "Partenaire",
    icon: "🤝",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "team",
    label: "Équipe",
    icon: "🏐",
    color: "bg-green-100 text-green-700",
  },
  {
    value: "other",
    label: "Autre",
    icon: "📌",
    color: "bg-gray-100 text-gray-600",
  },
];

const TYPE_COLOR: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.color]),
);
const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label]),
);
const TYPE_ICON: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.icon]),
);

const EMPTY: EventForm = {
  title: "",
  type: "other",
  description: "",
  date: new Date().toISOString().slice(0, 16),
  endDate: "",
  location: "",
  teamId: "",
  isPublic: true,
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";

  const [form, setForm] = React.useState<EventForm>(EMPTY);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [teams, setTeams] = React.useState<Team[]>([]);

  React.useEffect(() => {
    const loads: Promise<unknown>[] = [
      apiFetch<Team[]>("/api/teams").catch(() => [] as Team[]),
    ];
    if (!isNew) {
      loads.push(apiFetch(`/api/events/${id}`));
    }
    Promise.all(loads)
      .then(([teamsData, eventData]) => {
        setTeams(teamsData as Team[]);
        if (eventData) {
          const e = eventData as Record<string, unknown>;
          setForm({
            title: (e.title as string) ?? "",
            type: (e.type as string) ?? "other",
            description: (e.description as string) ?? "",
            date: toDatetimeLocal(e.date as string),
            endDate: toDatetimeLocal(e.endDate as string),
            location: (e.location as string) ?? "",
            teamId:
              typeof e.teamId === "object" && e.teamId !== null
                ? (e.teamId as { _id: string })._id
                : ((e.teamId as string) ?? ""),
            isPublic: (e.isPublic as boolean) ?? true,
          });
        }
      })
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) {
      alert("Le titre et la date sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        teamId: form.teamId || null,
        endDate: form.endDate || null,
      };
      if (isNew) {
        const created = await apiFetch<{ _id: string }>("/api/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.replace(`/admin/events/${created._id}`);
      } else {
        await apiFetch(`/api/events/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading)
    return <div className="p-8 text-muted-foreground">Chargement…</div>;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      {/* ── Header fixe ── */}
      <div className="flex items-center justify-between gap-4 py-4 border-b bg-background sticky top-0 z-20 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/events")}
          >
            ← Retour
          </Button>
          <span className="text-sm text-muted-foreground">
            {isNew ? "Nouvel événement" : form.title || "Sans titre"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-green-600">✓ Sauvegardé</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Sauvegarde…"
              : isNew
                ? "Créer l'événement"
                : "Enregistrer"}
          </Button>
          <Button
            size="sm"
            variant={form.isPublic ? "secondary" : "default"}
            onClick={() => setForm((p) => ({ ...p, isPublic: !p.isPublic }))}
          >
            {form.isPublic ? "Dépublier" : "Publier"}
          </Button>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="flex flex-col lg:flex-row gap-6 py-6 flex-1 min-h-0">
        {/* Colonne principale */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Bandeau type */}
          <div className="flex gap-2 flex-wrap">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.type === t.value ? t.color + " border-current ring-1 ring-current" : "bg-background border-border text-muted-foreground hover:bg-muted"}`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Titre */}
          <div className="flex flex-col gap-1">
            <input
              className="text-3xl font-bold w-full bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0"
              placeholder="Titre de l'événement…"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
            {form.type && (
              <span
                className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLOR[form.type] ?? ""}`}
              >
                {TYPE_ICON[form.type]} {TYPE_LABEL[form.type]}
              </span>
            )}
          </div>

          <div className="border-t" />

          {/* Dates & lieu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Date de début *</Label>
              <input
                type="datetime-local"
                className="border rounded px-3 py-2 text-sm bg-background w-full"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>
                Date de fin{" "}
                <span className="text-muted-foreground font-normal">
                  (optionnel)
                </span>
              </Label>
              <input
                type="datetime-local"
                className="border rounded px-3 py-2 text-sm bg-background w-full"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Lieu</Label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm bg-background w-full"
              placeholder="Gymnase municipal, Salle des fêtes…"
              value={form.location}
              onChange={(e) =>
                setForm((p) => ({ ...p, location: e.target.value }))
              }
            />
          </div>

          <div className="border-t" />

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Label>Description</Label>
            <textarea
              className="border rounded px-3 py-3 text-sm bg-background w-full resize-y min-h-[200px] focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              placeholder="Détails de l'événement, informations pratiques, programme…"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
        </div>

        {/* ── Panneau latéral ── */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-4">
          {/* Statut */}
          <div className="border rounded-lg p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Visibilité
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Statut</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${form.isPublic ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
              >
                {form.isPublic ? "Public" : "Privé"}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={form.isPublic}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isPublic: e.target.checked }))
                }
              />
              <span className="text-sm">Visible sur le site public</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Les événements publics apparaissent sur la page agenda du site
              visiteur.
            </p>
          </div>

          {/* Type */}
          <div className="border rounded-lg p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Type d&apos;événement
            </p>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Équipe liée */}
          <div className="border rounded-lg p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Équipe liée
            </p>
            <Select
              value={form.teamId || "__none__"}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, teamId: v === "__none__" ? "" : v }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Aucune équipe —</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="border rounded-lg p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actions
            </p>
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving}
              variant="outline"
            >
              {saving
                ? "Sauvegarde…"
                : isNew
                  ? "Créer l'événement"
                  : "Enregistrer"}
            </Button>
            <Button
              className="w-full"
              variant={form.isPublic ? "secondary" : "default"}
              onClick={() => setForm((p) => ({ ...p, isPublic: !p.isPublic }))}
            >
              {form.isPublic ? "Dépublier" : "Publier"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
