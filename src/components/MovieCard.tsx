import type { RecommendedMovie } from "@/lib/types";

interface Props {
  movie: RecommendedMovie;
}

export function MovieCard({ movie }: Props) {
  const year = movie.release_date?.slice(0, 4) ?? "?";
  const rating = movie.vote_average.toFixed(1);
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100">
      <div className="relative w-full" style={{ aspectRatio: "2/3" }}>
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-pink-50 flex items-center justify-center min-h-48">
            <span className="text-5xl">🎬</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-xl text-gray-800 leading-tight">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-1 mb-3">
          <span className="text-sm text-gray-400">{year}</span>
          <span className="text-yellow-400 text-sm font-medium">★ {rating}</span>
        </div>
        {movie.overview && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">{movie.overview}</p>
        )}
      </div>
    </div>
  );
}
