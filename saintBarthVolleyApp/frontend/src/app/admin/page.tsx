"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { SectionAdminCards } from "@/components/dashboard/admin/section-admin-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalUsers: number;
  totalMembers: number;
  activeMembers: number;
  totalTeams: number;
  activeSeason: string | null;
  totalMatches: number;
  upcomingMatches: number;
  publishedNews: number;
  activePartners: number;
  totalEvents: number;
  upcomingEvents: number;
  totalAlbums: number;
}

interface ScrapingResult {
  matchesCreated: number;
  matchesUpdated: number;
  standings: number;
  errors: string[];
  logs: string[];
}

interface QuickLink {
  label: string;
  href: string;
  description: string;
}

interface QuickGroup {
  label: string;
  links: QuickLink[];
}

const QUICK_GROUPS: QuickGroup[] = [
  {
    label: "Site public",
    links: [
      {
        label: "Infos du club",
        href: "/admin/club",
        description: "Modifier les informations générales du club",
      },
      {
        label: "Actualités",
        href: "/admin/news",
        description: "Rédiger et publier des articles",
      },
      {
        label: "Albums & Médias",
        href: "/admin/albums",
        description: "Mettre en ligne des albums et photos",
      },
      {
        label: "Événements",
        href: "/admin/events",
        description: "Gérer les événements du club (loto, AG, tournois…)",
      },
      {
        label: "Partenaires",
        href: "/admin/partners",
        description: "Gérer les sponsors et partenaires",
      },
    ],
  },
  {
    label: "Sportif",
    links: [
      {
        label: "Saisons & Équipes",
        href: "/admin/seasons",
        description: "Créer ou modifier les saisons et équipes",
      },
      {
        label: "Membres",
        href: "/admin/members",
        description: "Ajouter ou mettre à jour les joueurs",
      },
      {
        label: "Matchs",
        href: "/admin/matches",
        description: "Consulter et saisir les résultats",
      },
      {
        label: "Championnats",
        href: "/admin/championships",
        description: "Gérer les championnats et poules",
      },
    ],
  },
  {
    label: "Administration",
    links: [
      {
        label: "Utilisateurs",
        href: "/admin/users",
        description: "Gérer les comptes et droits d'accès",
      },
    ],
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [scraping, setScraping] = React.useState(false);
  const [scrapingResult, setScrapingResult] =
    React.useState<ScrapingResult | null>(null);
  const [scrapingError, setScrapingError] = React.useState<string | null>(null);
  const [showLogs, setShowLogs] = React.useState(false);

  React.useEffect(() => {
    apiFetch<Stats>("/api/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleScraping = async () => {
    if (
      !confirm("Lancer le scraping FFVB ? Cela peut prendre plusieurs minutes.")
    )
      return;
    setScraping(true);
    setScrapingResult(null);
    setScrapingError(null);
    try {
      const result = await apiFetch<ScrapingResult>("/api/scraping/run", {
        method: "POST",
      });
      setScrapingResult(result);
      // Refresh stats after scraping
      const updated = await apiFetch<Stats>("/api/stats").catch(() => null);
      if (updated) setStats(updated);
    } catch (err) {
      setScrapingError(
        err instanceof Error ? err.message : "Erreur lors du scraping",
      );
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {stats?.activeSeason && (
            <p className="text-sm text-muted-foreground mt-1">
              Saison active :{" "}
              <span className="font-medium text-foreground">
                {stats.activeSeason}
              </span>
            </p>
          )}
        </div>

        <Button
          onClick={handleScraping}
          disabled={scraping}
          className="bg-orange-600 hover:bg-orange-700 text-white shrink-0"
        >
          {scraping ? "⟳ Scraping en cours..." : "Lancer le scraping FFVB"}
        </Button>
      </div>

      {/* Résultat scraping */}
      {scrapingResult && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200 flex flex-col gap-2">
          <div className="font-semibold text-green-800">Scraping terminé</div>
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
          {scrapingError}
        </div>
      )}

      <SectionAdminCards stats={stats} loading={loading} />

      {/* Accès rapides */}
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Accès rapides</h2>
        {QUICK_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {group.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.links.map((link) => (
                <Card
                  key={link.href}
                  className="hover:border-primary/50 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{link.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="self-start"
                    >
                      <Link href={link.href}>Accéder →</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
