import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") ?? "movie";

  if (!id) return NextResponse.json({ key: null });

  const endpoint = type === "tv" ? `tv/${id}/videos` : `movie/${id}/videos`;
  const base = `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}`;

  function pickTrailer(videos: { site: string; type: string; official?: boolean; key: string }[]) {
    return (
      videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
      videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
      videos.find((v) => v.site === "YouTube")
    );
  }

  try {
    const [esRes, enRes] = await Promise.all([
      fetch(`${base}&language=es-MX`),
      fetch(`${base}&language=en-US`),
    ]);

    const esVideos = esRes.ok ? ((await esRes.json()).results ?? []) : [];
    const enVideos = enRes.ok ? ((await enRes.json()).results ?? []) : [];

    const trailer = pickTrailer(esVideos) ?? pickTrailer(enVideos);
    return NextResponse.json({ key: trailer?.key ?? null });
  } catch {
    return NextResponse.json({ key: null });
  }
}
