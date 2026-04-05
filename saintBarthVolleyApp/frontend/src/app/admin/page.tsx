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
}

interface QuickLink {
  label: string;
  href: string;
  description: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Gérer les saisons",
    href: "/admin/seasons",
    description: "Créer ou modifier les saisons et équipes",
  },
  {
    label: "Gérer les membres",
    href: "/admin/members",
    description: "Ajouter ou mettre à jour les joueurs",
  },
  {
    label: "Actualités",
    href: "/admin/news",
    description: "Rédiger et publier des articles",
  },
  {
    label: "Partenaires",
    href: "/admin/partners",
    description: "Gérer les sponsors et partenaires",
  },
  {
    label: "Matches & scraping",
    href: "/admin/matches",
    description: "Voir les matches et lancer le scraping FFVB",
  },
  {
    label: "Infos du club",
    href: "/admin/club",
    description: "Modifier les informations du club",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch("/api/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-8">
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

      <SectionAdminCards stats={stats} loading={loading} />

      {/* Accès rapides */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Accès rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map((link) => (
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
    </div>
  );
}
