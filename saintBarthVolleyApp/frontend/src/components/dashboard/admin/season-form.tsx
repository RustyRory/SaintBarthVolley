"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

interface Season {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "archived" | "future";
}

interface SeasonFormProps {
  season?: Season;
  onClose: () => void;
  onSave: (season: Season) => void;
}

export const SeasonForm = ({ season, onClose, onSave }: SeasonFormProps) => {
  const [form, setForm] = React.useState<Season>({
    name: season?.name || "",
    startDate: season?.startDate || "",
    endDate: season?.endDate || "",
    status: season?.status || "future",
  });

  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStatusChange = (status: string) => {
    setForm((prev) => ({ ...prev, status: status as Season["status"] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedSeason: Season;
      if (season?._id) {
        savedSeason = await apiFetch(`/api/seasons/${season._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        savedSeason = await apiFetch("/api/seasons", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      onSave(savedSeason);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold">
          {season?._id ? "Modifier la saison" : "Créer une saison"}
        </h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nom de la saison</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="future">Future</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archivée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </form>
    </div>
  );
};
