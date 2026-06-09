import { NextResponse } from "next/server";

interface RawPoster {
  id: number;
  title: string;
  poster_path: string | null;
}

export async function GET() {
  const key = process.env.TMDB_API_KEY;
  if (!key) return NextResponse.json({ posters: [] });

  const page = Math.floor(Math.random() * 5) + 1;
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&language=es-MX&page=${page}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ posters: [] });

    const data = await res.json();
    const posters = (data.results as RawPoster[])
      .filter((m) => m.poster_path)
      .map((m) => ({ id: m.id, title: m.title, poster_path: m.poster_path }));

    return NextResponse.json({ posters });
  } catch {
    return NextResponse.json({ posters: [] });
  }
}
