import type { QuestionnaireAnswers, TMDBMovie, Duration, ContentType } from "./types";
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

function buildMovieParams(prefs: QuestionnaireAnswers, langOverride?: string): URLSearchParams {
  const params = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY!,
    language: "es-MX",
    sort_by: "vote_average.desc",
    "vote_count.gte": "500",
    include_adult: "false",
    "primary_release_date.gte": `${prefs.yearMin}-01-01`,
    "primary_release_date.lte": `${prefs.yearMax}-12-31`,
  });
  applyGenreAndLang(params, prefs, langOverride);
  const { gte, lte } = getDurationRange(prefs.duration);
  if (gte) params.set("with_runtime.gte", String(gte));
  if (lte) params.set("with_runtime.lte", String(lte));
  return params;
}

function buildTvParams(prefs: QuestionnaireAnswers, langOverride?: string): URLSearchParams {
  const params = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY!,
    language: "es-MX",
    sort_by: "vote_average.desc",
    "vote_count.gte": "100",
    include_adult: "false",
    "first_air_date.gte": `${prefs.yearMin}-01-01`,
    "first_air_date.lte": `${prefs.yearMax}-12-31`,
  });
  applyGenreAndLang(params, prefs, langOverride);
  return params;
}

function applyGenreAndLang(params: URLSearchParams, prefs: QuestionnaireAnswers, langOverride?: string) {
  if (prefs.genres.length > 0) {
    const ids = prefs.genres.map((g) => GENRE_MAP[g]).filter(Boolean);
    if (ids.length > 0) {
      params.set(
        "with_genres",
        prefs.genres.includes("animación") ? String(GENRE_MAP["animación"]) : ids.join("|")
      );
    }
  }
  const lang = langOverride ?? ORIGIN_TO_LANGUAGES[prefs.origin];
  if (lang && !lang.includes("|")) params.set("with_original_language", lang);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTv(raw: any): TMDBMovie {
  return {
    id: raw.id,
    title: raw.name ?? raw.title,
    original_title: raw.original_name ?? raw.original_title,
    overview: raw.overview,
    poster_path: raw.poster_path,
    release_date: raw.first_air_date ?? raw.release_date,
    vote_average: raw.vote_average,
    genre_ids: raw.genre_ids,
    media_type: "tv",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMovie(raw: any): TMDBMovie {
  return { ...raw, media_type: "movie" };
}

function randomExtraPages(count: number, min: number, max: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

async function fetchPageRaw(endpoint: string, baseParams: URLSearchParams, page: number): Promise<unknown[]> {
  const params = new URLSearchParams(baseParams);
  params.set("page", String(page));
  const res = await fetch(`${TMDB_BASE}/${endpoint}?${params}`);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

async function fetchMoviePages(prefs: QuestionnaireAnswers, lang?: string): Promise<TMDBMovie[]> {
  const params = buildMovieParams(prefs, lang);
  const extra = randomExtraPages(2, 2, 8);
  const pages = await Promise.all([1, ...extra].map((p) => fetchPageRaw("discover/movie", params, p)));
  return pages.flat().map(normalizeMovie);
}

async function fetchTvPages(prefs: QuestionnaireAnswers, lang?: string): Promise<TMDBMovie[]> {
  const params = buildTvParams(prefs, lang);
  const extra = randomExtraPages(2, 2, 8);
  const pages = await Promise.all([1, ...extra].map((p) => fetchPageRaw("discover/tv", params, p)));
  return pages.flat().map(normalizeTv);
}

function dedupe(movies: TMDBMovie[]): TMDBMovie[] {
  const seen = new Set<number>();
  return movies.filter((m) => {
    const key = m.id * 10 + (m.media_type === "tv" ? 1 : 0);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchByType(prefs: QuestionnaireAnswers, contentType: ContentType): Promise<TMDBMovie[]> {
  const lang = ORIGIN_TO_LANGUAGES[prefs.origin];
  const langs = lang?.includes("|") ? lang.split("|") : [lang ?? null];

  async function fetchAllLangs(fetcher: (p: QuestionnaireAnswers, l?: string) => Promise<TMDBMovie[]>) {
    if (langs.length === 1) {
      let results = await fetcher(prefs, langs[0] ?? undefined);
      if (results.length < 10) {
        // Retry without runtime filter
        const relaxed = { ...prefs, duration: [] as typeof prefs.duration };
        results = await fetcher(relaxed, langs[0] ?? undefined);
      }
      return results;
    }
    const all = await Promise.all(langs.map((l) => fetcher(prefs, l ?? undefined)));
    return dedupe(all.flat().sort((a, b) => b.vote_average - a.vote_average));
  }

  if (contentType === "pelicula") {
    return (await fetchAllLangs(fetchMoviePages)).slice(0, 60);
  }
  if (contentType === "serie") {
    return (await fetchAllLangs(fetchTvPages)).slice(0, 60);
  }
  // "ambas": fetch both and interleave
  const [movies, shows] = await Promise.all([
    fetchAllLangs(fetchMoviePages),
    fetchAllLangs(fetchTvPages),
  ]);
  const seen = new Set<number>();
  const merged: TMDBMovie[] = [];
  const maxLen = Math.max(movies.length, shows.length);
  for (let i = 0; i < maxLen && merged.length < 60; i++) {
    for (const m of [movies[i], shows[i]]) {
      if (!m) continue;
      const key = m.id * 10 + (m.media_type === "tv" ? 1 : 0);
      if (!seen.has(key)) { seen.add(key); merged.push(m); }
    }
  }
  return merged;
}

export async function fetchMovieCandidates(prefs: QuestionnaireAnswers, contentType: ContentType = "pelicula"): Promise<TMDBMovie[]> {
  return fetchByType(prefs, contentType);
}
