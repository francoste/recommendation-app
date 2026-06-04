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
    const contentType = prefs.contentType ?? "pelicula";

    let candidates;
    if (prefs.mode === "solo") {
      candidates = await fetchMovieCandidates(prefs.person1, contentType);
    } else {
      const [c1, c2] = await Promise.all([
        fetchMovieCandidates(prefs.person1, contentType),
        fetchMovieCandidates(prefs.person2!, contentType),
      ]);

      const p1Anim = prefs.person1.genres.includes("animación");
      const p2Anim = prefs.person2!.genres.includes("animación");

      if (p1Anim !== p2Anim) {
        const [animPool, regularPool] = p1Anim ? [c1, c2] : [c2, c1];
        const seen = new Set<number>();
        const take = (pool: typeof c1, n: number) =>
          pool.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true; }).slice(0, n);
        candidates = [...take(animPool, 25), ...take(regularPool, 25)];
      } else {
        const seen = new Set<number>();
        candidates = [...c1, ...c2].filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No encontramos títulos con esos filtros. Intentá con criterios más amplios." },
        { status: 404 }
      );
    }

    const top50 = candidates
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 50);

    return NextResponse.json({ candidates: top50 });
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json(
      { error: "Algo salió mal. Por favor intentá de nuevo." },
      { status: 500 }
    );
  }
}
