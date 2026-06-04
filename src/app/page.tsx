"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContentType } from "@/lib/types";

const CONTENT_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "pelicula", label: "Películas" },
  { value: "serie",    label: "Series" },
];

export default function Home() {
  const [contentType, setContentType] = useState<ContentType>("pelicula");

  const qs = `&type=${contentType}`;

  return (
    <main className="min-h-screen bg-beige-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full flex flex-col items-center gap-10">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-stone-900 mb-2">Recomendaciones</h1>
          <p className="text-stone-500 text-sm">¿Qué querés ver hoy?</p>
        </div>

        <div className="flex w-full rounded-xl overflow-hidden border border-beige-200 bg-beige-50">
          {CONTENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setContentType(value)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                contentType === value
                  ? "bg-cyan-800 text-white"
                  : "text-stone-600 hover:bg-beige-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link
            href={`/questionnaire?mode=pareja&person=1${qs}`}
            className="w-full py-4 rounded-xl text-center font-semibold text-white bg-cyan-800 shadow-md active:scale-95 transition-transform hover:bg-cyan-900"
          >
            Ver en pareja 👫
          </Link>
          <Link
            href={`/questionnaire?mode=solo&person=1${qs}`}
            className="w-full py-4 rounded-xl text-center font-semibold text-stone-700 bg-beige-50 border border-beige-200 shadow-sm active:scale-95 transition-transform hover:bg-white"
          >
            Ver solo 🎬
          </Link>
        </div>
      </div>
    </main>
  );
}
