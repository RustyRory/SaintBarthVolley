"use client";

import {
  IconUsers,
  IconBallVolleyball,
  IconCalendarEvent,
  IconNews,
  IconChartBar,
  IconUserCheck,
  IconConfetti,
  IconPhoto,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

interface CardDef {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, sub, icon: Icon, color }: CardDef) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-md p-1.5 ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

export function SectionAdminCards({
  stats,
  loading,
}: {
  stats: Stats | null;
  loading?: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const cards: CardDef[] = [
    {
      title: "Membres actifs",
      value: stats.activeMembers,
      sub: `${stats.totalMembers} membres au total`,
      icon: IconUserCheck,
      color: "bg-blue-500",
    },
    {
      title: "Équipes",
      value: stats.totalTeams,
      sub: stats.activeSeason
        ? `Saison ${stats.activeSeason}`
        : "Toutes saisons",
      icon: IconBallVolleyball,
      color: "bg-green-500",
    },
    {
      title: "Matches à venir",
      value: stats.upcomingMatches,
      sub: `${stats.totalMatches} matches au total`,
      icon: IconCalendarEvent,
      color: "bg-orange-500",
    },
    {
      title: "Actualités publiées",
      value: stats.publishedNews,
      sub: "Articles en ligne",
      icon: IconNews,
      color: "bg-purple-500",
    },
    {
      title: "Événements à venir",
      value: stats.upcomingEvents,
      sub: `${stats.totalEvents} événements au total`,
      icon: IconConfetti,
      color: "bg-yellow-500",
    },
    {
      title: "Albums photo",
      value: stats.totalAlbums,
      sub: "Albums en ligne",
      icon: IconPhoto,
      color: "bg-teal-500",
    },
    {
      title: "Partenaires actifs",
      value: stats.activePartners,
      sub: "Sponsors & partenaires",
      icon: IconChartBar,
      color: "bg-pink-500",
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      sub: "Comptes enregistrés",
      icon: IconUsers,
      color: "bg-zinc-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
