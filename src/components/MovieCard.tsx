import type { RecommendedMovie } from "@/lib/types";

export function StarRating({ score }: { score: number }) {
  const filled = Math.round(score / 2);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`text-base leading-none ${i <= filled ? "text-amber-400" : "text-stone-200"}`}>
            ★
          </span>
        ))}
      </div>
      <span className="text-sm font-semibold text-stone-500">{score.toFixed(1)}</span>
    </div>
  );
}

interface Props {
  movie: RecommendedMovie;
  posterOnly?: boolean;
}

export function MovieCard({ movie, posterOnly }: Props) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <div className="bg-beige-50 rounded-2xl overflow-hidden shadow-md border border-beige-200">
      <div className="relative w-full aspect-[2/3]">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-beige-200 flex items-center justify-center min-h-48">
            <span className="text-5xl">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {!posterOnly && (
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif text-xl text-stone-900 leading-tight">{movie.title}</h3>
            {movie.media_type === "tv" && (
              <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                Serie
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-stone-400">{movie.release_date?.slice(0, 4) ?? "?"}</span>
            <StarRating score={movie.vote_average} />
          </div>
          {movie.overview && (
            <p className="text-sm text-stone-600 leading-relaxed">{movie.overview}</p>
          )}
        </div>
      )}
    </div>
  );
}
