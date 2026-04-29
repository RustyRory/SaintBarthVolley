import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import TeamTabs from "./team-tabs";
import { ArrowLeft, Clock, MapPin, ExternalLink, Trophy } from "lucide-react";

// ─── Types ────────────────────────────────────────────────

type TrainingSlot = {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
};

type Team = {
  _id: string;
  name: string;
  category: "Young" | "Senior" | "Veteran";
  gender: "Male" | "Female" | "Mixed";
  level: string;
  seasonId: string;
  trainingSchedule: TrainingSlot[];
  photo?: string;
  federationUrl?: string;
};

type Season = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "archived" | "future";
};

type TeamAssignment = {
  _id: string;
  memberId: { _id: string; firstName: string; lastName: string };
  teamId: string;
  seasonId: string;
  role: "player" | "coach" | "assistant_coach";
  position?: string;
  isCaptain: boolean;
  jerseyNumber?: number | null;
  photo?: string;
};

type Championship = {
  _id: string;
  teamId: string;
  federationUrl: string;
};

type CupPhase = {
  _id: string;
  name: string;
  type: "anjou" | "france" | "regional" | "other";
  url: string;
  notes: string;
};

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
  albumId?: string | null;
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

type Match = {
  _id: string;
  teamId: string;
  opponentName: string;
  date: string;
  address: string;
  homeAway: "home" | "away";
  status: "scheduled" | "played";
  scoreFor: number | null;
  scoreAgainst: number | null;
  setsDetail: { setNumber: number; scoreFor: number; scoreAgainst: number }[];
};

// ─── Labels ───────────────────────────────────────────────

const categoryLabel: Record<string, string> = {
  Young: "Jeunes",
  Senior: "Seniors",
  Veteran: "Vétérans",
};
const genderLabel: Record<string, string> = {
  Male: "Masculin",
  Female: "Féminin",
  Mixed: "Mixte",
};
const dayLabel: Record<string, string> = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

// ─── Helpers ──────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveImageUrl(src?: string): string | null {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

