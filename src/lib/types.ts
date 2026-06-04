export type Genre =
  | "comedia"
  | "drama"
  | "acción"
  | "terror"
  | "romance"
  | "ciencia ficción"
  | "animación"
  | "documental"
  | "suspenso";
export type Duration = "corta" | "media" | "larga";
export type Origin = "hollywood" | "europeo" | "latinoamericano" | "asiático" | "cualquiera";

export interface QuestionnaireAnswers {
  genres: Genre[];
  yearMin: number;
  yearMax: number;
  duration: Duration[];
  origin: Origin;
}

export interface Preferences {
  mode: "solo" | "pareja";
  person1: QuestionnaireAnswers;
  person2?: QuestionnaireAnswers;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genre_ids: number[];
}

export type RecommendedMovie = TMDBMovie;

export interface WatchProvider {
  id: number;
  name: string;
  logo_path: string;
}
