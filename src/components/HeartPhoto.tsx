"use client";

import { useState } from "react";

export function HeartPhoto() {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative w-64 h-60 mx-auto"
      style={{ filter: "drop-shadow(0 6px 24px rgba(236,72,153,0.3))" }}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.25 C0.5,0.18,0.4,0.1,0.25,0.1 C0.05,0.1,0,0.3,0,0.45 C0,0.65,0.2,0.82,0.5,1 C0.8,0.82,1,0.65,1,0.45 C1,0.3,0.95,0.1,0.75,0.1 C0.6,0.1,0.5,0.18,0.5,0.25 Z" />
          </clipPath>
        </defs>
      </svg>
      <div
        style={{ clipPath: "url(#heart-clip)" }}
        className="w-full h-full relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-rose-200 to-pink-300 flex items-center justify-center">
          {imgError && <span className="text-5xl">💕</span>}
        </div>
        {!imgError && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/couple.jpg"
            alt="Nosotros"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}
