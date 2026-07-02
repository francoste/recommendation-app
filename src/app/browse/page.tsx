"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MovieGrid } from "@/components/MovieGrid";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import { GENRE_MAP, TV_GENRE_MAP } from "@/lib/mappings";
import type { Genre, Duration, Origin, ContentType, TMDBMovie } from "@/lib/types";

// ── Constants ────────────────────────────────────────────────────────────────
const YEAR_MIN = 1960;
const CURRENT_YEAR = new Date().getFullYear();

const GENRES: { value: Genre; label: string }[] = [
  { value: "acción",          label: "Acción 💥" },
  { value: "aventura",        label: "Aventura 🗺️" },
  { value: "animación",       label: "Animación ✨" },
  { value: "bélico",          label: "Bélico 🪖" },
  { value: "ciencia ficción", label: "Sci-Fi 🚀" },
  { value: "comedia",         label: "Comedia 😂" },
  { value: "crimen",          label: "Crimen 🔫" },
  { value: "documental",      label: "Documental 🎤" },
  { value: "drama",           label: "Drama 🎭" },
  { value: "familia",         label: "Familia 👨‍👩‍👧" },
  { value: "misterio",        label: "Misterio 🕵️" },
  { value: "música",          label: "Música 🎵" },
  { value: "reality",         label: "Reality 🎙️" },
  { value: "romance",         label: "Romance 💝" },
  { value: "suspenso",        label: "Suspenso 🔍" },
  { value: "terror",          label: "Terror 👻" },
  { value: "western",         label: "Western 🤠" },
];

const DURATION_OPTIONS_MOVIE: { value: Duration; label: string }[] = [
  { value: "corta",  label: "Corta  (< 90 min)" },
  { value: "media",  label: "Media  (90 – 120 min)" },
  { value: "larga",  label: "Larga  (> 120 min)" },
];

const DURATION_OPTIONS_TV: { value: Duration; label: string }[] = [
  { value: "mini-serie", label: "Mini-serie" },
  { value: "serie",      label: "Serie" },
  { value: "telenovela", label: "Largas (+100 caps)" },
];

const ORIGIN_OPTIONS: { value: Origin; label: string }[] = [
  { value: "hollywood",       label: "Hollywood 🇺🇸" },
  { value: "europeo",         label: "Europeo 🇪🇺" },
  { value: "latinoamericano", label: "Latinoamericano 🌎" },
  { value: "asiático",        label: "Asiático 🌏" },
  { value: "cualquiera",      label: "Cualquier origen" },
];

const PROVIDER_OPTIONS: { value: string; label: string }[] = [
  { value: "8",   label: "Netflix" },
  { value: "9",   label: "Amazon Prime" },
  { value: "337", label: "Disney+" },
  { value: "384", label: "Max" },
  { value: "531", label: "Paramount+" },
  { value: "350", label: "Apple TV+" },
  { value: "283", label: "Crunchyroll" },
  { value: "11",  label: "MUBI" },
];

