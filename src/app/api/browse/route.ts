import { NextRequest, NextResponse } from "next/server";
import { fetchBrowseResults } from "@/lib/tmdb";
import type { ContentType, Genre, Duration, Origin, QuestionnaireAnswers } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contentType: ContentType = body.contentType ?? "pelicula";
    const batch: number = Math.max(1, Number(body.batch) || 1);

    const answers: QuestionnaireAnswers = {
      genres: (body.genres ?? []) as Genre[],
      yearMin: body.yearMin ?? 1960,
      yearMax: body.yearMax ?? new Date().getFullYear(),
      duration: (body.duration ?? []) as Duration[],
      origin: (body.origin ?? "cualquiera") as Origin,
      watchProvider: (body.watchProvider as string | undefined) ?? null,
    };

    const { results, total } = await fetchBrowseResults(answers, contentType, batch);
    return NextResponse.json({ results, total });
  } catch (err) {
    console.error("Browse error:", err);
    return NextResponse.json({ error: "Algo salió mal." }, { status: 500 });
  }
}
