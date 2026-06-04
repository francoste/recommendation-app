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

// TV genre IDs differ from movie genre IDs for some genres
// null = no direct equivalent in TV, genre is skipped
export const TV_GENRE_MAP: Record<Genre, number | null> = {
  "acción":          10759, // Action & Adventure
  "animación":       16,
  "aventura":        10759, // Action & Adventure
  "ciencia ficción": 10765, // Sci-Fi & Fantasy
  "comedia":         35,
  "crimen":          80,
  "documental":      99,
  "drama":           18,
  "familia":         10751,
  "misterio":        9648,
  "música":          null,  // no TV genre equivalent
  "romance":         null,  // no direct TV genre
  "suspenso":        9648,  // closest: Mystery
  "terror":          null,  // no direct TV genre
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