// ── Provider multi-select dropdown ───────────────────────────────────────────
function ProviderDropdown({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  const label = value.length === 0
    ? "Plataforma"
    : value.length === 1
    ? PROVIDER_OPTIONS.find((p) => p.value === value[0])?.label ?? "1 plataforma"
    : `${value.length} plataformas`;

  const active = value.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
          active
            ? "bg-cyan-800 text-white border-cyan-800"
            : "bg-beige-50 text-stone-700 border-beige-200 hover:border-stone-300"
        }`}
      >
        {label}
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-beige-200 rounded-2xl shadow-xl p-1.5 min-w-[175px] overflow-hidden">
          {PROVIDER_OPTIONS.map((p) => {
            const checked = value.includes(p.value);
            return (
              <label
                key={p.value}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors ${
                  checked ? "bg-cyan-50 text-cyan-900 font-medium" : "text-stone-700 hover:bg-beige-100"
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  checked ? "bg-cyan-800 border-cyan-800" : "border-beige-300 bg-white"
                }`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <input type="checkbox" checked={checked} onChange={() => toggle(p.value)} className="sr-only" />
                {p.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Chevron icon ─────────────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Shared hook: close on outside click ─────────────────────────────────────
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

// ── Genre multi-select dropdown ──────────────────────────────────────────────
function GenreDropdown({ value, onChange, contentType }: {
  value: Genre[];
  onChange: (g: Genre[]) => void;
  contentType: ContentType;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  const visible = contentType === "serie"
    ? GENRES.filter((g) => TV_GENRE_MAP[g.value] !== null)
    : GENRES.filter((g) => GENRE_MAP[g.value] !== null);

  function toggle(genre: Genre) {
    onChange(value.includes(genre) ? value.filter((g) => g !== genre) : [...value, genre]);
  }

  const label = value.length === 0
    ? "Género"
    : value.length === 1
    ? GENRES.find((g) => g.value === value[0])?.label ?? "1 género"
    : `${value.length} géneros`;

  const active = value.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
          active
            ? "bg-cyan-800 text-white border-cyan-800"
            : "bg-beige-50 text-stone-700 border-beige-200 hover:border-stone-300"
        }`}
      >
        {label}
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-beige-200 rounded-2xl shadow-xl p-1.5 min-w-[190px] max-h-64 overflow-y-auto">
          {visible.map((g) => {
            const checked = value.includes(g.value);
            return (
              <label
                key={g.value}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors ${
                  checked ? "bg-cyan-50 text-cyan-900 font-medium" : "text-stone-700 hover:bg-beige-100"
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  checked ? "bg-cyan-800 border-cyan-800" : "border-beige-300 bg-white"
                }`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <input type="checkbox" checked={checked} onChange={() => toggle(g.value)} className="sr-only" />
                {g.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Single-select custom dropdown ────────────────────────────────────────────
function FilterDropdown<T extends string>({ placeholder, value, onChange, options }: {
  placeholder: string;
  value: T | null;
  onChange: (v: T | null) => void;
  options: { value: T; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  const selected = options.find((o) => o.value === value);
  const active = value !== null;

  function pick(v: T | null) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
          active
            ? "bg-cyan-800 text-white border-cyan-800"
            : "bg-beige-50 text-stone-700 border-beige-200 hover:border-stone-300"
        }`}
      >
        {selected?.label ?? placeholder}
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-beige-200 rounded-2xl shadow-xl py-1.5 min-w-[180px] overflow-hidden">
          {active && (
            <button
              onClick={() => pick(null)}
              className="w-full text-left px-3 py-2 text-xs text-stone-400 hover:bg-beige-100 transition-colors"
            >
              Todos ({placeholder.toLowerCase()})
            </button>
          )}
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => pick(o.value)}
              className={`w-full text-left flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                o.value === value
                  ? "bg-cyan-50 text-cyan-900 font-semibold"
                  : "text-stone-700 hover:bg-beige-100"
              }`}
            >
              {o.label}
              {o.value === value && (
                <svg className="w-3.5 h-3.5 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inline year range slider ─────────────────────────────────────────────────
function YearSliderInline({ yearMin, yearMax, onMinChange, onMaxChange }: {
  yearMin: number;
  yearMax: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}) {
  const leftPct  = ((yearMin - YEAR_MIN) / (CURRENT_YEAR - YEAR_MIN)) * 100;
  const rightPct = ((CURRENT_YEAR - yearMax) / (CURRENT_YEAR - YEAR_MIN)) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-stone-500 tabular-nums w-8 text-right shrink-0">
        {yearMin}
      </span>

      <div className="relative h-8 flex items-center w-44 sm:w-60">
        <div className="absolute w-full h-1.5 bg-beige-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-cyan-700 rounded-full"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <input
          type="range"
          min={YEAR_MIN}
          max={CURRENT_YEAR}
          value={yearMin}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), yearMax - 1))}
          className="slider-thumb absolute w-full"
          style={{ zIndex: yearMin > yearMax - 5 ? 5 : 3 }}
        />
        <input
          type="range"
          min={YEAR_MIN}
          max={CURRENT_YEAR}
          value={yearMax}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), yearMin + 1))}
          className="slider-thumb absolute w-full"
          style={{ zIndex: 4 }}
        />
      </div>

      <span className="text-xs font-medium text-stone-500 tabular-nums w-8 shrink-0">
        {yearMax}
      </span>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentType = (searchParams.get("type") ?? "pelicula") as ContentType;

  const [genres, setGenres] = useState<Genre[]>([]);
  const [yearMin, setYearMin] = useState(YEAR_MIN);
  const [yearMax, setYearMax] = useState(CURRENT_YEAR);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [providers, setProviders] = useState<string[]>([]);

  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [total, setTotal] = useState(0);
  const [batch, setBatch] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const buildBody = useCallback(
    (opts: { genres: Genre[]; yearMin: number; yearMax: number; duration: Duration | null; origin: Origin | null; providers: string[] }, b: number) => ({
      contentType,
      batch: b,
      genres: opts.genres,
      yearMin: opts.yearMin,
      yearMax: opts.yearMax,
      duration: opts.duration ? [opts.duration] : [],
      origin: opts.origin,
      watchProviders: opts.providers.length ? opts.providers : undefined,
    }),
    [contentType]
  );

  const fetchResults = useCallback(
    (opts: { genres: Genre[]; yearMin: number; yearMax: number; duration: Duration | null; origin: Origin | null; providers: string[] }) => {
      setLoading(true);
      setError(null);
      setBatch(1);
      fetch("/api/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(opts, 1)),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setResults(data.results ?? []);
          setTotal(data.total ?? 0);
        })
        .catch((e) => setError((e as Error).message ?? "Error al cargar."))
        .finally(() => setLoading(false));
    },
    [buildBody]
  );

  const loadMore = useCallback(() => {
    const nextBatch = batch + 1;
    setLoadingMore(true);
    fetch("/api/browse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBody({ genres, yearMin, yearMax, duration, origin, providers }, nextBatch)),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const newResults = (data.results ?? []) as TMDBMovie[];
        setResults((prev) => {
          const ids = new Set(prev.map((m) => `${m.id}-${m.media_type}`));
          return [...prev, ...newResults.filter((m) => !ids.has(`${m.id}-${m.media_type}`))];
        });
        setBatch(nextBatch);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [batch, buildBody, genres, yearMin, yearMax, duration, origin, providers]);

  // Debounced auto-fetch on filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults({ genres, yearMin, yearMax, duration, origin, providers });
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genres, yearMin, yearMax, duration, origin, providers, contentType]);

  const hasMore = useMemo(() => results.length > 0 && results.length < Math.min(total, 300), [results.length, total]);

  const hasFilters = genres.length > 0 || yearMin !== YEAR_MIN || yearMax !== CURRENT_YEAR || duration !== null || origin !== null || providers.length > 0;

  function clearFilters() {
    setGenres([]); setYearMin(YEAR_MIN); setYearMax(CURRENT_YEAR); setDuration(null); setOrigin(null); setProviders([]);
  }

  const durationOptions = contentType === "serie" ? DURATION_OPTIONS_TV : DURATION_OPTIONS_MOVIE;

  return (
    <main className="min-h-screen bg-beige-100 pb-16">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-5 flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="self-start flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          ← Volver
        </button>
        <h1 className="font-display text-4xl tracking-wide text-stone-900 uppercase text-center">
          Explorar {contentType === "serie" ? "Series" : "Películas"}
        </h1>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 bg-beige-100/95 backdrop-blur-sm border-b border-beige-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <GenreDropdown value={genres} onChange={setGenres} contentType={contentType} />

          <FilterDropdown
            placeholder="Duración"
            value={duration}
            onChange={setDuration}
            options={durationOptions}
          />

          <FilterDropdown
            placeholder="Origen"
            value={origin}
            onChange={setOrigin}
            options={ORIGIN_OPTIONS}
          />

          <ProviderDropdown value={providers} onChange={setProviders} />

          <YearSliderInline
            yearMin={yearMin}
            yearMax={yearMax}
            onMinChange={setYearMin}
            onMaxChange={setYearMax}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-xl border border-beige-200 bg-beige-50 text-stone-500 text-sm font-medium hover:bg-white transition-colors"
            >
              Limpiar
            </button>
          )}

          {!loading && !error && total > 0 && (
            <span className="ml-auto text-xs text-stone-400">
              {results.length} de {total.toLocaleString()} títulos
            </span>
          )}
          {loading && (
            <span className="ml-auto text-xs text-stone-400 animate-pulse">Buscando…</span>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 pt-6 flex flex-col gap-6">
        {error && <p className="text-center text-stone-400 text-sm">{error}</p>}

        <MovieGrid movies={results} loading={loading} onMovieClick={setSelectedMovie} />

        {!loading && hasMore && (
          <div className="flex justify-center pb-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 rounded-xl bg-cyan-800 text-white text-sm font-semibold hover:bg-cyan-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Cargando…" : "Ver más"}
            </button>
          </div>
        )}
      </div>

      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-cyan-800 text-white shadow-lg flex items-center justify-center hover:bg-cyan-900 active:scale-95 transition-all"
          aria-label="Volver arriba"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </main>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige-100" />}>
      <BrowseContent />
    </Suspense>
  );
}
