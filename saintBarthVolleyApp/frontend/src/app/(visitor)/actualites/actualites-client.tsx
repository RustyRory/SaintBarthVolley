"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Newspaper,
  MapPin,
  ChevronDown,
  Dumbbell,
  Clock,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type TrainingSlot = {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  startTime: string;
  endTime: string;
  location: string;
};

type Team = {
  _id: string;
  name: string;
  category: string;
  gender: string;
  trainingSchedule?: TrainingSlot[];
};

type Match = {
  _id: string;
  teamId: Team;
  opponentName: string;
  date: string;
  address: string;
  homeAway: "home" | "away";
  status: "scheduled" | "played";
  scoreFor: number | null;
  scoreAgainst: number | null;
};

type ClubEvent = {
  _id: string;
  title: string;
  type: "loto" | "ag" | "tournament" | "partner" | "team" | "other";
  description: string;
  date: string;
  endDate: string | null;
  location: string;
  teamId: Team | null;
};

type TrainingEvent = {
  id: string;
  teamId: string;
  teamName: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
};

type NewsItem = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  authorId: { firstName: string; lastName: string } | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAY_NUM: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  loto: { label: "Loto", color: "bg-yellow-100 text-yellow-700" },
  ag: { label: "Assemblée Générale", color: "bg-blue-100 text-blue-700" },
  tournament: { label: "Tournoi", color: "bg-purple-100 text-purple-700" },
  partner: { label: "Partenaire", color: "bg-orange-100 text-orange-700" },
  team: { label: "Équipe", color: "bg-green-100 text-green-700" },
  other: { label: "Événement", color: "bg-gray-100 text-gray-600" },
};

