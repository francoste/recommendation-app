"use client";

import type { Mood } from "@/lib/types";

const MOODS: { value: Mood; label: string; icon: string }[] = [
  { value: "romántico",   label: "Romántico",   icon: "💕" },
  { value: "feliz",       label: "Feliz",       icon: "😄" },
  { value: "aventurero",  label: "Aventurero",  icon: "⚡" },
  { value: "relajado",    label: "Relajado",    icon: "😌" },
  { value: "emocionado",  label: "Emocionado",  icon: "😱" },
  { value: "melancólico", label: "Melancólico", icon: "🌧️" },
];

interface Props {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

export function MoodSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onChange(mood.value)}
          className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all active:scale-95 ${
            value === mood.value
              ? "border-pink-400 bg-pink-50"
              : "border-pink-100 bg-white"
          }`}
        >
          <span className="text-2xl">{mood.icon}</span>
          <span
            className={`text-xs font-medium ${
              value === mood.value ? "text-pink-600" : "text-gray-500"
            }`}
          >
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  );
}
