"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  ChevronDown,
  Trophy,
  Clock,
  Shield,
} from "lucide-react";

type SetDetail = {
  setNumber: number;
  scoreFor: number;
  scoreAgainst: number;
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
  setsDetail: SetDetail[];
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: monthFr[d.getMonth()],
    year: d.getFullYear(),
    weekday: d.toLocaleDateString("fr-FR", { weekday: "long" }),
    full: d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function MatchCard({ match }: { match: Match }) {
  const [expanded, setExpanded] = useState(false);
  const date = formatDate(match.date);
  const isHome = match.homeAway === "home";
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
            ? "border-green-200 hover:border-green-300"
            : lost
              ? "border-red-100 hover:border-red-200"
              : "border-gray-100 hover:border-gray-200"
          : "border-gray-100 hover:border-green-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Date badge */}
          <div className="text-center shrink-0 w-12">
            <div className="text-lg font-bold text-gray-900 leading-none">
              {date.day}
            </div>
            <div className="text-xs text-gray-400 uppercase mt-0.5">
              {date.month}
            </div>
            <div className="text-xs text-gray-300">{date.year}</div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-gray-100 shrink-0" />

          {/* Match info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isHome
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isHome ? "Domicile" : "Extérieur"}
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

          {/* Score / Statut */}
          <div className="shrink-0 text-right">
            {played &&
            match.scoreFor !== null &&
            match.scoreAgainst !== null ? (
              <div>
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    won
                      ? "text-green-700"
                      : lost
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {match.scoreFor} – {match.scoreAgainst}
                </div>
                <div
                  className={`text-xs font-semibold mt-0.5 ${
                    won
                      ? "text-green-600"
                      : lost
                        ? "text-red-400"
                        : "text-gray-400"
                  }`}
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

        {/* Sets detail toggle */}
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

      {/* Sets detail */}
      {expanded && match.setsDetail.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <div className="flex gap-2 flex-wrap">
            {match.setsDetail.map((s) => (
              <div
                key={s.setNumber}
                className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs ${
                  s.scoreFor > s.scoreAgainst
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-100"
                }`}
              >
                <span className="text-gray-400 mb-1">Set {s.setNumber}</span>
                <span
                  className={`font-bold text-sm ${
                    s.scoreFor > s.scoreAgainst
                      ? "text-green-700"
                      : "text-red-500"
                  }`}
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

export default function MatchesTabs({ matches }: { matches: Match[] }) {
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
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "upcoming"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          À venir
          {upcoming.length > 0 && (
            <span className="ml-2 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5">
              {upcoming.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("results")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "results"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Résultats
          {results.length > 0 && (
            <span className="ml-2 bg-gray-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {results.length}
            </span>
          )}
        </button>
      </div>

      {/* Liste */}
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
