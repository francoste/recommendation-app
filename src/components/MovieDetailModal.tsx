"use client";

import { useEffect, useState, useRef } from "react";
import type { TMDBMovie, WatchProvider } from "@/lib/types";
import { WatchProviders } from "@/components/WatchProviders";
import { ExpandableDescription } from "@/components/ExpandableDescription";

interface Props {
  movie: TMDBMovie | null;
  onClose: () => void;
}

export function MovieDetailModal({ movie, onClose }: Props) {
  const [flatrate, setFlatrate] = useState<WatchProvider[]>([]);
  const [rent, setRent] = useState<WatchProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!movie) return;
    setFlatrate([]);
    setRent([]);
    setTrailerKey(null);
    setProvidersLoading(true);
    const type = movie.media_type === "tv" ? "tv" : "movie";
    Promise.all([
      fetch(`/api/providers?id=${movie.id}&type=${type}`).then((r) => r.json()),
      fetch(`/api/trailer?id=${movie.id}&type=${type}`).then((r) => r.json()),
    ])
      .then(([provData, trailerData]) => {
        setFlatrate(provData.flatrate ?? []);
        setRent(provData.rent ?? []);
        setTrailerKey(trailerData.key ?? null);
      })
      .catch(() => {})
      .finally(() => setProvidersLoading(false));
  }, [movie]);

  useEffect(() => {
    if (!movie) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [movie, onClose]);

  if (!movie) return null;

  const year = movie.release_date?.slice(0, 4);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative bg-beige-50 rounded-2xl border border-beige-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-2 flex-wrap">
            {movie.media_type === "tv" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-800 text-white">Serie</span>
            )}
            {year && <span className="text-sm text-stone-400">{year}</span>}
            <span className="text-sm text-amber-500 font-medium">★ {movie.vote_average.toFixed(1)}</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors text-xl leading-none ml-4 mt-0.5"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col sm:flex-row gap-5 p-5">
          {/* Poster */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden border border-beige-200 shadow-sm">
              {movie.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-beige-200 flex items-center justify-center text-3xl">🎬</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 min-w-0">
            <h2 className="font-serif text-xl font-semibold text-stone-900 leading-tight">{movie.title}</h2>

            {movie.overview ? (
              <ExpandableDescription text={movie.overview} />
            ) : (
              <p className="text-sm text-stone-400 italic">Sin descripción disponible.</p>
            )}

            {trailerKey && (
              <a
                href={`https://www.youtube.com/watch?v=${trailerKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:text-cyan-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Ver trailer
              </a>
            )}

            <WatchProviders flatrate={flatrate} rent={rent} loading={providersLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
