"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/users")) return "Utilisateurs";
  if (pathname.startsWith("/admin/club")) return "Club";
  if (pathname.startsWith("/admin/news")) return "Actualités";
  if (pathname.startsWith("/admin/seasons")) {
    if (pathname.includes("/teams/") && pathname.split("/").length > 6)
      return "Détail équipe";
    if (pathname.includes("/teams")) return "Équipes";
    return "Saisons";
  }
  if (pathname.startsWith("/admin/members")) return "Membres";
  if (pathname.startsWith("/admin/matches")) return "Matches";
  if (pathname.startsWith("/admin/partners")) return "Partenaires";
  if (pathname.startsWith("/admin/settings")) return "Paramètres";
  if (pathname.startsWith("/admin/help")) return "Aide";
  return "Admin";
}

export function DashboardHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background px-4 transition-all">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  );
}
