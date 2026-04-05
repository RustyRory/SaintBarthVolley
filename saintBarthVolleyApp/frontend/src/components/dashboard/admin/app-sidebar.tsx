"use client";

import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconBuildingCommunity,
  IconNews,
  IconCalendar,
  IconUsersGroup,
  IconBallVolleyball,
  IconStar,
  IconSettings,
  IconHelp,
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
import { apiFetch } from "@/lib/api";

const navMain = [
  { title: "Dashboard", url: "/admin", icon: IconDashboard },
  { title: "Club", url: "/admin/club", icon: IconBuildingCommunity },
  { title: "Saisons & Équipes", url: "/admin/seasons", icon: IconCalendar },
  { title: "Membres", url: "/admin/members", icon: IconUsersGroup },
  { title: "Matches", url: "/admin/matches", icon: IconBallVolleyball },
  { title: "Actualités", url: "/admin/news", icon: IconNews },
  { title: "Partenaires", url: "/admin/partners", icon: IconStar },
  { title: "Utilisateurs", url: "/admin/users", icon: IconUsers },
];

const navSecondary = [
  { title: "Paramètres", url: "/admin/settings", icon: IconSettings },
  { title: "Aide", url: "/admin/help", icon: IconHelp },
];

interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    apiFetch("/api/auth/me")
      .then((data: AuthUser) => setUser(data))
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
                <span className="text-base font-semibold">Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
