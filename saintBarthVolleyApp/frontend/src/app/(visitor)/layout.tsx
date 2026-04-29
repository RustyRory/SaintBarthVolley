import { apiFetch } from "@/lib/api";
import { ClubProvider, type Club } from "@/components/visitor/club-context";

async function getClub(): Promise<Club | null> {
  try {
    return await apiFetch<Club>("/api/clubs/public");
  } catch {
    return null;
  }
}

export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const club = await getClub();
  return <ClubProvider club={club}>{children}</ClubProvider>;
}
