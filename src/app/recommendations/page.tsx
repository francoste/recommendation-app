"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MovieCard, StarRating } from "@/components/MovieCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { WatchProviders } from "@/components/WatchProviders";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import type { Preferences, RecommendedMovie, WatchProvider } from "@/lib/types";

interface ProvidersState {
  flatrate: WatchProvider[];
  rent: WatchProvider[];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<RecommendedMovie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<RecommendedMovie | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProvidersState | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const seenIds = useRef<Set<number>>(new Set());

  const fetchProviders = useCallback(async (movieId: number, mediaType: string) => {
    setLoadingProviders(true);
    setProviders(null);
    try {
      const res = await fetch(`/api/providers?id=${movieId}&type=${mediaType}`);
      const data = await res.json();
      if (!data.error) setProviders({ flatrate: data.flatrate ?? [], rent: data.rent ?? [] });
    } catch {
      setProviders({ flatrate: [], rent: [] });
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  const selectMovie = useCallback(
    (movie: RecommendedMovie) => {
      seenIds.current.add(movie.id);
      setCurrentMovie(movie);
      fetchProviders(movie.id, movie.media_type ?? "movie");
    },
    [fetchProviders]
  );

  useEffect(() => {
    const raw = sessionStorage.getItem("preferences");
    if (!raw) { router.push("/"); return; }

    let parsed: Preferences;
    try {
      parsed = JSON.parse(raw);
    } catch {
      router.push("/");
      return;
    }
    setPrefs(parsed);

    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const list: RecommendedMovie[] = data.candidates ?? [];
        if (list.length === 0) throw new Error("No encontramos películas con esos filtros.");
        setCandidates(list);
        selectMovie(pickRandom(list));
      })
      .catch((err: Error) => setError(err.message ?? "Error desconocido"))
      .finally(() => setLoading(false));
  }, [router, selectMovie]);

  const handleRefresh = () => {
    if (candidates.length === 0 || !currentMovie) return;
    const unseen = candidates.filter((m) => !seenIds.current.has(m.id));
    const pool = unseen.length > 0 ? unseen : candidates.filter((m) => m.id !== currentMovie.id);
    if (pool.length === 0) return;
    if (unseen.length === 0) seenIds.current.clear();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 400);
    selectMovie(pickRandom(pool));
  };

  return (
    <main className="min-h-screen bg-beige-100 pb-16">
      <div className="mx-auto px-4 pt-8 max-w-6xl">
        <button
          onClick={() => router.back()}
          className="self-start flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-4"
        >
          ← Volver
        </button>

        <h1 className="font-display text-4xl tracking-wide text-stone-900 text-center mb-1 uppercase">Tu recomendación 🎬</h1>
        <p className="text-center text-stone-400 text-sm mb-8">Basada en tus preferencias</p>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-beige-50 rounded-xl p-6 text-center border border-beige-200 shadow-sm">
            <p className="text-stone-500 mb-4">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-lg bg-cyan-800 text-white font-semibold hover:bg-cyan-900"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {!loading && !error && currentMovie && (
          <div className="flex flex-col lg:flex-row gap-6 items-start animate-fade-in">

            {/* Col 1 — Poster */}
            <div className="w-full lg:w-1/4">
              <MovieCard movie={currentMovie} posterOnly />
            </div>

            {/* Col 2 — Título, rating, descripción y dónde verla */}
            <div className="w-full lg:w-5/12 flex flex-col gap-4">
              <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-md p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-serif text-2xl text-stone-900 leading-tight">
                    {currentMovie.title}
                  </h2>
                  {currentMovie.media_type === "tv" && (
                    <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                      Serie
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-400">
                    {currentMovie.release_date?.slice(0, 4) ?? "?"}
                  </span>
                  <StarRating score={currentMovie.vote_average} />
                </div>
                {currentMovie.overview && (
                  <ExpandableDescription key={currentMovie.id} text={currentMovie.overview} />
                )}
              </div>
              <WatchProviders
                flatrate={providers?.flatrate ?? []}
                rent={providers?.rent ?? []}
                loading={loadingProviders}
              />
            </div>

            {/* Col 3 — Panel lateral */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 lg:sticky lg:top-8">
              <PreferencesPanel person1={prefs!.person1} person2={prefs?.person2} />
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loadingProviders}
                  className="flex-1 py-3 rounded-xl text-white bg-cyan-800 font-semibold active:scale-95 transition-transform hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <span className={spinning ? "inline-block animate-spin-once" : "inline-block"}>🔀</span>
                  {" "}Otra
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 py-3 rounded-xl text-stone-600 bg-beige-50 border border-beige-200 font-semibold active:scale-95 transition-transform hover:bg-white text-sm"
                >
                  Nueva búsqueda
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
