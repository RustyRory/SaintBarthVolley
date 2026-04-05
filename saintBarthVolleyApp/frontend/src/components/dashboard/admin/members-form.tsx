/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function MemberForm({ member, onChange, onSave }: any) {
  const [saving, setSaving] = useState(false);

  const handleChange = (name: string, value: any) => {
    onChange({ ...member, [name]: value });
  };

  const handleSeasonChange = (field: string, value: any) => {
    onChange({
      ...member,
      latestSeason: {
        ...member.latestSeason,
        [field]: value,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* GENERAL */}
      <div>
        <Label>Prénom</Label>
        <Input
          value={member.firstName || ""}
          onChange={(e) => handleChange("firstName", e.target.value)}
        />

        <Label>Nom</Label>
        <Input
          value={member.lastName || ""}
          onChange={(e) => handleChange("lastName", e.target.value)}
        />

        <Label>Date de naissance</Label>
        <Input
          type="date"
          value={member.birthDate?.split("T")[0] || ""}
          onChange={(e) => handleChange("birthDate", e.target.value)}
        />

        <Label>Bio</Label>
        <Textarea
          value={member.bio || ""}
          onChange={(e) => handleChange("bio", e.target.value)}
        />
      </div>

      {/* SPORT */}
      <div>
        <h2 className="font-bold">Infos sportives</h2>

        <Label>Taille</Label>
        <Input
          type="number"
          value={member.latestSeason?.height || ""}
          onChange={(e) => handleSeasonChange("height", Number(e.target.value))}
        />

        <Label>Poids</Label>
        <Input
          type="number"
          value={member.latestSeason?.weight || ""}
          onChange={(e) => handleSeasonChange("weight", Number(e.target.value))}
        />

        <Label>Poste</Label>
        <Input
          value={member.latestSeason?.position || ""}
          onChange={(e) => handleSeasonChange("position", e.target.value)}
        />

        <Label>Rôles</Label>
        <Input
          placeholder="player, coach..."
          value={member.latestSeason?.roles?.join(", ") || ""}
          onChange={(e) =>
            handleSeasonChange(
              "roles",
              e.target.value.split(",").map((r) => r.trim()),
            )
          }
        />
      </div>

      <Button
        onClick={async () => {
          setSaving(true);
          await onSave(member);
          setSaving(false);
        }}
      >
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </div>
  );
}
