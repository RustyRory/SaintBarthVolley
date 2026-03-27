"use client";

import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconFolder,
  IconListDetails,
  IconChartBar,
  IconDatabase,
  IconSettings,
  IconHelp,
  IconSearch,
  IconInnerShadowTop,
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

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },

  // MENU PRINCIPAL ADMIN
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Club",
      url: "/admin/club",
      icon: IconFolder,
    },
    {
      title: "Actualités",
      url: "/admin/news",
      icon: IconListDetails,
    },
    {
      title: "Equipes",
      url: "/admin/teams",
      icon: IconListDetails,
    },
    {
      title: "Membres / Joueurs",
      url: "/admin/players",
      icon: IconListDetails,
    },
    {
      title: "Matches",
      url: "/admin/matches",
      icon: IconChartBar,
    },
    {
      title: "Championnats",
      url: "/admin/championships",
      icon: IconDatabase,
    },
    {
      title: "Partenaires",
      url: "/admin/partners",
      icon: IconDatabase,
    },
  ],

  // 🔹 MENU SECONDAIRE
  navSecondary: [
    {
      title: "Paramètres",
      url: "/admin/settings",
      icon: IconSettings,
    },
    {
      title: "Aide",
      url: "/admin/help",
      icon: IconHelp,
    },
    {
      title: "Recherche",
      url: "/admin/search",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <span className="text-base font-semibold">Admin Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
