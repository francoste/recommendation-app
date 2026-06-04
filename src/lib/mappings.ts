import type { Genre, Duration, Origin } from "./types";

export const GENRE_MAP: Record<Genre, number> = {
  "acción": 28,
  "animación": 16,
  "aventura": 12,
  "ciencia ficción": 878,
  "comedia": 35,
  "crimen": 80,
  "documental": 99,
  "drama": 18,
  "familia": 10751,
  "misterio": 9648,
  "música": 10402,
  "romance": 10749,
  "suspenso": 53,
  "terror": 27,
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
