/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/dashboard/admin/file-upload";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Props {
  club: any;
  onChange: (club: any) => void;
  onSave?: (club: any) => Promise<void>;
}

export function ClubForm({ club, onChange }: Props) {
  const handleChange = (name: string, value: string) => {
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

  const handleValueChange = (index: number, key: string, value: string) => {
    const values = [...(club.values ?? [])];
    values[index] = { ...values[index], [key]: value };
    onChange({ ...club, values });
  };

  const addValue = () => {
    const values = [
      ...(club.values ?? []),
      { emoji: "🏐", title: "", description: "" },
    ];
    onChange({ ...club, values });
  };

  const removeValue = (index: number) => {
    const values = (club.values ?? []).filter(
      (_: any, i: number) => i !== index,
    );
    onChange({ ...club, values });
  };

  const handleFileUpload = async (
    field: "logo" | "photo" | "aboutPhoto",
    file: File,
    oldFileUrl?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    if (oldFileUrl) {
      formData.append("oldFile", oldFileUrl.split("/").pop()!);
    }

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Upload error response:", text);
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const imageUrl = `${API}/uploads/${data.filename}`;

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
            <FileUpload
              onUpload={(file) => handleFileUpload("logo", file, club.logo)}
            />
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
            <FileUpload
              onUpload={(file) => handleFileUpload("photo", file, club.photo)}
            />
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
        <div>
          <Label>Photo À propos</Label>
          <FileUpload
            onUpload={(file) =>
              handleFileUpload("aboutPhoto", file, club.aboutPhoto)
            }
          />
          {club.aboutPhoto && (
            <Image
              src={club.aboutPhoto}
              alt="À propos"
              width={200}
              height={100}
              unoptimized
              className="mt-2 h-24 object-cover rounded"
            />
          )}
        </div>
      </div>

      {/* VALEURS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nos valeurs</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addValue}
            className="flex items-center gap-1.5"
          >
            <Plus size={14} />
            Ajouter
          </Button>
        </div>
        {(club.values ?? []).map((v: any, i: number) => (
          <div
            key={v._id ?? i}
            className="grid grid-cols-[3rem_1fr_1fr_auto] gap-3 items-start p-3 border border-gray-200 rounded-lg"
          >
            <div>
              <Label className="text-xs">Emoji</Label>
              <Input
                value={v.emoji}
                onChange={(e) => handleValueChange(i, "emoji", e.target.value)}
                className="text-center text-lg px-1"
              />
            </div>
            <div>
              <Label className="text-xs">Titre</Label>
              <Input
                value={v.title}
                onChange={(e) => handleValueChange(i, "title", e.target.value)}
                placeholder="Titre"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={v.description}
                onChange={(e) =>
                  handleValueChange(i, "description", e.target.value)
                }
                placeholder="Description"
                className="h-20 resize-none"
              />
            </div>
            <div className="pt-5">
              <button
                type="button"
                onClick={() => removeValue(i)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
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
    </div>
  );
}
