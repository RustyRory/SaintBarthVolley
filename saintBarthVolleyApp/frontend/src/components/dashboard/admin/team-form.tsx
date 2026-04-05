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

export interface TrainingSlot {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  startTime: string;
  endTime: string;
  location: string;
}

export interface Team {
  _id?: string;
  name: string;
  category: "Young" | "Senior" | "Veteran";
  gender: "Male" | "Female" | "Mixed";
  level?: string;
  seasonId: string;
  federationUrl?: string;
  trainingSchedule?: TrainingSlot[];
}

interface TeamFormProps {
  team: Team;
  onClose: () => void;
  onSave: (updatedTeam: Team) => void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const DAY_LABELS: Record<string, string> = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

export const TeamForm = ({ team, onClose, onSave }: TeamFormProps) => {
  const [form, setForm] = React.useState<Team>({
    ...team,
    trainingSchedule: team.trainingSchedule ?? [],
  });
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSlot = () => {
    setForm((prev) => ({
      ...prev,
      trainingSchedule: [
        ...(prev.trainingSchedule ?? []),
        { day: "Monday", startTime: "18:00", endTime: "20:00", location: "" },
      ],
    }));
  };

  const removeSlot = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      trainingSchedule: (prev.trainingSchedule ?? []).filter(
        (_, i) => i !== idx,
      ),
    }));
  };

  const updateSlot = (
    idx: number,
    field: keyof TrainingSlot,
    value: string,
  ) => {
    setForm((prev) => {
      const slots = [...(prev.trainingSchedule ?? [])];
      slots[idx] = { ...slots[idx], [field]: value };
      return { ...prev, trainingSchedule: slots };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let updatedTeam: Team;
      if (form._id) {
        updatedTeam = await apiFetch(`/api/teams/${form._id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        updatedTeam = await apiFetch(`/api/teams`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      onSave(updatedTeam);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold">
          {form._id ? "Modifier l'équipe" : "Créer une équipe"}
        </h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Catégorie *</Label>
            <Select
              value={form.category}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, category: v as Team["category"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Young">Young</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Veteran">Veteran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Genre *</Label>
            <Select
              value={form.gender}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, gender: v as Team["gender"] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Masculin</SelectItem>
                <SelectItem value="Female">Féminin</SelectItem>
                <SelectItem value="Mixed">Mixte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="level">Niveau</Label>
          <Input
            id="level"
            name="level"
            value={form.level || ""}
            onChange={handleChange}
            placeholder="Ex: Régional 1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="federationUrl">URL FFVB</Label>
          <Input
            id="federationUrl"
            name="federationUrl"
            value={form.federationUrl || ""}
            onChange={handleChange}
            placeholder="https://www.ffvb.org/..."
          />
        </div>

        {/* Planning d'entraînement */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Créneaux d&apos;entraînement</Label>
            <Button type="button" size="sm" variant="outline" onClick={addSlot}>
              + Ajouter
            </Button>
          </div>
          {(form.trainingSchedule ?? []).map((slot, idx) => (
            <div
              key={idx}
              className="border rounded p-3 flex flex-col gap-2 bg-muted/30"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Jour</Label>
                  <Select
                    value={slot.day}
                    onValueChange={(v) => updateSlot(idx, "day", v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {DAY_LABELS[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Lieu</Label>
                  <Input
                    className="h-8 text-sm"
                    value={slot.location}
                    onChange={(e) =>
                      updateSlot(idx, "location", e.target.value)
                    }
                    placeholder="Gymnase..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Début</Label>
                  <Input
                    type="time"
                    className="h-8 text-sm"
                    value={slot.startTime}
                    onChange={(e) =>
                      updateSlot(idx, "startTime", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Fin</Label>
                  <Input
                    type="time"
                    className="h-8 text-sm"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(idx, "endTime", e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="self-end"
                onClick={() => removeSlot(idx)}
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
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
