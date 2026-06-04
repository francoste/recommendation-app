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
            className={`flex-1 py-3 rounded-2xl border-2 text-center transition-all active:scale-95 ${
              selected ? "border-pink-400 bg-pink-50" : "border-pink-100 bg-white"
            }`}
          >
            <div className={`text-sm font-semibold ${selected ? "text-pink-600" : "text-gray-700"}`}>
              {opt.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
