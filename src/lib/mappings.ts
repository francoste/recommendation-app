import type { Genre, Mood, Duration, Origin } from "./types";

export const GENRE_MAP: Record<Genre, number> = {
  "acción": 28,
  "animación": 16,
  "comedia": 35,
  "documental": 99,
  "drama": 18,
  "terror": 27,
  "romance": 10749,
  "ciencia ficción": 878,
  "suspenso": 53,
};

export const MOOD_TO_GENRES: Record<Mood, number[]> = {
  "romántico":   [10749, 18],
  "feliz":       [35, 10751, 16],
  "aventurero":  [28, 12, 878],
  "relajado":    [99, 18],
  "emocionado":  [53, 27, 28],
  "melancólico": [18, 10749],
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
