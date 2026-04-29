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

interface Team {
  _id: string;
  name: string;
}

interface ClubEvent {
  _id: string;
  title: string;
  type: "loto" | "ag" | "tournament" | "partner" | "team" | "other";
  description: string;
  date: string;
  endDate: string | null;
  location: string;
  teamId: Team | null;
  isPublic: boolean;
}

type EditingEvent = Partial<Omit<ClubEvent, "_id" | "teamId">> & {
  _id?: string;
  teamId?: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: string; label: string; color: string }[] = [
  { value: "loto", label: "Loto", color: "bg-yellow-100 text-yellow-700" },
  {
    value: "ag",
    label: "Assemblée Générale",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "tournament",
    label: "Tournoi",
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "partner",
    label: "Partenaire",
    color: "bg-orange-100 text-orange-700",
  },
  { value: "team", label: "Équipe", color: "bg-green-100 text-green-700" },
  { value: "other", label: "Autre", color: "bg-gray-100 text-gray-600" },
];

const TYPE_COLOR: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.color]),
);
const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label]),
);

const EMPTY: EditingEvent = {
  title: "",
  type: "other",
  description: "",
  date: new Date().toISOString().slice(0, 16),
  endDate: null,
  location: "",
  teamId: null,
  isPublic: true,
};

function toInputDatetime(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  const [editing, setEditing] = React.useState<EditingEvent | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      apiFetch<ClubEvent[]>("/api/events"),
      apiFetch<Team[]>("/api/teams"),
    ])
      .then(([evts, tms]) => {
        setEvents(evts);
        setTeams(tms);
      })
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        teamId: editing.teamId || null,
        endDate: editing.endDate || null,
      };
      let result: ClubEvent;
      if (editing._id) {
        result = await apiFetch(`/api/events/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setEvents((prev) =>
          prev.map((e) => (e._id === result._id ? result : e)),
        );
      } else {
        result = await apiFetch("/api/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setEvents((prev) => [result, ...prev]);
      }
      setEditing(null);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleTogglePublic = async (evt: ClubEvent) => {
    try {
      const result: ClubEvent = await apiFetch(`/api/events/${evt._id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublic: !evt.isPublic }),
      });
      setEvents((prev) => prev.map((e) => (e._id === result._id ? result : e)));
    } catch {
      alert("Erreur");
    }
  };

  const filtered = React.useMemo(() => {
    return events
      .filter((e) => filterType === "all" || e.type === filterType)
      .filter(
        (e) => !search || e.title.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, filterType, search]);

  const upcoming = events.filter((e) => new Date(e.date) >= new Date()).length;

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Événements du club</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {events.length} événement{events.length !== 1 ? "s" : ""} ·{" "}
            {upcoming} à venir
          </p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          + Nouvel événement
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Tous
          </button>
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() =>
                setFilterType(filterType === t.value ? "all" : t.value)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === t.value ? t.color + " ring-1 ring-current" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            Aucun événement
          </div>
        ) : (
          filtered.map((evt) => (
            <div
              key={evt._id}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{evt.title}</p>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[evt.type] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {TYPE_LABEL[evt.type] ?? evt.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(evt.date).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {evt.location && ` · ${evt.location}`}
              </p>
              {evt.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {evt.description}
                </p>
              )}
              <div className="flex gap-2 mt-1 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEditing({ ...evt, teamId: evt.teamId?._id ?? null })
                  }
                >
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant={evt.isPublic ? "secondary" : "outline"}
                  onClick={() => handleTogglePublic(evt)}
                >
                  {evt.isPublic ? "Public" : "Privé"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(evt._id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table desktop */}
      <div className="hidden md:block rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Événement</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Lieu</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((evt) => {
                const isPast = new Date(evt.date) < new Date();
                return (
                  <tr
                    key={evt._id}
                    className={`border-t ${isPast ? "opacity-60" : ""}`}
                  >
                    <td className="p-3 max-w-xs">
                      <p className="font-medium truncate">{evt.title}</p>
                      {evt.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {evt.description}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[evt.type] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {TYPE_LABEL[evt.type] ?? evt.type}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground text-xs">
                      {new Date(evt.date).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-muted-foreground text-sm">
                      {evt.location || "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${evt.isPublic ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                      >
                        {evt.isPublic ? "Public" : "Privé"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditing({
                              ...evt,
                              teamId: evt.teamId?._id ?? null,
                            })
                          }
                        >
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant={evt.isPublic ? "secondary" : "outline"}
                          onClick={() => handleTogglePublic(evt)}
                        >
                          {evt.isPublic ? "Dépublier" : "Publier"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(evt._id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="h-40 text-center text-muted-foreground"
                >
                  Aucun événement. Créez le premier !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">
                {editing._id ? "Modifier l'événement" : "Nouvel événement"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
              <div className="flex flex-col gap-1">
                <Label>Titre *</Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) =>
                    setEditing((p) => p && { ...p, title: e.target.value })
                  }
                  placeholder="Nom de l'événement"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>Type</Label>
                  <Select
                    value={editing.type ?? "other"}
                    onValueChange={(v) =>
                      setEditing(
                        (p) => p && { ...p, type: v as ClubEvent["type"] },
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Équipe liée</Label>
                  <Select
                    value={editing.teamId ?? "__none__"}
                    onValueChange={(v) =>
                      setEditing(
                        (p) =>
                          p && { ...p, teamId: v === "__none__" ? null : v },
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Aucune —</SelectItem>
                      {teams.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>Date de début *</Label>
                  <Input
                    type="datetime-local"
                    value={toInputDatetime(editing.date)}
                    onChange={(e) =>
                      setEditing((p) => p && { ...p, date: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Date de fin</Label>
                  <Input
                    type="datetime-local"
                    value={toInputDatetime(editing.endDate)}
                    onChange={(e) =>
                      setEditing(
                        (p) => p && { ...p, endDate: e.target.value || null },
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Lieu</Label>
                <Input
                  value={editing.location ?? ""}
                  onChange={(e) =>
                    setEditing((p) => p && { ...p, location: e.target.value })
                  }
                  placeholder="Gymnase, salle des fêtes..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Description</Label>
                <textarea
                  className="border rounded px-3 py-2 text-sm resize-y min-h-24 bg-background"
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEditing(
                      (p) => p && { ...p, description: e.target.value },
                    )
                  }
                  placeholder="Détails de l'événement..."
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

            <div className="p-5 border-t flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !editing.title?.trim() || !editing.date}
              >
                {saving
                  ? "Sauvegarde..."
                  : editing._id
                    ? "Mettre à jour"
                    : "Créer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
