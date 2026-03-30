/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/dashboard/admin/file-upload";
import Image from "next/image";

interface Props {
  member: any;
  onChange: (member: any) => void;
  onSave: (member: any) => Promise<void>;
}

export function MemberForm({ member, onChange, onSave }: Props) {
  const [saving, setSaving] = useState(false);

  const handleChange = (name: string, value: any) => {
    onChange({ ...member, [name]: value });
  };

  // 🔹 handleFileUpload pour MemberForm
  const handleFileUpload = async (file: File) => {
    // récupère le nom du fichier actuel sans chemin ni domaine
    let oldFile: string | undefined = undefined;
    if (member.photo) {
      try {
        const url = new URL(member.photo);
        oldFile = url.pathname.split("/").pop();
        console.log("Old file to delete:", oldFile);
      } catch {
        // si ce n'est pas une URL complète
        oldFile = member.photo.split("/").pop();
      }
    }

    const formData = new FormData();
    formData.append("file", file);
    if (oldFile) formData.append("oldFile", oldFile);

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
      handleChange("photo", imageUrl);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* IDENTITÉ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Informations générales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Prénom</Label>
            <Input
              value={member.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>
          <div>
            <Label>Nom</Label>
            <Input
              value={member.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Date de naissance</Label>
          <Input
            type="date"
            value={member.birthDate ? member.birthDate.split("T")[0] : ""}
            onChange={(e) => handleChange("birthDate", e.target.value)}
          />
        </div>

        <div>
          <Label>Bio</Label>
          <Textarea
            value={member.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
          />
        </div>
      </div>

      {/* PHOTO */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Photo</h2>
        <FileUpload onUpload={handleFileUpload} />
        {member.photo && (
          <Image
            src={member.photo}
            alt="Photo du membre"
            width={100}
            height={100}
            unoptimized
            className="mt-2 object-cover rounded"
          />
        )}
      </div>

      {/* État */}
      <div className="space-y-2">
        <Label>Actif</Label>
        <select
          value={member.isActive ? "true" : "false"}
          onChange={(e) => handleChange("isActive", e.target.value === "true")}
          className="border rounded px-2 py-1"
        >
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </div>

      {/* BOUTON SAUVEGARDE */}
      <div className="flex justify-end mt-4">
        <Button
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(member); // modal ne se ferme plus automatiquement ici
            } catch (err) {
              console.error(err);
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          {saving ? "💾 Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}
