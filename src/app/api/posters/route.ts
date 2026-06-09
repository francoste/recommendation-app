import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.TMDB_API_KEY;
  if (!key) return NextResponse.json({ posters: [] });

  const page = Math.floor(Math.random() * 5) + 1;
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&language=es-MX&page=${page}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ posters: [] });

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withPosters = (data.results ?? []).filter((m: any) => m.poster_path);

    // Fisher-Yates shuffle
    for (let i = withPosters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [withPosters[i], withPosters[j]] = [withPosters[j], withPosters[i]];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posters = withPosters.slice(0, 10).map((m: any) => ({
      id: m.id,
      title: m.title,
      poster_path: m.poster_path,
    }));

    return NextResponse.json({ posters });
  } catch {
    return NextResponse.json({ posters: [] });
  }
}
