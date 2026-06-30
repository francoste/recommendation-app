import type { QuestionnaireAnswers, TMDBMovie, Duration, ContentType } from "./types";
import { GENRE_MAP, TV_GENRE_MAP, ORIGIN_TO_LANGUAGES, DURATION_FILTERS, TV_DURATION_TYPE } from "./mappings";

interface RawTMDBBase {
  id: number;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
}

interface RawTMDBMovie extends RawTMDBBase {
  title: string;
  original_title: string;
  release_date: string;
  runtime?: number;
}

interface RawTMDBTvShow extends RawTMDBBase {
  name?: string;
  original_name?: string;
  first_air_date?: string;
  title?: string;
  original_title?: string;
  release_date?: string;
}

const TMDB_BASE = "https://api.themoviedb.org/3";

const MOVIE_DURATIONS = ["corta", "media", "larga"] as const;
const TV_DURATIONS    = ["mini-serie", "serie", "telenovela"] as const;

function getDurationRange(durations: Duration[]): { gte?: number; lte?: number } {
  const movie = durations.filter((d): d is typeof MOVIE_DURATIONS[number] => (MOVIE_DURATIONS as readonly string[]).includes(d));
  if (movie.length === 0 || movie.length === 3) return {};
  const filters = movie.map((d) => DURATION_FILTERS[d]);
  const minGte = Math.min(...filters.map((f) => f.gte ?? 0));
  const maxLte = Math.max(...filters.map((f) => f.lte ?? Infinity));
  return {
    gte: minGte > 0 ? minGte : undefined,
    lte: maxLte < Infinity ? maxLte : undefined,
  };
}

function getTvTypeFilter(durations: Duration[]): { with_type?: string; "with_episode_count.gte"?: string } {
  const tv = durations.filter((d): d is typeof TV_DURATIONS[number] => (TV_DURATIONS as readonly string[]).includes(d));
  if (tv.length === 0 || tv.length === 3) return {};
  if (tv.length === 1 && tv[0] === "telenovela") return { "with_episode_count.gte": "100" };
  const types = tv.filter((d) => d !== "telenovela").map((d) => TV_DURATION_TYPE[d]).filter(Boolean);
  return types.length > 0 ? { with_type: types.join("|") } : {};
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
  applyGenreAndLang(params, prefs, langOverride, true);
  const tvFilter = getTvTypeFilter(prefs.duration);
  if (tvFilter.with_type) params.set("with_type", tvFilter.with_type);
  if (tvFilter["with_episode_count.gte"]) params.set("with_episode_count.gte", tvFilter["with_episode_count.gte"]);
  return params;
}

function applyGenreAndLang(params: URLSearchParams, prefs: QuestionnaireAnswers, langOverride?: string, tv = false) {
  if (prefs.genres.length > 0) {
    const map = tv ? TV_GENRE_MAP : GENRE_MAP;
    const ids = prefs.genres.map((g) => map[g]).filter((id): id is number => id !== null && id !== undefined);
    if (ids.length > 0) {
      const animId = tv ? TV_GENRE_MAP["animación"] : GENRE_MAP["animación"];
      params.set(
        "with_genres",
        prefs.genres.includes("animación") && animId ? String(animId) : ids.join("|")
      );
    }
  }
  const lang = langOverride ?? ORIGIN_TO_LANGUAGES[prefs.origin];
  if (lang && !lang.includes("|")) params.set("with_original_language", lang);
}

function normalizeTv(raw: RawTMDBTvShow): TMDBMovie {
  return {
    id: raw.id,
    title: raw.name ?? raw.title ?? "",
    original_title: raw.original_name ?? raw.original_title ?? "",
    overview: raw.overview,
    poster_path: raw.poster_path,
    release_date: raw.first_air_date ?? raw.release_date ?? "",
    vote_average: raw.vote_average,
    genre_ids: raw.genre_ids,
    media_type: "tv",
  };
}

