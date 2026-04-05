const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    console.error("Réponse non JSON :", text);
    throw new Error("Erreur serveur (réponse non JSON)");
  }

  if (!res.ok) {
    const err = data as { message?: string } | null;
    throw new Error(err?.message ?? "Erreur serveur");
  }
  return data as T;
}
