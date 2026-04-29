"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Shield,
  Crown,
  ChevronDown,
  ExternalLink,
  Award,
  Loader2,
  Image as ImageIcon,
  Newspaper,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────

type Album = {
  _id: string;
  title: string;
  description: string;
  coverPhoto: string;
  eventDate: string | null;
  newsId?: { _id: string; title: string; slug: string } | null;
};

type NewsArticle = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  createdAt: string;
};

type CupPhase = {
  _id: string;
  name: string;
  type: "anjou" | "france" | "regional" | "other";
  url: string;
  notes: string;
};

type ScrapedMatch = {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  scoreHome: string | null;
  scoreAway: string | null;
};

type TeamAssignment = {
  _id: string;
  memberId: { _id: string; firstName: string; lastName: string };
  role: "player" | "coach" | "assistant_coach";
  position?: string;
  isCaptain: boolean;
  jerseyNumber?: number | null;
  photo?: string;
};

type Standing = {
  _id: string;
  teamId: string;
  teamName: string;
  rank: number;
  points: number;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
};

type SetDetail = { setNumber: number; scoreFor: number; scoreAgainst: number };

type Match = {
  _id: string;
  opponentName: string;
  date: string;
  address: string;
  homeAway: "home" | "away";
  status: "scheduled" | "played";
  scoreFor: number | null;
  scoreAgainst: number | null;
  setsDetail: SetDetail[];
};

// ─── Labels ───────────────────────────────────────────────

const roleLabel: Record<string, string> = {
  player: "Joueur",
  coach: "Entraîneur",
  assistant_coach: "Entraîneur assistant",
};

const positionLabel: Record<string, string> = {
  setter: "Passeur",
  libero: "Libéro",
  receiver: "Réceptionneur-attaquant",
  middle: "Central",
  universal: "Universel",
  opposite: "Pointu",
};

const monthFr = [
  "jan.",
  "fév.",
  "mar.",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sep.",
  "oct.",
  "nov.",
  "déc.",
];

// ─── Helpers ──────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveImageUrl(src?: string): string | null {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: monthFr[d.getMonth()],
    year: d.getFullYear(),
    weekday: d.toLocaleDateString("fr-FR", { weekday: "long" }),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Sub-components ───────────────────────────────────────

