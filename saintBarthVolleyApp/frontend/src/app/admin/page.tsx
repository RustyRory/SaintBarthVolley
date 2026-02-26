// app/admin/page.tsx

import { SectionAdminCards } from "@/components/section-admin-cards";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>

      <SectionAdminCards
        stats={{
          users: 120,
          clubs: 12,
          teams: 34,
          matches: 89,
        }}
      />

      {/* Futures sections :
          - Graphiques
          - Activité récente
          - Logs
          - Statistiques avancées
      */}
    </div>
  );
}
