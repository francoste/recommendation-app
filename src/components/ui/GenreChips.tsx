"use client";

import type { Genre } from "@/lib/types";

const GENRES: { value: Genre; label: string }[] = [
  { value: "comedia",         label: "Comedia 😂" },
  { value: "drama",           label: "Drama 🎭" },
  { value: "acción",          label: "Acción 💥" },
  { value: "terror",          label: "Terror 👻" },
  { value: "romance",         label: "Romance 💝" },
  { value: "ciencia ficción", label: "Sci-Fi 🚀" },
  { value: "animación",       label: "Animación ✨" },
  { value: "documental",      label: "Documental 🎤" },
  { value: "suspenso",        label: "Suspenso 🔍" },
];

interface Props {
  value: Genre[];
  onChange: (genres: Genre[]) => void;
}

export function GenreChips({ value, onChange }: Props) {
  function toggle(genre: Genre) {
    onChange(
      value.includes(genre) ? value.filter((g) => g !== genre) : [...value, genre]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => (
        <button
          key={genre.value}
          onClick={() => toggle(genre.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border active:scale-95 ${
            value.includes(genre.value)
              ? "bg-cyan-800 text-white border-cyan-800"
              : "bg-beige-50 text-stone-700 border-beige-200 hover:border-beige-300"
          }`}
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}
