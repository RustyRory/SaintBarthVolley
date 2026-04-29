"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  ArrowRight,
  ChevronDown,
  Filter,
} from "lucide-react";

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

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveImageUrl(src?: string): string | null {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

export default function TeamsClient({
  initialSeasons,
  initialTeams,
  initialSeasonId,
}: {
  initialSeasons: Season[];
  initialTeams: Team[];
  initialSeasonId: string;
}) {
  const [seasons] = useState(initialSeasons);
  const [teams, setTeams] = useState(initialTeams);
  const [selectedSeasonId, setSelectedSeasonId] = useState(initialSeasonId);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");

  async function handleSeasonChange(seasonId: string) {
    setSelectedSeasonId(seasonId);
    setLoadingTeams(true);
    try {
      const data = await apiFetch<Team[]>(`/api/seasons/${seasonId}/teams`);
      setTeams(data ?? []);
    } catch {
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      if (filterCategory !== "all" && t.category !== filterCategory)
        return false;
      if (filterGender !== "all" && t.gender !== filterGender) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [teams, filterCategory, filterGender, search]);

  const selectedSeason = seasons.find((s) => s._id === selectedSeasonId);
  const categories = [...new Set(teams.map((t) => t.category))];
  const genders = [...new Set(teams.map((t) => t.gender))];

  return (
    <div>
      {/* ── SAISON SELECTOR ── */}
      <section className="bg-green-100 py-5 border-b border-green-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-green-300 text-xs font-semibold uppercase tracking-wider shrink-0">
              Saison
            </span>
            <div className="flex flex-wrap gap-2">
              {seasons.map((s) => (
                <button
                  key={s._id}
                  onClick={() => handleSeasonChange(s._id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    s._id === selectedSeasonId
                      ? "bg-white text-green-900"
                      : "bg-green-800/60 text-green-200 hover:bg-green-700/60"
                  }`}
                >
                  {s.name}
                  {s.status === "active" && (
                    <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-green-400 align-middle" />
                  )}
                </button>
              ))}
            </div>
            {selectedSeason && (
              <span className="text-xs text-green-400 sm:ml-auto shrink-0">
                {new Date(selectedSeason.startDate).getFullYear()} –{" "}
                {new Date(selectedSeason.endDate).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── FILTRES ── */}
      <section className="bg-white border-b border-gray-100 py-4 sticky top-16 z-40 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher une équipe…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-gray-400 shrink-0" />

              <div className="flex gap-1">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterCategory === "all"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Toutes
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setFilterCategory(filterCategory === c ? "all" : c)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterCategory === c
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {categoryLabel[c] ?? c}
                  </button>
                ))}
              </div>

              <span className="h-5 w-px bg-gray-200 hidden sm:block" />

              <div className="flex gap-1">
                {genders.map((g) => (
                  <button
                    key={g}
                    onClick={() =>
                      setFilterGender(filterGender === g ? "all" : g)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterGender === g
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {genderLabel[g] ?? g}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-gray-400 sm:ml-auto shrink-0">
              {filtered.length} équipe{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ── GRILLE DES ÉQUIPES ── */}
      <section className="py-16 bg-white min-h-[40vh]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {loadingTeams ? (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                <span className="text-sm">Chargement des équipes…</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Users size={40} className="mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">Aucune équipe trouvée</p>
              <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((team) => (
                <TeamCard key={team._id} team={team} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  const [expanded, setExpanded] = useState(false);
  const photoUrl = resolveImageUrl(team.photo);

  return (
    <div className="bg-green-950 rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
      {/* Photo */}
      <div className="h-44 relative overflow-hidden">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={team.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center text-5xl opacity-40">
            🏐
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/30 to-transparent" />

        {/* Badges catégorie / genre */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          <span className="bg-green-700/90 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {categoryLabel[team.category] ?? team.category}
          </span>
          <span className="bg-white/15 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            {genderLabel[team.gender] ?? team.gender}
          </span>
        </div>

        {team.federationUrl && (
          <a
            href={team.federationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white/70 hover:text-white transition-colors backdrop-blur-sm"
            aria-label="Page fédération"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Corps */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-white text-base leading-tight">
          {team.name}
        </h3>
        {team.level && (
          <p className="mt-1 text-xs text-green-400 font-medium">
            {team.level}
          </p>
        )}

        {/* Entraînements */}
        {team.trainingSchedule.length > 0 && (
          <div className="mt-4 flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-green-400 transition-colors"
            >
              <Clock size={13} />
              Entraînements ({team.trainingSchedule.length})
              <ChevronDown
                size={13}
                className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {team.trainingSchedule.map((slot, i) => (
                  <div
                    key={i}
                    className="bg-green-900/60 rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-200">
                        {dayLabel[slot.day] ?? slot.day}
                      </span>
                      <span className="text-xs text-green-400 font-medium">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-gray-500">
                      <MapPin size={10} className="shrink-0" />
                      <span className="text-xs truncate">{slot.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {team.federationUrl && (
            <a
              href={team.federationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-green-300 hover:text-green-200 border border-green-700 hover:border-green-500 rounded-xl py-2 transition-colors"
            >
              <ExternalLink size={12} />
              Voir championnat FFVB
            </a>
          )}
          <Link
            href={`/equipes/${team._id}`}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-green-700 hover:bg-green-600 rounded-xl py-2.5 transition-colors"
          >
            Voir l&apos;équipe
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
