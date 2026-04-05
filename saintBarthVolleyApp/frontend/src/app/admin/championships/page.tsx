"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// La gestion des championnats est maintenant intégrée dans les équipes
// (champ URL FFVB sur chaque équipe)
export default function ChampionshipsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/seasons");
  }, [router]);
  return null;
}
