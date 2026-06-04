"use client";

import type { Duration } from "@/lib/types";

const OPTIONS: { value: Duration; label: string; sub: string }[] = [
  { value: "corta", label: "Corta",  sub: "< 90 min" },
  { value: "media", label: "Media",  sub: "90–120 min" },
  { value: "larga", label: "Larga",  sub: "> 120 min" },
];

interface Props {
  value: Duration[];
  onChange: (d: Duration[]) => void;
}

export function DurationToggle({ value, onChange }: Props) {
  function toggle(d: Duration) {
    if (value.includes(d)) {
      onChange(value.filter((v) => v !== d));
    } else {
      onChange([...value, d]);
    }
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
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