function RosterTab({ roster }: { roster: TeamAssignment[] }) {
  if (roster.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <Users size={40} strokeWidth={1} className="mb-3" />
        <p className="text-sm text-gray-400">Aucun joueur renseigné</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {roster.map((a) => {
        const { memberId: member } = a;
        const photoUrl = resolveImageUrl(a.photo);
        return (
          <div
            key={a._id}
            className="flex flex-col items-center text-center group"
          >
            <div className="relative mb-3">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-green-400 transition-colors bg-gradient-to-br from-green-100 to-green-200 shadow-sm">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-700 font-bold text-xl">
                    {initials(member.firstName, member.lastName)}
                  </div>
                )}
              </div>
              {a.isCaptain && (
                <div
                  className="absolute -top-1 -right-1 h-5 w-5 bg-amber-400 rounded-full flex items-center justify-center"
                  title="Capitaine"
                >
                  <Crown size={10} className="text-white" />
                </div>
              )}
              {a.jerseyNumber != null && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  {a.jerseyNumber}
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {member.firstName}
            </p>
            <p className="text-sm text-gray-700 leading-tight font-medium">
              {member.lastName}
            </p>
            {a.position && (
              <p className="text-xs text-gray-400 mt-1">
                {positionLabel[a.position] ?? a.position}
              </p>
            )}
            <span
              className={`mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                a.role === "player"
                  ? "bg-green-100 text-green-700"
                  : a.role === "coach"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {roleLabel[a.role] ?? a.role}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StandingsTab({
  standings,
  federationUrl,
}: {
  standings: Standing[];
  federationUrl?: string;
}) {
  if (standings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <Trophy size={40} strokeWidth={1} className="mb-3" />
        <p className="text-sm text-gray-400">Aucun classement disponible</p>
      </div>
    );
  }
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Équipe
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Pts
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                J
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                V
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                D
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Sets +
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Sets -
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...standings]
              .sort((a, b) => a.rank - b.rank)
              .map((row, idx) => {
                const rankMedal =
                  row.rank === 1
                    ? "🥇"
                    : row.rank === 2
                      ? "🥈"
                      : row.rank === 3
                        ? "🥉"
                        : null;
                return (
                  <tr
                    key={row._id}
                    className={`transition-colors hover:bg-green-50/50 ${idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"}`}
                  >
                    <td className="px-4 py-3.5">
                      {rankMedal ? (
                        <span className="text-base leading-none">
                          {rankMedal}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-400">
                          {row.rank}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 text-sm">
                      {row.teamName}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center h-7 w-10 rounded-md bg-green-700 text-white text-sm font-bold">
                        {row.points}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-600 hidden sm:table-cell">
                      {row.played}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-green-700 hidden sm:table-cell">
                      {row.wins}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-red-500 hidden sm:table-cell">
                      {row.losses}
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500 hidden md:table-cell">
                      {row.setsFor}
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500 hidden md:table-cell">
                      {row.setsAgainst}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {federationUrl && (
        <div className="mt-4 flex justify-end">
          <a
            href={federationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 transition-colors"
          >
            <ExternalLink size={12} />
            Voir championnat FFVB
          </a>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const [expanded, setExpanded] = useState(false);
  const date = formatDate(match.date);
  const played = match.status === "played";
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
    <div
      className={`bg-white rounded-xl border transition-all ${
        played
          ? won
            ? "border-green-200"
            : lost
              ? "border-red-100"
              : "border-gray-100"
          : "border-gray-100 hover:border-green-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-center shrink-0 w-12">
            <div className="text-lg font-bold text-gray-900 leading-none">
              {date.day}
            </div>
            <div className="text-xs text-gray-400 uppercase mt-0.5">
              {date.month}
            </div>
            <div className="text-xs text-gray-300">{date.year}</div>
          </div>
          <div className="h-10 w-px bg-gray-100 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${match.homeAway === "home" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
              >
                {match.homeAway === "home" ? "Domicile" : "Extérieur"}
              </span>
              <span className="text-xs text-gray-400">{date.weekday}</span>
              <span className="text-xs text-gray-400">
                <Clock size={10} className="inline mr-0.5" />
                {date.time}
              </span>
            </div>
            <p className="mt-1 font-semibold text-gray-900 truncate">
              vs {match.opponentName}
            </p>
            {match.address && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                <MapPin size={10} className="shrink-0" />
                {match.address}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {played &&
            match.scoreFor !== null &&
            match.scoreAgainst !== null ? (
              <div>
                <div
                  className={`text-2xl font-bold tabular-nums ${won ? "text-green-700" : lost ? "text-red-500" : "text-gray-500"}`}
                >
                  {match.scoreFor} – {match.scoreAgainst}
                </div>
                <div
                  className={`text-xs font-semibold mt-0.5 ${won ? "text-green-600" : lost ? "text-red-400" : "text-gray-400"}`}
                >
                  {won ? "Victoire" : lost ? "Défaite" : "Nul"}
                </div>
              </div>
            ) : played ? (
              <span className="text-xs text-gray-400">Score inconnu</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                <Clock size={10} />À venir
              </span>
            )}
          </div>
        </div>
        {played && match.setsDetail.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-green-700 transition-colors"
          >
            <Trophy size={11} />
            Détail des sets ({match.setsDetail.length})
            <ChevronDown
              size={11}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {expanded && match.setsDetail.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <div className="flex gap-2 flex-wrap">
            {match.setsDetail.map((s) => (
              <div
                key={s.setNumber}
                className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs ${s.scoreFor > s.scoreAgainst ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-100"}`}
              >
                <span className="text-gray-400 mb-1">Set {s.setNumber}</span>
                <span
                  className={`font-bold text-sm ${s.scoreFor > s.scoreAgainst ? "text-green-700" : "text-red-500"}`}
                >
                  {s.scoreFor} – {s.scoreAgainst}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarTab({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState<"upcoming" | "results">("upcoming");
  const upcoming = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const results = matches
    .filter((m) => m.status === "played")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const list = tab === "upcoming" ? upcoming : results;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === "upcoming" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          À venir
          {upcoming.length > 0 && (
            <span className="ml-2 bg-white/30 text-white text-xs rounded-full px-1.5 py-0.5">
              {upcoming.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("results")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === "results" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Résultats
          {results.length > 0 && (
            <span className="ml-2 bg-white/30 text-white text-xs rounded-full px-1.5 py-0.5">
              {results.length}
            </span>
          )}
        </button>
      </div>
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          {tab === "upcoming" ? (
            <>
              <Calendar size={32} className="mb-2 text-gray-300" />
              <p className="text-sm">Aucun match à venir</p>
            </>
          ) : (
            <>
              <Shield size={32} className="mb-2 text-gray-300" />
              <p className="text-sm">Aucun résultat disponible</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <MatchCard key={m._id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Media Tab ────────────────────────────────────────────

function resolveAlbumCover(src?: string): string | null {
  return resolveImageUrl(src);
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MediaTab({ albums, news }: { albums: Album[]; news: NewsArticle[] }) {
  const hasContent = albums.length > 0 || news.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <ImageIcon size={40} strokeWidth={1} className="mb-3" />
        <p className="text-sm text-gray-400">
          Aucun média associé à cette équipe
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Albums */}
      {albums.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <ImageIcon size={13} />
            Albums photo ({albums.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {albums.map((album) => {
              const cover = resolveAlbumCover(album.coverPhoto);
              return (
                <div
                  key={album._id}
                  className="group rounded-xl overflow-hidden border border-gray-100 hover:border-green-200 transition-colors shadow-sm"
                >
                  <div className="relative h-32 bg-gradient-to-br from-green-900 to-gray-900">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={album.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={28} className="text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {album.newsId && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-700/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Article lié
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {album.title}
                    </p>
                    {album.eventDate && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatShortDate(album.eventDate)}
                      </p>
                    )}
                    {album.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Articles */}
      {news.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Newspaper size={13} />
            Actualités ({news.length})
          </h4>
          <div className="space-y-3">
            {news.map((article) => (
              <a
                key={article._id}
                href={`/actualites/${article.slug}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/40 transition-all group"
              >
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Newspaper size={16} className="text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-800 transition-colors">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatShortDate(article.publishedAt ?? article.createdAt)}
                  </p>
                </div>
                <ExternalLink
                  size={14}
                  className="text-gray-300 group-hover:text-green-600 transition-colors shrink-0"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cup Phase Tab ────────────────────────────────────────

const cupTypeLabel: Record<string, string> = {
  anjou: "Coupe de l'Anjou",
  france: "Coupe de France",
  regional: "Coupe Régionale",
  other: "Coupe",
};

function CupPhaseCard({ phase }: { phase: CupPhase }) {
  const [matches, setMatches] = useState<ScrapedMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !phase.url || matches !== null) return;
    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(
          `/api/scrape-cup?url=${encodeURIComponent(phase.url)}`,
        );
        const d = await r.json();
        setMatches(d.matches ?? []);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, phase.url, matches]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Award size={16} className="text-green-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {phase.name}
          </p>
          <p className="text-xs text-green-600 font-medium">
            {cupTypeLabel[phase.type] ?? phase.type}
          </p>
        </div>
        {phase.url && (
          <a
            href={phase.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-green-700 transition-colors"
            title="Voir sur FFVB"
          >
            <ExternalLink size={14} />
          </a>
        )}
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {phase.notes && (
            <p className="text-xs text-gray-500 mb-3 italic">{phase.notes}</p>
          )}

          {!phase.url ? (
            <p className="text-xs text-gray-400 py-2">
              Aucune URL renseignée pour récupérer les matchs.
            </p>
          ) : loading ? (
            <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
              <Loader2 size={14} className="animate-spin" />
              Chargement des matchs…
            </div>
          ) : matches && matches.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-3 py-2 text-left text-gray-400 font-semibold uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-gray-400 font-semibold uppercase tracking-wider">
                      Domicile
                    </th>
                    <th className="px-3 py-2 text-center text-gray-400 font-semibold uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-3 py-2 text-left text-gray-400 font-semibold uppercase tracking-wider">
                      Extérieur
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {matches.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-green-50/40 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                        {m.date}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-800">
                        {m.homeTeam}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {m.scoreHome !== null && m.scoreAway !== null ? (
                          <span className="font-bold tabular-nums text-gray-900">
                            {m.scoreHome} – {m.scoreAway}
                          </span>
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-800">
                        {m.awayTeam}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : matches !== null ? (
            <p className="text-xs text-gray-400 py-2">Aucun match trouvé.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CupTab({ cupPhases }: { cupPhases: CupPhase[] }) {
  if (cupPhases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <Award size={40} strokeWidth={1} className="mb-3" />
        <p className="text-sm text-gray-400">
          Aucune phase de coupe renseignée
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {cupPhases.map((phase) => (
        <CupPhaseCard key={phase._id} phase={phase} />
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────

type Tab = "roster" | "standings" | "calendar" | "cup" | "media";

export default function TeamTabs({
  roster,
  standings,
  matches,
  cupPhases,
  albums,
  news,
  federationUrl,
}: {
  roster: TeamAssignment[];
  standings: Standing[];
  matches: Match[];
  cupPhases: CupPhase[];
  albums: Album[];
  news: NewsArticle[];
  federationUrl?: string;
}) {
  const [tab, setTab] = useState<Tab>("roster");

  const mediaCount = albums.length + news.length;

  const tabs: {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: "roster",
      label: "Effectif",
      icon: <Users size={15} />,
      count: roster.length,
    },
    {
      key: "standings",
      label: "Classement",
      icon: <Trophy size={15} />,
      count: standings.length,
    },
    {
      key: "calendar",
      label: "Calendrier",
      icon: <Calendar size={15} />,
      count: matches.length,
    },
    {
      key: "cup",
      label: "Coupe",
      icon: <Award size={15} />,
      count: cupPhases.length,
    },
    {
      key: "media",
      label: "Médias",
      icon: <ImageIcon size={15} />,
      count: mediaCount,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 min-w-fit flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab === t.key
                ? "border-green-700 text-green-700 bg-green-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${tab === t.key ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {tab === "roster" && <RosterTab roster={roster} />}
        {tab === "standings" && (
          <StandingsTab standings={standings} federationUrl={federationUrl} />
        )}
        {tab === "calendar" && <CalendarTab matches={matches} />}
        {tab === "cup" && <CupTab cupPhases={cupPhases} />}
        {tab === "media" && <MediaTab albums={albums} news={news} />}
      </div>
    </div>
  );
}
