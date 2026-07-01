import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { TMDBMovie } from "@/lib/types";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import RecProviders from "./RecProviders";

interface Props {
  searchParams: { id?: string; type?: string };
}

async function fetchMovie(id: string, type: string): Promise<TMDBMovie | null> {
  const endpoint = type === "tv" ? `tv/${id}` : `movie/${id}`;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}&language=es-MX`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (type === "tv") {
      return {
        id: data.id,
        title: data.name ?? "",
        original_title: data.original_name ?? "",
        overview: data.overview ?? "",
        poster_path: data.poster_path ?? null,
        release_date: data.first_air_date ?? "",
        vote_average: data.vote_average,
        genre_ids: (data.genres ?? []).map((g: { id: number }) => g.id),
        media_type: "tv",
      };
    }
    return {
      id: data.id,
      title: data.title ?? "",
      original_title: data.original_title ?? "",
      overview: data.overview ?? "",
      poster_path: data.poster_path ?? null,
      release_date: data.release_date ?? "",
      vote_average: data.vote_average,
      runtime: data.runtime,
      genre_ids: (data.genres ?? []).map((g: { id: number }) => g.id),
      media_type: "movie",
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const type = searchParams.type === "tv" ? "tv" : "movie";
  const id = searchParams.id;
  if (!id) return { title: "El Recomendador" };

  const movie = await fetchMovie(id, type);
  if (!movie) return { title: "El Recomendador" };

  const description = movie.overview?.slice(0, 160) || "Descubrí esta recomendación en El Recomendador";
  return {
    title: `${movie.title} — El Recomendador`,
    description,
    openGraph: {
      title: movie.title,
      description,
      images: movie.poster_path ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`] : [],
      type: "website",
    },
  };
}

export default async function RecPage({ searchParams }: Props) {
  const type = searchParams.type === "tv" ? "tv" : "movie";
  const id = searchParams.id;

  if (!id) notFound();

  const movie = await fetchMovie(id!, type);
  if (!movie) notFound();

  const year = movie.release_date?.slice(0, 4);

  return (
    <main className="min-h-screen bg-beige-100 flex flex-col items-center py-8 px-4 gap-8">
      <div className="w-full max-w-2xl flex flex-col gap-6 animate-fade-in">

        {/* Brand header */}
        <div className="text-center">
          <Link
            href="/"
            className="font-display text-2xl tracking-wide text-stone-900 hover:text-cyan-800 transition-colors uppercase"
          >
            El Recomendador
          </Link>
          <p className="text-stone-400 text-sm mt-1">Te comparten una recomendación 🎬</p>
        </div>

        {/* Movie card */}
        <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-md flex flex-col sm:flex-row gap-5 p-5">
          {/* Poster */}
          {movie.poster_path && (
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden border border-beige-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {movie.media_type === "tv" && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-800 text-white">Serie</span>
              )}
              {year && <span className="text-sm text-stone-400">{year}</span>}
              <span className="text-sm text-amber-500 font-medium">★ {movie.vote_average.toFixed(1)}</span>
            </div>

            <h1 className="font-serif text-2xl text-stone-900 leading-tight">{movie.title}</h1>

            {movie.overview && <ExpandableDescription text={movie.overview} />}

            <RecProviders id={movie.id} type={type} />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-beige-50 rounded-2xl border border-beige-200 p-5 text-center flex flex-col gap-3">
          <p className="text-stone-600 text-sm font-medium">¿Querés tu propia recomendación?</p>
          <Link
            href="/"
            className="w-full py-3 rounded-xl text-center font-semibold text-white bg-cyan-800 shadow-md active:scale-95 transition-all hover:bg-cyan-900 hover:shadow-lg"
          >
            Ir a El Recomendador
          </Link>
        </div>

      </div>
    </main>
  );
}
