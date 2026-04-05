export interface Season {
  _id?: string; // optionnel pour nouvelles saisons
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "archived" | "future";
}
