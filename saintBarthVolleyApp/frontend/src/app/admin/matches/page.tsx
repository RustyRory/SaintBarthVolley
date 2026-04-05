"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Team {
  _id: string;
  name: string;
  category: string;
  gender: string;
  seasonId: string;
  federationUrl?: string;
}

interface Season {
  _id: string;
  name: string;
}

interface Match {
  _id: string;
  teamId: Team | string;
  opponentName: string;
  date: string;
  homeAway: "home" | "away";
  status: "scheduled" | "played";
  scoreFor?: number;
  scoreAgainst?: number;
}

interface Standing {
  _id: string;
  teamId: string | Team;
  teamName: string;
  rank: number;
  points: number;
  played: number;
  wins: number;
  losses: number;
  setsFor: number;
  setsAgainst: number;
}

interface ScrapingResult {
  matchesCreated: number;
  matchesUpdated: number;
  standings: number;
  errors: string[];
  logs: string[];
}

export default function MatchesPage() {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [standings, setStandings] = React.useState<Standing[]>([]);

  const [selectedSeason, setSelectedSeason] = React.useState<string>("all");
  const [selectedTeam, setSelectedTeam] = React.useState<string>("all");
  const [loadingMatches, setLoadingMatches] = React.useState(false);
  const [loadingStandings, setLoadingStandings] = React.useState(false);

  const [scraping, setScraping] = React.useState(false);
  const [scrapingResult, setScrapingResult] =
    React.useState<ScrapingResult | null>(null);
  const [scrapingError, setScrapingError] = React.useState<string | null>(null);
  const [showLogs, setShowLogs] = React.useState(false);

  // Notre club (pour surligner dans le classement)
  const CLUB_NAME = "AS SAINT-BARTHELEMY D'ANJOU V.B.";

  React.useEffect(() => {
    apiFetch<Season[]>("/api/seasons").then(setSeasons).catch(console.error);
  }, []);

  React.useEffect(() => {
    if (selectedSeason === "all") {
      const fetchAll = async () => {
        const allTeams: Team[] = [];
        for (const s of seasons) {
          const t: Team[] = await apiFetch<Team[]>(
            `/api/teams?seasonId=${s._id}`,
          ).catch(() => []);
          allTeams.push(...t);
        }
        setTeams(allTeams);
      };
      if (seasons.length > 0) fetchAll();
    } else {
      apiFetch<Team[]>(`/api/teams?seasonId=${selectedSeason}`)
        .then(setTeams)
        .catch(console.error);
    }
    setSelectedTeam("all");
  }, [selectedSeason, seasons]);

  React.useEffect(() => {
    fetchMatches();
    fetchStandings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam]);

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const url =
        selectedTeam === "all"
          ? "/api/matches"
          : `/api/matches?teamId=${selectedTeam}`;
      setMatches(await apiFetch<Match[]>(url));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const fetchStandings = async () => {
    setLoadingStandings(true);
    try {
      const url =
        selectedTeam === "all"
          ? "/api/standings"
          : `/api/standings?teamId=${selectedTeam}`;
      setStandings(await apiFetch<Standing[]>(url));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStandings(false);
    }
  };

  const getTeam = (teamId: Team | string): Team | undefined => {
    if (typeof teamId === "object") return teamId;
    return teams.find((t) => t._id === teamId);
  };

  const getTeamName = (teamId: Team | string): string =>
    getTeam(teamId)?.name ?? "";

  const filteredTeams =
    selectedSeason === "all"
      ? teams
      : teams.filter((t) => t.seasonId === selectedSeason);

  const handleScraping = async () => {
    if (
      !confirm("Lancer le scraping FFVB ? Cela peut prendre plusieurs minutes.")
    )
      return;
    setScraping(true);
    setScrapingResult(null);
    setScrapingError(null);
    try {
      const result: ScrapingResult = await apiFetch("/api/scraping/run", {
        method: "POST",
      });
      setScrapingResult(result);
      await Promise.all([fetchMatches(), fetchStandings()]);
    } catch (err) {
      setScrapingError(
        err instanceof Error ? err.message : "Erreur lors du scraping",
      );
    } finally {
      setScraping(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Stats rapides depuis les matches joués
  const played = matches.filter((m) => m.status === "played");
  const wins = played.filter(
    (m) => (m.scoreFor ?? 0) > (m.scoreAgainst ?? 0),
  ).length;
  const losses = played.length - wins;
  const upcoming = matches.filter((m) => m.status === "scheduled").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Matches & Classements</h1>
        <Button
          onClick={handleScraping}
          disabled={scraping}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {scraping ? "⟳ Scraping en cours..." : "🔄 Lancer le scraping FFVB"}
        </Button>
      </div>

      {/* Résultat scraping */}
      {scrapingResult && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200 flex flex-col gap-2">
          <div className="font-semibold text-green-800">
            ✅ Scraping terminé
          </div>
          <div className="text-sm text-green-700 flex flex-wrap gap-4">
            <span>{scrapingResult.matchesCreated} match(es) créé(s)</span>
            <span>{scrapingResult.matchesUpdated} mis à jour</span>
            <span>{scrapingResult.standings} classement(s)</span>
          </div>
          {scrapingResult.errors.filter(Boolean).length > 0 && (
            <div className="text-sm text-red-600">
              Erreurs : {scrapingResult.errors.join(", ")}
            </div>
          )}
          <button
            className="text-xs text-green-600 underline self-start"
            onClick={() => setShowLogs((v) => !v)}
          >
            {showLogs ? "Masquer les logs" : "Voir les logs"}
          </button>
          {showLogs && (
            <pre className="text-xs bg-white border rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap">
              {scrapingResult.logs.join("\n")}
            </pre>
          )}
        </div>
      )}
      {scrapingError && (
        <div className="border rounded-lg p-4 bg-red-50 border-red-200 text-red-700 text-sm">
          ❌ {scrapingError}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Toutes les saisons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les saisons</SelectItem>
            {seasons.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Toutes les équipes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les équipes</SelectItem>
            {filteredTeams.map((t) => (
              <SelectItem key={t._id} value={t._id}>
                {t.name}
                {!t.federationUrl && " ⚠️"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            fetchMatches();
            fetchStandings();
          }}
        >
          Rafraîchir
        </Button>
      </div>

      {filteredTeams.some((t) => !t.federationUrl) && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          ⚠️ Certaines équipes (⚠️) n&apos;ont pas d&apos;URL FFVB configurée.
        </div>
      )}

      {/* Stats rapides (si équipe sélectionnée) */}
      {selectedTeam !== "all" && matches.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Matchs joués",
              value: played.length,
              color: "text-foreground",
            },
            { label: "Victoires", value: wins, color: "text-green-600" },
            { label: "Défaites", value: losses, color: "text-red-600" },
            { label: "À venir", value: upcoming, color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="border rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── CLASSEMENT ───── */}
      {(standings.length > 0 || loadingStandings) && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Classement</h2>
          {loadingStandings ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : (
            <div className="rounded-lg border overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-center w-10">#</th>
                    <th className="p-2 text-left">Équipe</th>
                    <th className="p-2 text-center">Pts</th>
                    <th className="p-2 text-center">J</th>
                    <th className="p-2 text-center">V</th>
                    <th className="p-2 text-center">D</th>
                    <th className="p-2 text-center hidden sm:table-cell">
                      Sets +
                    </th>
                    <th className="p-2 text-center hidden sm:table-cell">
                      Sets -
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings
                    .slice()
                    .sort((a, b) => a.rank - b.rank)
                    .map((s) => {
                      const isUs = s.teamName === CLUB_NAME;
                      return (
                        <tr
                          key={s._id}
                          className={`border-t ${isUs ? "bg-blue-50 font-semibold" : ""}`}
                        >
                          <td className="p-2 text-center text-muted-foreground">
                            {s.rank}
                          </td>
                          <td className="p-2">
                            {isUs ? (
                              <span className="flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                {s.teamName}
                              </span>
                            ) : (
                              s.teamName
                            )}
                          </td>
                          <td className="p-2 text-center font-bold">
                            {s.points}
                          </td>
                          <td className="p-2 text-center">{s.played}</td>
                          <td className="p-2 text-center text-green-600">
                            {s.wins}
                          </td>
                          <td className="p-2 text-center text-red-500">
                            {s.losses}
                          </td>
                          <td className="p-2 text-center hidden sm:table-cell">
                            {s.setsFor}
                          </td>
                          <td className="p-2 text-center hidden sm:table-cell">
                            {s.setsAgainst}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ───── MATCHES ───── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Matches{" "}
          {matches.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({matches.length})
            </span>
          )}
        </h2>

        {loadingMatches ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : (
          <>
            {/* Mobile */}
            <div className="flex flex-col gap-3 md:hidden">
              {matches.map((m) => (
                <div
                  key={m._id}
                  className="border rounded-lg p-4 flex flex-col gap-1"
                >
                  <div className="font-semibold">vs {m.opponentName}</div>
                  {(() => {
                    const t = getTeam(m.teamId);
                    return t ? (
                      <Link
                        href={`/admin/seasons/${t.seasonId}/teams/${t._id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {t.name}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {getTeamName(m.teamId)}
                      </span>
                    );
                  })()}
                  <div className="text-sm">{formatDate(m.date)}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${m.homeAway === "home" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                    >
                      {m.homeAway === "home" ? "Domicile" : "Extérieur"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${m.status === "played" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {m.status === "played" ? "Joué" : "Prévu"}
                    </span>
                    {m.status === "played" && (
                      <span className="font-bold text-sm">
                        {m.scoreFor} - {m.scoreAgainst}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {matches.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  Aucun match. Configurez les URLs FFVB puis lancez le scraping.
                </div>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden md:block rounded-lg border overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Équipe</th>
                    <th className="p-3 text-left">Adversaire</th>
                    <th className="p-3 text-left">D / E</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.length > 0 ? (
                    matches.map((m) => (
                      <tr key={m._id} className="border-t">
                        <td className="p-3 whitespace-nowrap">
                          {formatDate(m.date)}
                        </td>
                        <td className="p-3">
                          {(() => {
                            const t = getTeam(m.teamId);
                            return t ? (
                              <Link
                                href={`/admin/seasons/${t.seasonId}/teams/${t._id}`}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {t.name}
                              </Link>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {getTeamName(m.teamId)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-3 font-medium">{m.opponentName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${m.homeAway === "home" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                          >
                            {m.homeAway === "home" ? "Dom." : "Ext."}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${m.status === "played" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {m.status === "played" ? "Joué" : "Prévu"}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {m.status === "played"
                            ? `${m.scoreFor} - ${m.scoreAgainst}`
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="h-40 text-center text-muted-foreground"
                      >
                        Aucun match. Configurez les URLs FFVB puis lancez le
                        scraping.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
