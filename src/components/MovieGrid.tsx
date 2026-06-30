import type { TMDBMovie } from "@/lib/types";

interface Props {
  movies: TMDBMovie[];
  loading?: boolean;
  onMovieClick?: (movie: TMDBMovie) => void;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full aspect-[2/3] rounded-xl bg-beige-200 animate-pulse" />
      <div className="h-3 bg-beige-200 rounded-full w-3/4 animate-pulse" />
      <div className="h-3 bg-beige-200 rounded-full w-1/2 animate-pulse" />
    </div>
  );
}

export function MovieGrid({ movies, loading, onMovieClick }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {movies.map((m) => (
        <div
          key={`${m.id}-${m.media_type}`}
          className={`flex flex-col gap-1.5 ${onMovieClick ? "cursor-pointer group" : ""}`}
          onClick={() => onMovieClick?.(m)}
          role={onMovieClick ? "button" : undefined}
          tabIndex={onMovieClick ? 0 : undefined}
          onKeyDown={onMovieClick ? (e) => { if (e.key === "Enter") onMovieClick(m); } : undefined}
        >
          <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-beige-200 transition-all group-hover:shadow-md group-hover:scale-[1.02]">
            {m.poster_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                alt={m.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-beige-200 flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
            )}
            {m.media_type === "tv" && (
              <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-800/90 text-white">
                Serie
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-stone-700 leading-tight line-clamp-2">{m.title}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-400">{m.release_date?.slice(0, 4)}</span>
            <span className="text-[10px] text-amber-500">★ {m.vote_average.toFixed(1)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
