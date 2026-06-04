import type { QuestionnaireAnswers, TMDBMovie, Duration } from "./types";
import { GENRE_MAP, ORIGIN_TO_LANGUAGES, DURATION_FILTERS } from "./mappings";

const TMDB_BASE = "https://api.themoviedb.org/3";

function getDurationRange(durations: Duration[]): { gte?: number; lte?: number } {
  if (durations.length === 0 || durations.length === 3) return {};
  const filters = durations.map((d) => DURATION_FILTERS[d]);
  const minGte = Math.min(...filters.map((f) => f.gte ?? 0));
  const maxLte = Math.max(...filters.map((f) => f.lte ?? Infinity));
  return {
    gte: minGte > 0 ? minGte : undefined,
    lte: maxLte < Infinity ? maxLte : undefined,
  };
}

function buildParams(prefs: QuestionnaireAnswers, langOverride?: string): URLSearchParams {
  const params = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY!,
    language: "es-MX",
    sort_by: "vote_average.desc",
    "vote_count.gte": "500",
    include_adult: "false",
    "primary_release_date.gte": `${prefs.yearMin}-01-01`,
    "primary_release_date.lte": `${prefs.yearMax}-12-31`,
  });

  if (prefs.genres.length > 0) {
    const ids = prefs.genres.map((g) => GENRE_MAP[g]).filter(Boolean);
    if (ids.length > 0) params.set("with_genres", ids.join("|"));
  }

  const { gte, lte } = getDurationRange(prefs.duration);
  if (gte) params.set("with_runtime.gte", String(gte));
  if (lte) params.set("with_runtime.lte", String(lte));

  const lang = langOverride ?? ORIGIN_TO_LANGUAGES[prefs.origin];
  if (lang && !lang.includes("|")) {
    params.set("with_original_language", lang);
  }

  return params;
}

async function fetchPage(baseParams: URLSearchParams, page: number): Promise<TMDBMovie[]> {
  const params = new URLSearchParams(baseParams);
  params.set("page", String(page));
  const res = await fetch(`${TMDB_BASE}/discover/movie?${params}`);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

function randomExtraPages(count: number, min: number, max: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

async function fetchPages(prefs: QuestionnaireAnswers, lang?: string): Promise<TMDBMovie[]> {
  const params = buildParams(prefs, lang);
  const extraPages = randomExtraPages(2, 2, 8);
  const pages = await Promise.all([1, ...extraPages].map((p) => fetchPage(params, p)));
  return pages.flat();
}

export async function fetchMovieCandidates(prefs: QuestionnaireAnswers): Promise<TMDBMovie[]> {
  const lang = ORIGIN_TO_LANGUAGES[prefs.origin];

  let results: TMDBMovie[];

  if (!lang || !lang.includes("|")) {
    results = await fetchPages(prefs, lang ?? undefined);
    if (results.length < 10) {
      // Retry without runtime filter when few results (runtime often null in TMDB)
      const relaxed = buildParams({ ...prefs }, lang ?? undefined);
      relaxed.delete("with_runtime.gte");
      relaxed.delete("with_runtime.lte");
      const [p1, p2] = await Promise.all([fetchPage(relaxed, 1), fetchPage(relaxed, 2)]);
      results = [...p1, ...p2];
    }
  } else {
    const languages = lang.split("|");
    const all = await Promise.all(languages.map((l) => fetchPages(prefs, l)));
    const seen = new Set<number>();
    results = all
      .flat()
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      })
      .sort((a, b) => b.vote_average - a.vote_average);
  }

  return results.slice(0, 60);
}
