import type { Genre, Duration, Origin } from "./types";

// null = género no disponible en ese tipo de contenido
export const GENRE_MAP: Record<Genre, number | null> = {
  "acción":          28,
  "animación":       16,
  "aventura":        12,
  "bélico":          null,  // TV only
  "ciencia ficción": 878,
  "comedia":         35,
  "crimen":          80,
  "documental":      99,
  "drama":           18,
  "familia":         10751,
  "misterio":        9648,
  "música":          10402,
  "reality":         null,  // TV only
  "romance":         10749,
  "suspenso":        53,
  "terror":          27,
  "western":         null,  // TV only
};

export const TV_GENRE_MAP: Record<Genre, number | null> = {
  "acción":          10759, // Action & Adventure
  "animación":       16,
  "aventura":        10759, // Action & Adventure
  "bélico":          10768, // War & Politics
  "ciencia ficción": 10765, // Sci-Fi & Fantasy
  "comedia":         35,
  "crimen":          80,
  "documental":      99,
  "drama":           18,
  "familia":         10751,
  "misterio":        9648,
  "música":          null,
  "reality":         10764,
  "romance":         null,
  "suspenso":        9648,
  "terror":          null,
  "western":         37,
};

// TMDB only accepts one language per request — multi-lang origins use parallel requests
export const ORIGIN_TO_LANGUAGES: Record<Origin, string | null> = {
  "hollywood":       "en",
  "europeo":         "fr|de|it",
  "latinoamericano": "es|pt",
  "asiático":        "ja|ko|zh",
  "cualquiera":      null,
};

export const DURATION_FILTERS: Record<Duration, { gte?: number; lte?: number }> = {
  "corta": { lte: 90 },
  "media": { gte: 90, lte: 120 },
  "larga": { gte: 120 },
};
