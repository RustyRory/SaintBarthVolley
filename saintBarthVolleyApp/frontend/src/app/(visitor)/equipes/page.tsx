import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import PageHero from "@/components/visitor/page-hero";
import TeamsClient from "./teams-client";

type Season = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "archived" | "future";
};

type Team = {
  _id: string;
  slug: string;
  name: string;
  category: "Young" | "Senior" | "Veteran";
  gender: "Male" | "Female" | "Mixed";
  level: string;
  seasonId: string;
  trainingSchedule: {
    day: string;
    startTime: string;
    endTime: string;
    location: string;
  }[];
  photo?: string;
  federationUrl?: string;
};

async function getData(): Promise<{
  seasons: Season[];
  teams: Team[];
  activeSeasonId: string;
}> {
  try {
    const seasons = await apiFetch<Season[]>("/api/seasons");
    const sorted = (seasons ?? []).sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

    const active =
      sorted.find((s) => s.status === "active") ??
      sorted.find((s) => s.status === "future") ??
      sorted[0];

    if (!active) return { seasons: [], teams: [], activeSeasonId: "" };

    const teams = await apiFetch<Team[]>(`/api/seasons/${active._id}/teams`);
    return { seasons: sorted, teams: teams ?? [], activeSeasonId: active._id };
  } catch {
    return { seasons: [], teams: [], activeSeasonId: "" };
  }
}

export default async function EquipesPage() {
  const { seasons, teams, activeSeasonId } = await getData();

  return (
    <div className="flex flex-col flex-1 bg-white text-gray-900 font-sans">
      <Navbar />

      <PageHero
        badge={`Saison ${seasons.find((s) => s.status === "active")?.name ?? "en cours"}`}
        title="Les Équipes"
        subtitle="Retrouvez toutes nos équipes, leurs horaires d'entraînement et leurs informations de compétition."
      />

      {seasons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <div className="text-5xl mb-4">🏐</div>
          <p className="font-medium text-gray-500">
            Aucune saison disponible pour le moment
          </p>
          <p className="text-sm mt-1">Revenez bientôt !</p>
        </div>
      ) : (
        <TeamsClient
          initialSeasons={seasons}
          initialTeams={teams}
          initialSeasonId={activeSeasonId}
        />
      )}

      <VisitorFooter />
    </div>
  );
}