function fDate(iso: string) {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}h${d.getMinutes().toString().padStart(2, "0")}`;
}

function generateTrainings(teams: Team[]): TrainingEvent[] {
  const NOW = new Date();
  const today = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  const limit = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const result: TrainingEvent[] = [];

  for (let d = new Date(today); d < limit; d.setDate(d.getDate() + 1)) {
    const dayNum = d.getDay();
    const dateStr = d.toISOString().split("T")[0];

    teams.forEach((team) => {
      (team.trainingSchedule ?? []).forEach((slot) => {
        if (DAY_NUM[slot.day] !== dayNum) return;
        const date = new Date(`${dateStr}T${slot.startTime}:00`);
        if (date < NOW) return; // skip if already passed today
        result.push({
          id: `${team._id}-${slot.day}-${dateStr}`,
          teamId: team._id,
          teamName: team.name,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: slot.location,
        });
      });
    });
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ── Vues disponibles ──────────────────────────────────────────────────────

type ViewKey =
  | "upcoming_all"
  | "home_upcoming"
  | "all_upcoming"
  | "away_upcoming"
  | "results"
  | "all"
  | "training"
  | "club_events";

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "upcoming_all", label: "Tous les événements à venir" },
  { key: "home_upcoming", label: "Matchs domicile à venir" },
  { key: "all_upcoming", label: "Tous les matchs à venir" },
  { key: "away_upcoming", label: "Matchs extérieur à venir" },
  { key: "results", label: "Derniers résultats" },
  { key: "all", label: "Tous les matchs" },
  { key: "training", label: "Entraînements (7 jours)" },
  { key: "club_events", label: "Événements du club" },
];

// ── Composants cards ───────────────────────────────────────────────────────

function DateBloc({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <div className="shrink-0 w-12 text-center">
      <p className="text-xs text-gray-400 uppercase">{DAYS[d.getDay()]}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">
        {d.getDate()}
      </p>
      <p className="text-xs text-gray-500">
        {MONTHS[d.getMonth()].slice(0, 3)}
      </p>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const isHome = match.homeAway === "home";
  const played = match.status === "played" || new Date(match.date) < new Date();
  const won =
    played &&
    match.scoreFor !== null &&
    match.scoreAgainst !== null &&
    match.scoreFor > match.scoreAgainst;
  const lost =
    played &&
    match.scoreFor !== null &&
    match.scoreAgainst !== null &&
    match.scoreFor < match.scoreAgainst;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
      <DateBloc iso={match.date} />
      <div className="w-px h-10 bg-gray-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-900 text-white">
            Match
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isHome ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
          >
            {isHome ? "Domicile" : "Extérieur"}
          </span>
          {match.teamId && (
            <span className="text-xs text-gray-400 truncate">
              {match.teamId.name}
            </span>
          )}
        </div>
        <p className="font-semibold text-gray-900 truncate">
          vs {match.opponentName}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-400">{fTime(match.date)}</span>
          {match.address && (
            <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
              <MapPin size={10} />
              {match.address}
            </span>
          )}
        </div>
      </div>
      {played && match.scoreFor !== null && match.scoreAgainst !== null && (
        <div
          className={`shrink-0 px-3 py-1.5 rounded-lg font-bold text-sm ${won ? "bg-green-100 text-green-700" : lost ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
        >
          {match.scoreFor} – {match.scoreAgainst}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: ClubEvent }) {
  const meta = EVENT_LABELS[event.type] ?? EVENT_LABELS.other;
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
      <DateBloc iso={event.date} />
      <div className="w-px h-10 bg-gray-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}
          >
            {meta.label}
          </span>
          {event.teamId && (
            <span className="text-xs text-gray-400">{event.teamId.name}</span>
          )}
        </div>
        <p className="font-semibold text-gray-900 truncate">{event.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-400">{fTime(event.date)}</span>
          {event.location && (
            <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
              <MapPin size={10} />
              {event.location}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}

function TrainingCard({ training }: { training: TrainingEvent }) {
  const iso = training.date.toISOString();
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all">
      <DateBloc iso={iso} />
      <div className="w-px h-10 bg-blue-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Entraînement
          </span>
          <span className="text-xs text-gray-400 truncate">
            {training.teamName}
          </span>
        </div>
        <p className="font-semibold text-gray-900 truncate">
          Entraînement — {training.teamName}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={10} />
            {training.startTime} – {training.endTime}
          </span>
          {training.location && (
            <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
              <MapPin size={10} />
              {training.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const excerpt = item.content.replace(/<[^>]*>/g, "").slice(0, 160);
  const date = item.publishedAt ?? item.createdAt;
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-white overflow-hidden">
      {item.isFeatured && (
        <div className="h-1 bg-gradient-to-r from-green-500 to-green-700" />
      )}
      <CardContent className="p-5">
        {item.isFeatured && (
          <span className="inline-block mb-2 text-xs font-semibold text-green-700 uppercase tracking-wider">
            À la une
          </span>
        )}
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">
          {excerpt}
          {item.content.length > 160 && "…"}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{fDate(date)}</span>
          {item.authorId && (
            <span>
              {item.authorId.firstName} {item.authorId.lastName}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Composant principal ───────────────────────────────────────────────────

interface Props {
  matches: Match[];
  events: ClubEvent[];
  news: NewsItem[];
}

const NOW = new Date();

export default function ActualitesClient({ matches, events, news }: Props) {
  const [tab, setTab] = useState<"calendrier" | "articles">("articles");
  const [view, setView] = useState<ViewKey>("upcoming_all");
  const [teamId, setTeamId] = useState<string>("all");

  // Équipes uniques extraites des matchs (avec trainingSchedule)
  const teams = useMemo(() => {
    const map = new Map<string, Team>();
    matches.forEach((m) => {
      if (m.teamId) map.set(m.teamId._id, m.teamId);
    });
    return Array.from(map.values());
  }, [matches]);

  // Entraînements générés pour les 7 prochains jours
  const trainings = useMemo(() => {
    const src =
      teamId === "all" ? teams : teams.filter((t) => t._id === teamId);
    return generateTrainings(src);
  }, [teams, teamId]);

  // Matchs filtrés
  const filteredMatches = useMemo(() => {
    if (view === "training" || view === "club_events") return [];
    let list = [...matches];
    if (teamId !== "all") list = list.filter((m) => m.teamId?._id === teamId);

    switch (view) {
      case "upcoming_all":
        list = list.filter(
          (m) => m.status === "scheduled" && new Date(m.date) >= NOW,
        );
        break;
      case "home_upcoming":
        list = list.filter(
          (m) =>
            m.homeAway === "home" &&
            m.status === "scheduled" &&
            new Date(m.date) >= NOW,
        );
        break;
      case "all_upcoming":
        list = list.filter(
          (m) => m.status === "scheduled" && new Date(m.date) >= NOW,
        );
        break;
      case "away_upcoming":
        list = list.filter(
          (m) =>
            m.homeAway === "away" &&
            m.status === "scheduled" &&
            new Date(m.date) >= NOW,
        );
        break;
      case "results":
        list = list.filter(
          (m) => m.status === "played" || new Date(m.date) < NOW,
        );
        break;
      case "all":
        break;
    }
    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [matches, view, teamId]);

  // Événements club filtrés — dans la vue dédiée ou dans "tous les événements à venir"
  const filteredEvents = useMemo(() => {
    if (view === "club_events") return [...events];
    if (view === "upcoming_all")
      return events.filter((e) => new Date(e.date) >= NOW);
    return [];
  }, [events, view]);

  // Groupement par mois
  type AnyEntry =
    | { kind: "match"; data: Match }
    | { kind: "event"; data: ClubEvent }
    | { kind: "training"; data: TrainingEvent };

  const grouped = useMemo(() => {
    let entries: (AnyEntry & { date: Date })[] = [];

    if (view === "training") {
      entries = trainings.map((t) => ({
        kind: "training" as const,
        data: t,
        date: t.date,
      }));
    } else {
      entries = [
        ...filteredMatches.map((m) => ({
          kind: "match" as const,
          data: m,
          date: new Date(m.date),
        })),
        ...filteredEvents.map((e) => ({
          kind: "event" as const,
          data: e,
          date: new Date(e.date),
        })),
      ];
    }

    // Vues "à venir" : asc (prochain en premier) — résultats/historique : desc
    const asc =
      view === "training" ||
      view === "upcoming_all" ||
      view === "club_events" ||
      view === "home_upcoming" ||
      view === "all_upcoming" ||
      view === "away_upcoming";
    entries.sort((a, b) =>
      asc
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime(),
    );

    const map = new Map<string, AnyEntry[]>();
    entries.forEach(({ kind, data, date }) => {
      const key = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      const bucket = map.get(key) ?? [];
      bucket.push({ kind, data } as AnyEntry);
      map.set(key, bucket);
    });
    return map;
  }, [filteredMatches, filteredEvents, trainings, view]);

  const isEmpty = grouped.size === 0;

  return (
    <div>
      {/* Onglets */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex gap-1">
          {(
            [
              { key: "articles", label: "Articles", icon: Newspaper },
              { key: "calendrier", label: "Calendrier", icon: Calendar },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ── CALENDRIER ── */}
        {tab === "calendrier" && (
          <>
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value as ViewKey)}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                >
                  {VIEWS.map((v) => (
                    <option key={v.key} value={v.key}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {teams.length > 0 &&
                view !== "club_events" &&
                view !== "training" && (
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                    >
                      <option value="all">Toutes les équipes</option>
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                )}

              {view === "training" && (
                <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg w-fit">
                  <Dumbbell size={12} />
                  Entraînements des 7 prochains jours
                </span>
              )}
              {view === "club_events" && (
                <span className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg w-fit">
                  Loto, assemblées, tournois, soirées partenaires…
                </span>
              )}
            </div>

            {/* Liste groupée par mois */}
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                {view === "training" ? (
                  <Dumbbell size={48} className="mb-4 opacity-30" />
                ) : (
                  <Calendar size={48} className="mb-4 opacity-30" />
                )}
                <p className="font-medium text-gray-500">
                  {view === "training"
                    ? "Aucun entraînement prévu dans les 7 prochains jours."
                    : view === "club_events"
                      ? "Aucun événement du club pour le moment."
                      : view === "upcoming_all"
                        ? "Aucun événement à venir pour le moment."
                        : "Aucun élément pour cette sélection."}
                </p>
                {view !== "training" &&
                  view !== "club_events" &&
                  view !== "upcoming_all" && (
                    <p className="text-sm mt-1">Essayez un autre filtre.</p>
                  )}
              </div>
            ) : (
              <div className="space-y-10">
                {Array.from(grouped.entries()).map(([month, entries]) => (
                  <div key={month}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      {month}
                    </p>
                    <div className="space-y-2">
                      {entries.map((entry, i) => {
                        if (entry.kind === "match")
                          return (
                            <MatchCard
                              key={`m-${(entry.data as Match)._id}`}
                              match={entry.data as Match}
                            />
                          );
                        if (entry.kind === "event")
                          return (
                            <EventCard
                              key={`e-${(entry.data as ClubEvent)._id}`}
                              event={entry.data as ClubEvent}
                            />
                          );
                        if (entry.kind === "training")
                          return (
                            <TrainingCard
                              key={`t-${(entry.data as TrainingEvent).id}-${i}`}
                              training={entry.data as TrainingEvent}
                            />
                          );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ARTICLES ── */}
        {tab === "articles" &&
          (news.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Newspaper size={40} className="mb-4 opacity-30" />
              <p className="font-medium text-gray-500">
                Aucun article publié pour le moment.
              </p>
              <p className="text-sm mt-1">Revenez bientôt !</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {news.map((item) => (
                <NewsCard key={item._id} item={item} />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
