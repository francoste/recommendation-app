"use client";

import { useEffect, useMemo, useState } from "react";

interface Poster {
  id: number;
  title: string;
  poster_path: string;
}

const SKELETON_COUNT = 10;
const skeletons = Array.from({ length: SKELETON_COUNT }, (_, i) => i);

export default function PosterCarousel() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const loaded = posters.length > 0;
  const items = useMemo(() => [...posters, ...posters], [posters]);

  useEffect(() => {
    fetch("/api/posters")
      .then((r) => r.json())
      .then((d) => setPosters(d.posters ?? []))
      .catch(() => {});
  }, []);

  const containerStyle = {
    maskImage: "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
  };

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden h-[200px]" style={containerStyle}>
      <div
        className="flex gap-3 animate-marquee hover:[animation-play-state:paused]"
        style={{ width: "max-content" }}
      >
        {loaded
          ? items.map((poster, i) => (
              <div key={`${poster.id}-${i}`} className="flex-shrink-0 w-[133px] h-[200px] rounded-xl overflow-hidden shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://image.tmdb.org/t/p/w200${poster.poster_path}`}
                  alt={poster.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          : [...skeletons, ...skeletons].map((i) => (
              <div key={i} className="flex-shrink-0 w-[133px] h-[200px] rounded-xl bg-beige-200 animate-pulse" />
            ))}
      </div>
    </div>
  );
}
