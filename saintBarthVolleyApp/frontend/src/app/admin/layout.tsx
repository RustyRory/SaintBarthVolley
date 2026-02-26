// app/admin/layout.tsx
"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "260px",
          "--header-height": "60px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />

      <SidebarInset>
        <DashboardHeader />

        <main className="flex flex-1 flex-col bg-muted/40 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