// ─── Page ─────────────────────────────────────────────────

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [team, championships, matches, standings, cupPhases, albums, news] =
    await Promise.all([
      apiFetch<Team>(`/api/teams/${id}`).catch(() => null),
      apiFetch<Championship[]>(`/api/championships?teamId=${id}`).catch(
        () => [],
      ),
      apiFetch<Match[]>(`/api/matches?teamId=${id}`).catch(() => []),
      apiFetch<Standing[]>(`/api/standings?teamId=${id}`).catch(() => []),
      apiFetch<CupPhase[]>(`/api/cup-phases?teamId=${id}`).catch(() => []),
      apiFetch<Album[]>(`/api/albums?teamId=${id}&public=true`).catch(() => []),
      apiFetch<NewsArticle[]>(`/api/news?teamId=${id}&published=true`).catch(
        () => [],
      ),
    ]);

  if (!team) notFound();

  const [season, assignments] = await Promise.all([
    apiFetch<Season>(`/api/seasons/${team.seasonId}`).catch(() => null),
    apiFetch<TeamAssignment[]>(
      `/api/team-assignments?teamId=${id}&seasonId=${team.seasonId}`,
    ).catch(() => []),
  ]);

  const roster = [...(assignments ?? [])].sort((a, b) => {
    if (a.isCaptain && !b.isCaptain) return -1;
    if (!a.isCaptain && b.isCaptain) return 1;
    if (a.role === "player" && b.role !== "player") return -1;
    if (a.role !== "player" && b.role === "player") return 1;
    return a.memberId.lastName.localeCompare(b.memberId.lastName);
  });

  const teamPhotoUrl = resolveImageUrl(team.photo);
  const championship = championships?.[0] ?? null;
  const federationUrl = championship?.federationUrl ?? team.federationUrl;

  const playedMatches = (matches ?? []).filter((m) => m.status === "played");
  const wins = playedMatches.filter(
    (m) =>
      m.scoreFor !== null &&
      m.scoreAgainst !== null &&
      m.scoreFor > m.scoreAgainst,
  ).length;
  const losses = playedMatches.filter(
    (m) =>
      m.scoreFor !== null &&
      m.scoreAgainst !== null &&
      m.scoreFor < m.scoreAgainst,
  ).length;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-900">
        <div className="relative h-64 sm:h-80 pt-16 overflow-hidden">
          {teamPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={teamPhotoUrl}
              alt={team.name}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
          <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 pb-8 max-w-6xl mx-auto">
            <Link
              href="/equipes"
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-5 transition-colors w-fit"
            >
              <ArrowLeft size={13} />
              Toutes les équipes
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              {season && (
                <span className="inline-block rounded-full bg-green-700/30 border border-green-600/40 px-3 py-0.5 text-xs text-green-300">
                  {season.name}
                </span>
              )}
              <span className="inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/80">
                {categoryLabel[team.category] ?? team.category}
              </span>
              <span className="inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/80">
                {genderLabel[team.gender] ?? team.gender}
              </span>
              {team.level && (
                <span className="inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/80">
                  {team.level}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {team.name}
            </h1>
          </div>
        </div>
      </section>

      {/* ── BANDEAU VERT ── */}
      <div className="bg-green-900 py-4 border-b border-green-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">
            {team.level || team.name}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* ── LIGNE 1 : Championnat + Photo ── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Championnat */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-green-700" />
              Championnat
            </h3>
            {championship || team.federationUrl ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-gradient-to-br from-green-900 to-gray-900 rounded-xl text-white">
                  <p className="text-xs text-green-300/70 mb-1">Compétition</p>
                  <p className="font-semibold">
                    {season?.name ?? "Saison en cours"}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    {categoryLabel[team.category]} — {genderLabel[team.gender]}
                    {team.level ? ` — ${team.level}` : ""}
                  </p>
                  {playedMatches.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-300">
                          {wins}
                        </div>
                        <div className="text-xs text-gray-400">Victoires</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-400">
                          {losses}
                        </div>
                        <div className="text-xs text-gray-400">Défaites</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">
                          {playedMatches.length}
                        </div>
                        <div className="text-xs text-gray-400">
                          Matchs joués
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {federationUrl && (
                  <a
                    href={federationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-green-200 hover:border-green-400 text-green-700 hover:text-green-800 rounded-xl py-3 text-sm font-medium transition-colors"
                  >
                    <ExternalLink size={14} />
                    Voir championnat FFVB
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                <Trophy size={32} className="mb-2" strokeWidth={1} />
                <p className="text-sm text-gray-400">
                  Aucun championnat renseigné
                </p>
              </div>
            )}
          </div>

          {/* Photo équipe */}
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[220px]">
            {teamPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teamPhotoUrl}
                alt={team.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-900 via-gray-900 to-gray-950 flex flex-col items-center justify-center">
                <span className="text-6xl opacity-20">🏐</span>
                <p className="text-xs text-gray-500 mt-3">
                  Aucune photo disponible
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── LIGNE 2 : Onglets Effectif / Classement / Calendrier ── */}
        <TeamTabs
          roster={roster}
          standings={standings ?? []}
          matches={matches ?? []}
          cupPhases={cupPhases ?? []}
          albums={albums ?? []}
          news={news ?? []}
          federationUrl={federationUrl ?? undefined}
        />

        {/* ── LIGNE 3 : Entraînements + Map ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock size={15} className="text-green-700" />
              Entraînements
            </h3>
            {team.trainingSchedule.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun créneau renseigné</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {team.trainingSchedule.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="h-8 w-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center shrink-0">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {dayLabel[slot.day] ?? slot.day}
                        <span className="ml-2 text-gray-500 font-normal">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />
                        {slot.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {team.trainingSchedule[0]?.location && (
            <div className="h-72 border-t border-gray-100">
              <iframe
                title="Lieu d'entraînement"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(team.trainingSchedule[0].location)}&output=embed&z=15`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </div>

      <VisitorFooter />
    </div>
  );
}
