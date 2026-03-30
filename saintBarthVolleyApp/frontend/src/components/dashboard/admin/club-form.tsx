/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/dashboard/admin/file-upload";
import Image from "next/image";

interface Props {
  club: any;
  onChange: (club: any) => void;
  onSave: (club: any) => Promise<void>;
}

export function ClubForm({ club, onChange, onSave }: Props) {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (name: string, value: string) => {
    setDirty(true);

    if (name.startsWith("social_")) {
      onChange({
        ...club,
        social_links: {
          ...club.social_links,
          [name.replace("social_", "")]: value,
        },
      });
    } else if (name.startsWith("legal_")) {
      onChange({
        ...club,
        legal_info: {
          ...club.legal_info,
          [name.replace("legal_", "")]: value,
        },
      });
    } else {
      onChange({ ...club, [name]: value });
    }
  };

  const handleFileUpload = async (
    field: "logo" | "photo",
    file: File,
    oldFileUrl?: string, // on peut passer l'ancienne image
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    if (oldFileUrl) {
      // envoie juste le filename, pas l'URL complète
      formData.append("oldFile", oldFileUrl.split("/").pop()!);
    }

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Upload error response:", text);
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const imageUrl = `http://localhost:5000/uploads/${data.filename}`;

      handleChange(field, imageUrl);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* GENERAL */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Informations générales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Titre</Label>
            <Input
              value={club.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label>Sous-titre</Label>
            <Input
              value={club.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Description accueil</Label>
          <Textarea
            value={club.homeDescription}
            onChange={(e) => handleChange("homeDescription", e.target.value)}
          />
        </div>
        <div>
          <Label>Description club</Label>
          <Textarea
            value={club.clubDescription}
            onChange={(e) => handleChange("clubDescription", e.target.value)}
          />
        </div>
        <div>
          <Label>Description président</Label>
          <Textarea
            value={club.ownerDescription}
            onChange={(e) => handleChange("ownerDescription", e.target.value)}
          />
        </div>
      </div>

      {/* MEDIA */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Images</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Logo</Label>
            <FileUpload onUpload={(file) => handleFileUpload("logo", file)} />
            {club.logo && (
              <Image
                src={club.logo}
                alt="Logo"
                width={100}
                height={100}
                unoptimized
                className="mt-2 h-24 object-contain"
              />
            )}
          </div>
          <div>
            <Label>Photo principale</Label>
            <FileUpload onUpload={(file) => handleFileUpload("photo", file)} />
            {club.photo && (
              <Image
                src={club.photo}
                alt="Photo"
                width={100}
                height={100}
                unoptimized
                className="mt-2 h-24 object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Email"
            value={club.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <Input
            placeholder="Téléphone"
            value={club.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <Input
          placeholder="Adresse"
          value={club.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

      {/* SOCIAL */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Réseaux sociaux</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(club.social_links || {}).map(([key, value]) => (
            <Input
              key={key}
              placeholder={`${key} (URL)`}
              value={(value as string) || ""}
              onChange={(e) => handleChange(`social_${key}`, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* LEGAL */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Mentions légales</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(club.legal_info || {}).map(([key, value]) => (
            <Input
              key={key}
              placeholder={key}
              value={(value as string) || ""}
              onChange={(e) => handleChange(`legal_${key}`, e.target.value)}
            />
          ))}
        </div>
      </div>

      {saving && (
        <p className="text-sm text-blue-600">💾 Sauvegarde en cours...</p>
      )}
      {!dirty && !saving && (
        <p className="text-sm text-green-600">
          ✅ Tous les changements sauvegardés
        </p>
      )}
    </div>
  );
}
