"use client";

import { useEffect, useState } from "react";

interface Poster {
  id: number;
  title: string;
  poster_path: string;
}

export default function PosterCarousel() {
  const [posters, setPosters] = useState<Poster[]>([]);

  useEffect(() => {
    fetch("/api/posters")
      .then((r) => r.json())
      .then((d) => setPosters(d.posters ?? []))
      .catch(() => {});
  }, []);

  if (posters.length === 0) {
    return <div className="h-[160px] w-full" />;
  }

  const items = [...posters, ...posters];

  return (
    <div className="relative w-full overflow-hidden h-[160px]">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-beige-100 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-beige-100 to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-3 animate-marquee hover:[animation-play-state:paused]"
        style={{ width: "max-content" }}
      >
        {items.map((poster, i) => (
          <div
            key={`${poster.id}-${i}`}
            className="flex-shrink-0 w-[107px] h-[160px] rounded-xl overflow-hidden shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://image.tmdb.org/t/p/w200${poster.poster_path}`}
              alt={poster.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
