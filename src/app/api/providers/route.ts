import { NextRequest, NextResponse } from "next/server";
import type { WatchProvider } from "@/lib/types";

const TMDB_BASE = "https://api.themoviedb.org/3";

interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface TMDBProvidersResponse {
  results?: {
    AR?: {
      flatrate?: TMDBProvider[];
      rent?: TMDBProvider[];
      buy?: TMDBProvider[];
    };
  };
}

function mapProvider(p: TMDBProvider): WatchProvider {
  return { id: p.provider_id, name: p.provider_name, logo_path: p.logo_path };
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`
    );
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);

    const data: TMDBProvidersResponse = await res.json();
    const ar = data.results?.AR;

    const flatrate = (ar?.flatrate ?? []).map(mapProvider);
    const rent = (ar?.rent ?? []).map(mapProvider);

    return NextResponse.json({ flatrate, rent });
  } catch (err) {
    console.error("Providers error:", err);
    return NextResponse.json({ error: "No se pudo obtener disponibilidad." }, { status: 500 });
  }
}
