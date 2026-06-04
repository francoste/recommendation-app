"use client";

import type { Origin } from "@/lib/types";

const ORIGINS: { value: Origin; label: string; flag: string }[] = [
  { value: "hollywood",       label: "Hollywood",       flag: "🇺🇸" },
  { value: "europeo",         label: "Europeo",         flag: "🇪🇺" },
  { value: "latinoamericano", label: "Latinoamericano", flag: "🌎" },
  { value: "asiático",        label: "Asiático",        flag: "🌏" },
  { value: "cualquiera",      label: "Cualquiera",      flag: "🌍" },
];

interface Props {
  value: Origin | null;
  onChange: (o: Origin) => void;
}

export function OriginSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORIGINS.map((orig) => (
        <button
          key={orig.value}
          onClick={() => onChange(orig.value)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all active:scale-95 ${
            value === orig.value
              ? "border-cyan-700 bg-cyan-800 text-white"
              : "border-beige-200 bg-beige-50 text-stone-700 hover:border-beige-300"
          }`}
        >
          <span>{orig.flag}</span>
          <span>{orig.label}</span>
        </button>
      ))}
    </div>
  );
}
