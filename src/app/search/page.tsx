"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MovieGrid } from "@/components/MovieGrid";
import type { TMDBMovie, ContentType } from "@/lib/types";
import { Suspense } from "react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentType = (searchParams.get("type") ?? "pelicula") as ContentType;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${contentType}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-beige-100 pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-8 flex flex-col gap-6">
        <button
          onClick={() => router.back()}
          className="self-start flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          ← Volver
        </button>

        <h1 className="font-display text-4xl tracking-wide text-stone-900 uppercase text-center">
          Buscar {contentType === "serie" ? "Series" : "Películas"}
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={contentType === "serie" ? "Nombre de la serie…" : "Nombre de la película…"}
            autoFocus
            className="flex-1 px-4 py-3 rounded-xl border border-beige-200 bg-beige-50 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-cyan-700 text-sm"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-5 py-3 rounded-xl bg-cyan-800 text-white font-semibold text-sm hover:bg-cyan-900 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "…" : "Buscar"}
          </button>
        </form>

        {searched && !loading && results.length === 0 && (
          <p className="text-center text-stone-400 text-sm">No encontramos resultados para "{query}".</p>
        )}

        {searched && !loading && results.length > 0 && (
          <p className="text-xs text-stone-400">{total.toLocaleString()} resultados · mostrando {results.length}</p>
        )}

        <MovieGrid movies={results} loading={loading && searched} />
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige-100" />}>
      <SearchContent />
    </Suspense>
  );
}
