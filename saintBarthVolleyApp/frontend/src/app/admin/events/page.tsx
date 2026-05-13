"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  React.useEffect(() => {
    apiFetch<ClubEvent[]>("/api/events")
      .then(setEvents)
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = React.useMemo(
    () =>
      events
        .filter((e) => filterType === "all" || e.type === filterType)
        .filter(
          (e) =>
            !search || e.title.toLowerCase().includes(search.toLowerCase()),
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [events, filterType, search],
  );

  const upcoming = events.filter((e) => new Date(e.date) >= new Date()).length;

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Événements du club</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} événement{events.length !== 1 ? "s" : ""}
            {" · "}
            <span className="text-green-600 font-medium">
              {upcoming} à venir
            </span>
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button>+ Nouvel événement</Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
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

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <div className="text-5xl">📅</div>
          <p className="font-medium">
            {events.length === 0
              ? "Aucun événement pour le moment."
              : "Aucun résultat."}
          </p>
          {events.length === 0 && (
            <Link href="/admin/events/new">
              <Button>Créer le premier événement</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((evt) => {
            const isPast = new Date(evt.date) < new Date();
            return (
              <div
                key={evt._id}
                className={`border rounded-xl bg-background flex gap-4 p-4 hover:shadow-sm transition-shadow ${isPast ? "opacity-70" : ""}`}
              >
                {/* Pastille type */}
                <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-muted text-center">
                  <span className="text-xl">
                    {evt.type === "loto"
                      ? "🎲"
                      : evt.type === "ag"
                        ? "🗳"
                        : evt.type === "tournament"
                          ? "🏆"
                          : evt.type === "partner"
                            ? "🤝"
                            : evt.type === "team"
                              ? "🏐"
                              : "📌"}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLOR[evt.type] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {TYPE_LABEL[evt.type] ?? evt.type}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${evt.isPublic ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                      >
                        {evt.isPublic ? "Public" : "Privé"}
                      </span>
                      {isPast && (
                        <span className="text-xs text-muted-foreground">
                          Passé
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(evt.date).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="font-semibold text-sm sm:text-base line-clamp-1">
                    {evt.title}
                  </p>

                  {(evt.location || evt.teamId) && (
                    <p className="text-xs text-muted-foreground">
                      {evt.location && `📍 ${evt.location}`}
                      {evt.location && evt.teamId && " · "}
                      {evt.teamId && `🏐 ${evt.teamId.name}`}
                    </p>
                  )}

                  {evt.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {evt.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Link href={`/admin/events/${evt._id}`}>
                      <Button size="sm" variant="outline">
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={evt.isPublic ? "secondary" : "outline"}
                      onClick={() => handleTogglePublic(evt)}
                    >
                      {evt.isPublic ? "Dépublier" : "Publier"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(evt._id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
