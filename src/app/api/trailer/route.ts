import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") ?? "movie";

  if (!id) return NextResponse.json({ key: null });

  const endpoint = type === "tv" ? `tv/${id}/videos` : `movie/${id}/videos`;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}&language=es-MX`
    );
    if (!res.ok) return NextResponse.json({ key: null });

    const data = await res.json();
    const videos: { site: string; type: string; official?: boolean; key: string }[] = data.results ?? [];

    const trailer =
      videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
      videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
      videos.find((v) => v.site === "YouTube");

    return NextResponse.json({ key: trailer?.key ?? null });
  } catch {
    return NextResponse.json({ key: null });
  }
}
