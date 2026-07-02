"use client";

import type { Duration, ContentType } from "@/lib/types";

const MOVIE_OPTIONS: { value: Duration; label: string; sub: string }[] = [
  { value: "corta",  label: "Corta",  sub: "< 90 min" },
  { value: "media",  label: "Media",  sub: "90–120 min" },
  { value: "larga",  label: "Larga",  sub: "> 120 min" },
];

const TV_OPTIONS: { value: Duration; label: string; sub: string }[] = [
  { value: "mini-serie", label: "Mini-serie",  sub: "1–10 caps" },
  { value: "serie",      label: "Serie",       sub: "+ de 10 caps" },
  { value: "telenovela", label: "Largas",       sub: "+ de 100 caps" },
];

interface Props {
  value: Duration[];
  onChange: (d: Duration[]) => void;
  contentType?: ContentType;
}

export function DurationToggle({ value, onChange, contentType }: Props) {
  function toggle(d: Duration) {
    onChange(value.includes(d) ? value.filter((v) => v !== d) : [...value, d]);
  }

  function Row({ options }: { options: typeof MOVIE_OPTIONS }) {
    return (
      <div className="flex gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              aria-pressed={selected}
              className={`flex-1 py-3 rounded-xl border text-center transition-all active:scale-95 ${
                selected
                  ? "border-cyan-700 bg-cyan-800 text-white"
                  : "border-beige-200 bg-beige-50 text-stone-700 hover:border-beige-300"
              }`}
            >
              <div className="text-sm font-semibold">{opt.label}</div>
              <div className={`text-xs mt-0.5 ${selected ? "text-cyan-100" : "text-stone-400"}`}>{opt.sub}</div>
            </button>
          );
        })}
      </div>
    );
  }

  return <Row options={contentType === "serie" ? TV_OPTIONS : MOVIE_OPTIONS} />;
}