function normalizeMovie(raw: RawTMDBMovie): TMDBMovie {
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

async function fetchPageWithTotal(endpoint: string, baseParams: URLSearchParams, page: number): Promise<{ results: unknown[]; total: number }> {
  const params = new URLSearchParams(baseParams);
  params.set("page", String(page));
  const res = await fetch(`${TMDB_BASE}/${endpoint}?${params}`);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  const data = await res.json();
  return { results: data.results ?? [], total: data.total_results ?? 0 };
}

async function fetchMoviePages(prefs: QuestionnaireAnswers, lang?: string): Promise<TMDBMovie[]> {
  const params = buildMovieParams(prefs, lang);
  const extra = randomExtraPages(2, 2, 8);
  const pages = await Promise.all([1, ...extra].map((p) => fetchPageRaw("discover/movie", params, p)));
  return pages.flat().map((r) => normalizeMovie(r as RawTMDBMovie));
}

async function fetchTvPages(prefs: QuestionnaireAnswers, lang?: string): Promise<TMDBMovie[]> {
  const params = buildTvParams(prefs, lang);
  const extra = randomExtraPages(2, 2, 8);
  const pages = await Promise.all([1, ...extra].map((p) => fetchPageRaw("discover/tv", params, p)));
  return pages.flat().map((r) => normalizeTv(r as RawTMDBTvShow));
}

export function dedupe(movies: TMDBMovie[]): TMDBMovie[] {
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
        // Retry without movie runtime filter only; preserve TV duration selection
        const movieDurations = ["corta", "media", "larga"] as const;
        const relaxedDuration = prefs.duration.filter(
          (d): d is typeof movieDurations[number] => !(movieDurations as readonly string[]).includes(d)
        ) as typeof prefs.duration;
        const relaxed = { ...prefs, duration: relaxedDuration };
        results = await fetcher(relaxed, langs[0] ?? undefined);
      }
      return results;
    }
    const all = await Promise.all(langs.map((l) => fetcher(prefs, l ?? undefined)));
    return dedupe(all.flat().sort((a, b) => b.vote_average - a.vote_average));
  }

  if (contentType === "serie") {
    return (await fetchAllLangs(fetchTvPages)).filter((m) => m.poster_path).slice(0, 60);
  }
  return (await fetchAllLangs(fetchMoviePages)).filter((m) => m.poster_path).slice(0, 60);
}

export async function fetchMovieCandidates(prefs: QuestionnaireAnswers, contentType: ContentType = "pelicula"): Promise<TMDBMovie[]> {
  return fetchByType(prefs, contentType);
}

// Deterministic pagination for browse (batch 1 = TMDB pages 1-3, batch 2 = pages 4-6, …)
export async function fetchBrowseResults(
  prefs: QuestionnaireAnswers,
  contentType: ContentType,
  batch: number,
): Promise<{ results: TMDBMovie[]; total: number }> {
  const startPage = (batch - 1) * 3 + 1;
  const tmdbPages = [startPage, startPage + 1, startPage + 2];

  const lang = ORIGIN_TO_LANGUAGES[prefs.origin];
  const langs = lang?.includes("|") ? lang.split("|") : [lang ?? null];

  const endpoint = contentType === "serie" ? "discover/tv" : "discover/movie";
  const buildParams = contentType === "serie" ? buildTvParams : buildMovieParams;
  const normalize = contentType === "serie"
    ? (r: unknown) => normalizeTv(r as RawTMDBTvShow)
    : (r: unknown) => normalizeMovie(r as RawTMDBMovie);

  let total = 0;
  const allResults: TMDBMovie[] = [];

  for (const l of langs) {
    const params = buildParams(prefs, l ?? undefined);
    const pages = await Promise.all(tmdbPages.map((p) => fetchPageWithTotal(endpoint, params, p)));
    if (total === 0) total = pages[0].total;
    pages.forEach(({ results }) => allResults.push(...results.map(normalize)));
  }

  return {
    results: dedupe(allResults).filter((m) => m.poster_path).sort((a, b) => b.vote_average - a.vote_average).slice(0, 60),
    total,
  };
}
