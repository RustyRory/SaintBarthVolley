import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import PageHero from "@/components/visitor/page-hero";
import ActualitesClient from "./actualites-client";

async function getData() {
  const [matches, events, news] = await Promise.all([
    apiFetch<unknown[]>("/api/matches").catch(() => []),
    apiFetch<unknown[]>("/api/events?public=true").catch(() => []),
    apiFetch<unknown[]>("/api/news?published=true").catch(() => []),
  ]);
  return {
    matches: matches ?? [],
    events: events ?? [],
    news: news ?? [],
  };
}

export default async function ActualitesPage() {
  const { matches, events, news } = await getData();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />

      <PageHero
        badge="Actualités"
        title="Calendrier & Articles"
        subtitle="Suivez les matchs, les événements et les dernières nouvelles du club."
      />

      <ActualitesClient
        matches={matches as never}
        events={events as never}
        news={news as never}
      />

      <VisitorFooter />
    </div>
  );
}
