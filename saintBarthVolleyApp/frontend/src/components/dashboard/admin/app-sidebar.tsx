"use client";

import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconBuildingCommunity,
  IconNews,
  IconCalendar,
  IconUsersGroup,
  IconStar,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconPhoto,
  IconConfetti,
  IconTrophy,
  IconRun,
} from "@tabler/icons-react";

import { NavMain } from "@/components/dashboard/admin/nav-main";
import { NavSecondary } from "@/components/dashboard/admin/nav-secondary";
import { NavUser } from "@/components/dashboard/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

const navGroups = [
  {
    items: [{ title: "Dashboard", url: "/admin", icon: IconDashboard }],
  },
  {
    label: "Site public",
    items: [
      {
        title: "Infos du club",
        url: "/admin/club",
        icon: IconBuildingCommunity,
      },
      { title: "Actualités", url: "/admin/news", icon: IconNews },
      { title: "Albums & Médias", url: "/admin/albums", icon: IconPhoto },
      { title: "Événements", url: "/admin/events", icon: IconConfetti },
      { title: "Partenaires", url: "/admin/partners", icon: IconStar },
    ],
  },
  {
    label: "Sportif",
    items: [
      { title: "Saisons & Équipes", url: "/admin/seasons", icon: IconCalendar },
      { title: "Membres", url: "/admin/members", icon: IconUsersGroup },
      { title: "Matchs", url: "/admin/matches", icon: IconRun },
      { title: "Championnats", url: "/admin/championships", icon: IconTrophy },
    ],
  },
  {
    label: "Administration",
    items: [{ title: "Utilisateurs", url: "/admin/users", icon: IconUsers }],
  },
];

const navSecondary = [
  { title: "Paramètres", url: "/admin/settings", icon: IconSettings },
  { title: "Aide", url: "/admin/help", icon: IconHelp },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    apiFetch<AuthUser>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const navUser = user
    ? { name: `${user.firstName} ${user.lastName}`, email: user.email }
    : { name: "Admin", email: "" };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Admin SBV</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={navGroups} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
