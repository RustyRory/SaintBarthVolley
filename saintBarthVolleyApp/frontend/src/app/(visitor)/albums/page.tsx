import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import AlbumsClient from "./albums-client";

type Album = {
  _id: string;
  title: string;
  description: string;
  coverPhoto: string;
  eventDate: string | null;
  createdAt: string;
  teamIds: { _id: string; name: string; slug?: string }[];
  seasonId: { _id: string; name: string } | null;
  eventId: { _id: string; title: string; date: string } | null;
};

async function getAlbums(): Promise<Album[]> {
  try {
    return await apiFetch<Album[]>("/api/albums?public=true");
  } catch {
    return [];
  }
}

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="flex flex-col flex-1 bg-gray-100 text-gray-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-900">
        <div className="h-32 sm:h-40 pt-16" />
      </section>

      {/* Breadcrumb */}
      <div className="bg-green-900 py-4 border-b border-green-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-green-300/70 text-xs font-semibold uppercase tracking-wider">
            Galerie photos
          </span>
        </div>
      </div>

      <AlbumsClient albums={albums} />

      <VisitorFooter />
    </div>
  );
}
