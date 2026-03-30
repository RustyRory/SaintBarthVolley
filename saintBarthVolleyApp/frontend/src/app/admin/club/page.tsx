"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { ClubForm } from "@/components/dashboard/admin/club-form";
import { ClubPreview } from "@/components/dashboard/admin/club-preview";

interface Club {
  _id?: string;
  name: string;
  subtitle: string;
  homeDescription: string;
  clubDescription: string;
  ownerDescription: string;
  logo: string;
  photo: string;
  email: string;
  phone: string;
  address: string;
  social_links: Record<string, string>;
  legal_info: Record<string, string | null>;
}

export default function ClubPage() {
  const [club, setClub] = useState<Club | null>(null);
  const [initialClub, setInitialClub] = useState<Club | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔹 Fetch club initial
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const data = await apiFetch("/api/clubs");
        setClub(data[0]);
        setInitialClub(data[0]);
      } catch (err) {
        console.error("Failed to fetch club", err);
      }
    };
    fetchClub();
  }, []);

  // 🔹 Dirty check
  const isDirty = JSON.stringify(club) !== JSON.stringify(initialClub);

  // 🔹 Auto-save (debounced 1s)
  useEffect(() => {
    if (!club?._id || !isDirty) return;

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Set new debounce
    debounceRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await apiFetch(`/api/clubs/${club._id}`, {
          method: "PUT",
          body: JSON.stringify(club),
        });
        setInitialClub(club);
        setStatus("saved");

        // Reset status after 5s
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => setStatus(""), 5000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      } finally {
        setSaving(false);
      }
    }, 1000);

    // Cleanup on unmount or club change
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [club, isDirty]);

  if (!club) return <p className="p-6">Chargement...</p>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion du club</h1>

        <div className="text-sm">
          {saving && (
            <span className="text-muted-foreground">💾 Sauvegarde...</span>
          )}
          {!saving && status === "saved" && (
            <span className="text-green-600">✔ Sauvegardé</span>
          )}
          {status === "error" && (
            <span className="text-red-600">❌ Erreur</span>
          )}
          {!isDirty && !saving && (
            <span className="text-muted-foreground">Aucune modification</span>
          )}
        </div>
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FORM */}
        <div className="flex flex-col gap-6">
          <ClubForm
            club={club}
            onChange={setClub}
            // Optionnel : bouton "Enregistrer" manuel
            onSave={async (updatedClub) => {
              if (!updatedClub._id) return;
              try {
                setSaving(true);
                await apiFetch(`/api/clubs/${updatedClub._id}`, {
                  method: "PUT",
                  body: JSON.stringify(updatedClub),
                });
                setInitialClub(updatedClub);
                setStatus("saved");
                if (statusTimeoutRef.current)
                  clearTimeout(statusTimeoutRef.current);
                statusTimeoutRef.current = setTimeout(
                  () => setStatus(""),
                  5000,
                );
              } catch (err) {
                console.error("Manual save failed", err);
                setStatus("error");
              } finally {
                setSaving(false);
              }
            }}
          />
        </div>

        {/* PREVIEW */}
        <div className="sticky top-6 h-fit border rounded-xl p-4 bg-background">
          <ClubPreview club={club} />
        </div>
      </div>
    </div>
  );
}
