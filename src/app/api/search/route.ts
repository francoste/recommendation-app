import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return NextResponse.json({ results: [] });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const type = req.nextUrl.searchParams.get("type") === "serie" ? "tv" : "movie";
  const page = req.nextUrl.searchParams.get("page") ?? "1";

  if (!q) return NextResponse.json({ results: [], total: 0 });

  try {
    const params = new URLSearchParams({
      api_key: key,
      query: q,
      language: "es-MX",
      page,
      include_adult: "false",
    });
    const res = await fetch(`${TMDB_BASE}/search/${type}?${params}`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ results: [], total: 0 });

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.results ?? []).map((m: any) =>
      type === "tv"
        ? { id: m.id, title: m.name ?? m.title, original_title: m.original_name ?? "", overview: m.overview, poster_path: m.poster_path, release_date: m.first_air_date ?? "", vote_average: m.vote_average, genre_ids: m.genre_ids, media_type: "tv" }
        : { ...m, media_type: "movie" }
    );

    return NextResponse.json({ results: results.filter((m: { poster_path: string | null }) => m.poster_path), total: data.total_results ?? 0 });
  } catch {
    return NextResponse.json({ results: [], total: 0 });
  }
}
