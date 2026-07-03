"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { ContentType, TMDBMovie } from "@/lib/types";
import { MovieGrid } from "@/components/MovieGrid";
import { MovieDetailModal } from "@/components/MovieDetailModal";

const PosterCarousel = dynamic(() => import("@/components/PosterCarousel"), { ssr: false });

const CONTENT_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "pelicula", label: "Películas" },
  { value: "serie",    label: "Series" },
];

export default function Home() {
  const [ready, setReady] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("pelicula");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRowRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else { setQuery(""); setResults([]); }
  }, [searchOpen]);

  // Cerrar al tocar fuera
  useEffect(() => {
    if (!searchOpen) return;
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      const insideRow = searchRowRef.current?.contains(target);
      const insideResults = resultsRef.current?.contains(target);
      // Keep search open while results are visible (user is browsing/scrolling)
      if (!insideRow && !insideResults && results.length === 0 && !searching) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [searchOpen, results.length, searching]);

  // Reset results when content type changes
  useEffect(() => { setResults([]); setQuery(""); setSearchTotal(0); setSearchPage(1); }, [contentType]);

  // Debounced search (page 1, replaces results)
  useEffect(() => {
    if (!searchOpen) return;
    const q = query.trim();
    if (!q) { setResults([]); setSearchTotal(0); setSearchPage(1); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${contentType}&page=1`);
        const data = await res.json();
        setResults(data.results ?? []);
        setSearchTotal(data.total ?? 0);
        setSearchPage(1);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, searchOpen, contentType]);

  const loadMoreSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    const nextPage = searchPage + 1;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${contentType}&page=${nextPage}`);
      const data = await res.json();
      const newResults = (data.results ?? []) as TMDBMovie[];
      setResults((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...prev, ...newResults.filter((m) => !ids.has(m.id))];
      });
      setSearchPage(nextPage);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [query, contentType, searchPage]);

  const qs = `&type=${contentType}`;
  const hasResults = searching || results.length > 0;
  const showNoResults = searchOpen && !searching && query.trim() && results.length === 0;

  return (
    <main
      data-ready={ready ? "true" : undefined}
      className={`min-h-screen bg-beige-100 flex flex-col items-center py-8 gap-8 ${!hasResults && !showNoResults ? "justify-center" : ""}`}
    >
      <PosterCarousel />

      <div className="max-w-sm w-full px-6 flex flex-col items-center gap-8 animate-fade-in">
        <div className="text-center">
          <h1 className="font-display text-5xl tracking-wide text-stone-900 mb-1">EL RECOMENDADOR</h1>
          <p className="text-stone-400 text-sm">¿Qué querés ver hoy?</p>
        </div>

        <div className="flex w-full rounded-xl overflow-hidden border border-beige-200 bg-beige-50 shadow-sm">
          {CONTENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setContentType(value)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                contentType === value ? "bg-cyan-800 text-white" : "text-stone-500 hover:bg-beige-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link
            href={`/questionnaire?mode=pareja&person=1${qs}`}
            className="w-full py-4 rounded-xl text-center font-semibold text-white bg-cyan-800 shadow-md active:scale-95 transition-all hover:bg-cyan-900 hover:shadow-lg"
          >
            Ver en pareja 👫
          </Link>
          <Link
            href={`/questionnaire?mode=solo&person=1${qs}`}
            className="w-full py-4 rounded-xl text-center font-semibold text-stone-600 bg-beige-50 border border-beige-200 shadow-sm active:scale-95 transition-all hover:bg-white hover:shadow-md"
          >
            Ver solo 🎬
          </Link>

          <div ref={searchRowRef} className="flex gap-2 pt-1">
            {/* Botón lupa — toggle */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Búsqueda"
              aria-expanded={searchOpen}
              className={`flex-shrink-0 flex items-center justify-center w-14 py-3 rounded-xl border shadow-sm active:scale-95 transition-all ${
                searchOpen
                  ? "border-cyan-700 bg-cyan-800 text-white"
                  : "border-beige-200 bg-beige-50 text-stone-500 hover:bg-white"
              }`}
            >
              {searchOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              )}
            </button>

            {/* Input de búsqueda o botón explorar */}
            {searchOpen ? (
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={contentType === "serie" ? "Buscar serie…" : "Buscar película…"}
                  className="w-full px-4 py-3 rounded-xl border border-cyan-700 bg-beige-50 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-cyan-700 text-sm pr-16"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 transition-colors font-medium"
                  >
                    Borrar
                  </button>
                )}
              </div>
            ) : (
              <Link
                href={`/browse?type=${contentType}`}
                className="flex-1 py-3 rounded-xl text-center font-semibold text-stone-500 bg-beige-50 border border-beige-200 shadow-sm active:scale-95 transition-all hover:bg-white hover:shadow-md text-sm"
              >
                Explorar catálogo
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {showNoResults && (
        <p className="text-stone-400 text-sm">Sin resultados para &ldquo;{query}&rdquo;.</p>
      )}

      {hasResults && (
        <div ref={resultsRef} className="w-full max-w-5xl px-4 pb-8 flex flex-col gap-4">
          {query.trim() && !searching && (
            <div className="flex items-baseline justify-between px-1">
              <p className="text-sm text-stone-500">
                Resultados de búsqueda para{" "}
                <span className="font-semibold text-stone-700">&ldquo;{query.trim()}&rdquo;</span>
              </p>
              {searchTotal > 0 && (
                <span className="text-xs text-stone-400 whitespace-nowrap ml-3">
                  {results.length} de {searchTotal.toLocaleString()} títulos
                </span>
              )}
            </div>
          )}
          <MovieGrid movies={results} loading={searching} onMovieClick={setSelectedMovie} />
          {!searching && results.length > 0 && results.length < searchTotal && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={loadMoreSearch}
                disabled={loadingMore}
                className="px-6 py-3 rounded-xl bg-cyan-800 text-white text-sm font-semibold hover:bg-cyan-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Cargando…" : "Ver más"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-cyan-800 text-white shadow-lg flex items-center justify-center hover:bg-cyan-900 active:scale-95 transition-all"
          aria-label="Volver arriba"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </main>
  );
}
