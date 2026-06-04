export type Genre =
  | "comedia"
  | "drama"
  | "acción"
  | "terror"
  | "romance"
  | "ciencia ficción"
  | "animación"
  | "documental"
  | "suspenso"
  | "aventura"
  | "crimen"
  | "familia"
  | "misterio"
  | "música"
  | "reality"
  | "western"
  | "bélico";
export type Duration = "corta" | "media" | "larga";
export type Origin = "hollywood" | "europeo" | "latinoamericano" | "asiático" | "cualquiera";

export interface QuestionnaireAnswers {
  genres: Genre[];
  yearMin: number;
  yearMax: number;
  duration: Duration[];
  origin: Origin;
}

export type ContentType = "pelicula" | "serie" | "ambas";

export interface Preferences {
  mode: "solo" | "pareja";
  contentType: ContentType;
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
  media_type: "movie" | "tv";
}

export type RecommendedMovie = TMDBMovie;

export interface WatchProvider {
  id: number;
  name: string;
  logo_path: string;
}
