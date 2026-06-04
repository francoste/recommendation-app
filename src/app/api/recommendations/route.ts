import { NextRequest, NextResponse } from "next/server";
import { fetchMovieCandidates } from "@/lib/tmdb";
import type { Preferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || !body.person1 ||
        (body.mode !== "solo" && body.mode !== "pareja") ||
        (body.mode === "pareja" && !body.person2)) {
      return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    }
    const prefs = body as Preferences;

    let candidates;
    if (prefs.mode === "solo") {
      candidates = await fetchMovieCandidates(prefs.person1);
    } else {
      const [c1, c2] = await Promise.all([
        fetchMovieCandidates(prefs.person1),
        fetchMovieCandidates(prefs.person2!),
      ]);
      const seen = new Set<number>();
      candidates = [...c1, ...c2].filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No encontramos películas con esos filtros. Intentá con criterios más amplios." },
        { status: 404 }
      );
    }

    const top10 = candidates
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 10);

    return NextResponse.json({ candidates: top10 });
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json(
      { error: "Algo salió mal. Por favor intentá de nuevo." },
      { status: 500 }
    );
  }
}
