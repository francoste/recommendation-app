"use client";

const YEAR_MIN = 1960;
const YEAR_MAX = new Date().getFullYear();

interface Props {
  min: number;
  max: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

export function YearRangeSlider({ min, max, onMinChange, onMaxChange }: Props) {
  const leftPct = ((min - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
  const rightPct = ((YEAR_MAX - max) / (YEAR_MAX - YEAR_MIN)) * 100;

  return (
    <div className="px-1">
      <div className="relative h-8 flex items-center">
        <div className="absolute w-full h-1.5 bg-beige-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-cyan-700 rounded-full"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <input
          type="range"
          min={YEAR_MIN}
          max={YEAR_MAX}
          value={min}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 1))}
          className="slider-thumb absolute w-full"
          style={{ zIndex: min > max - 5 ? 5 : 3 }}
        />
        <input
          type="range"
          min={YEAR_MIN}
          max={YEAR_MAX}
          value={max}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 1))}
          className="slider-thumb absolute w-full"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between mt-1 text-sm font-medium text-stone-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
