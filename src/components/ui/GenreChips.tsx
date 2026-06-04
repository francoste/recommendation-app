"use client";

import type { Genre, ContentType } from "@/lib/types";
import { GENRE_MAP, TV_GENRE_MAP } from "@/lib/mappings";

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

interface Props {
  value: Genre[];
  onChange: (genres: Genre[]) => void;
  contentType?: ContentType;
}

export function GenreChips({ value, onChange, contentType }: Props) {
  const visible = contentType === "serie"
    ? GENRES.filter((g) => TV_GENRE_MAP[g.value] !== null)
    : GENRES.filter((g) => GENRE_MAP[g.value] !== null);

  function toggle(genre: Genre) {
    onChange(
      value.includes(genre) ? value.filter((g) => g !== genre) : [...value, genre]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((genre) => (
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
