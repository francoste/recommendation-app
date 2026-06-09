"use client";

import { useState } from "react";

interface Props {
  text: string;
}

export function ExpandableDescription({ text }: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p className={`text-sm text-stone-600 leading-relaxed ${expanded ? "" : "line-clamp-4"}`}>
        {text}
      </p>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-cyan-700 hover:text-cyan-900 mt-1 font-medium transition-colors"
      >
        {expanded ? "ver menos" : "ver más..."}
      </button>
    </div>
  );
}
