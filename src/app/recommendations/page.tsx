"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/MovieCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { WatchProviders } from "@/components/WatchProviders";
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
  const seenIds = useRef<Set<number>>(new Set());

  const fetchProviders = useCallback(async (movieId: number) => {
    setLoadingProviders(true);
    setProviders(null);
    try {
      const res = await fetch(`/api/providers?id=${movieId}`);
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
      fetchProviders(movie.id);
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
    selectMovie(pickRandom(pool));
  };

  const isPareja = prefs?.mode === "pareja";

  return (
    <main className="min-h-screen bg-beige-100 pb-16">
      <div className={`mx-auto px-4 pt-8 ${isPareja ? "max-w-4xl" : "max-w-sm"}`}>
        <h1 className="font-serif text-3xl text-stone-900 text-center mb-1">Tu recomendación 🎬</h1>
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
          <>
            <div className={isPareja ? "flex flex-col lg:flex-row gap-6 items-start" : ""}>
              <div className={isPareja ? "w-full lg:w-1/2" : ""}>
                <MovieCard movie={currentMovie} />
                <WatchProviders
                  flatrate={providers?.flatrate ?? []}
                  rent={providers?.rent ?? []}
                  loading={loadingProviders}
                />
              </div>

              {isPareja && prefs?.person2 && (
                <div className="w-full lg:w-1/2">
                  <PreferencesPanel person1={prefs.person1} person2={prefs.person2} />
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={loadingProviders}
              className="w-full mt-6 py-4 rounded-xl text-white bg-cyan-800 font-semibold active:scale-95 transition-transform hover:bg-cyan-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Otra película 🔀
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full mt-3 py-4 rounded-xl text-stone-600 bg-beige-50 border border-beige-200 font-semibold active:scale-95 transition-transform hover:bg-white"
            >
              Nueva búsqueda 🔄
            </button>
          </>
        )}
      </div>
    </main>
  );
}
