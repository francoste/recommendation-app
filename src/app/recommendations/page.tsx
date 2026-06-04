"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/MovieCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import type { Preferences, RecommendedMovie } from "@/lib/types";

export default function RecommendationsPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<RecommendedMovie[]>([]);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("preferences");
    if (!raw) {
      router.push("/");
      return;
    }

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
        setMovies(data.recommendations);
      })
      .catch((err: Error) => setError(err.message ?? "Error desconocido"))
      .finally(() => setLoading(false));
  }, [router]);

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

        {!loading && !error && (
          <>
            <div className={isPareja ? "flex flex-col lg:flex-row gap-6 items-start" : ""}>
              <div className={isPareja ? "w-full lg:w-1/2" : ""}>
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {isPareja && prefs?.person2 && (
                <div className="w-full lg:w-1/2">
                  <PreferencesPanel person1={prefs.person1} person2={prefs.person2} />
                </div>
              )}
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full mt-8 py-4 rounded-xl text-stone-600 bg-beige-50 border border-beige-200 font-semibold active:scale-95 transition-transform hover:bg-white"
            >
              Nueva búsqueda 🔄
            </button>
          </>
        )}
      </div>
    </main>
  );
}
