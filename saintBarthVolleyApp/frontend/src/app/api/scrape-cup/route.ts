import { NextRequest, NextResponse } from "next/server";

export type ScrapedMatch = {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  scoreHome: string | null;
  scoreAway: string | null;
};

function parseTableFormat(html: string): ScrapedMatch[] {
  const matches: ScrapedMatch[] = [];

  // Extract all <tr> rows
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (m) =>
        m[1]
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
    );

    if (cells.length < 4) continue;

    // Typical table: id | date/time | home team | score | away team | ...
    const idCandidate = cells[0];
    if (!idCandidate || !/^\d+$/.test(idCandidate)) continue;

    const dateStr = cells[1] ?? "";
    const homeTeam = cells[2] ?? "";
    const scoreCell = cells[3] ?? "";
    const awayTeam = cells[4] ?? "";

    const scoreMatch = scoreCell.match(/(\d+)\s*[-–]\s*(\d+)/);

    matches.push({
      id: idCandidate,
      date: dateStr,
      homeTeam,
      awayTeam,
      scoreHome: scoreMatch ? scoreMatch[1] : null,
      scoreAway: scoreMatch ? scoreMatch[2] : null,
    });
  }

  return matches;
}

function parseTextFormat(html: string): ScrapedMatch[] {
  const matches: ScrapedMatch[] = [];
  const plain = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  // Pattern: match id, date, home team, score (optional), away team
  // Example lines: "123 12/10/2024 14:00 Team A 3-1 Team B"
  const lineRegex =
    /(\d{4,})\s+(\d{2}\/\d{2}\/\d{4}(?:\s+\d{2}:\d{2})?)\s+([A-ZÀ-Ÿa-zà-ÿ0-9 .'\-]+?)\s+(?:(\d+)\s*[-–]\s*(\d+)\s+)?([A-ZÀ-Ÿa-zà-ÿ0-9 .'\-]+?)(?=\s+\d{4,}|$)/g;

  let m;
  while ((m = lineRegex.exec(plain)) !== null) {
    matches.push({
      id: m[1],
      date: m[2],
      homeTeam: m[3].trim(),
      awayTeam: m[6].trim(),
      scoreHome: m[4] ?? null,
      scoreAway: m[5] ?? null,
    });
  }

  return matches;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SaintBarthVolley/1.0)",
        Accept: "text/html",
      },
      next: { revalidate: 1800 }, // cache 30 min
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const html = await response.text();

    // Detect format: if has <tr> rows with <td>, use table parser
    const hasTable = /<tr[^>]*>[\s\S]*?<\/tr>/i.test(html);
    const matches = hasTable ? parseTableFormat(html) : parseTextFormat(html);

    return NextResponse.json({ matches });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scraping failed" },
      { status: 500 },
    );
  }
}
