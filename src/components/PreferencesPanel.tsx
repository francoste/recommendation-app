import type { QuestionnaireAnswers, Origin, Duration } from "@/lib/types";

const ORIGIN_LABELS: Record<Origin, { flag: string; label: string }> = {
  "hollywood":       { flag: "🇺🇸", label: "Hollywood" },
  "europeo":         { flag: "🇪🇺", label: "Europeo" },
  "latinoamericano": { flag: "🌎", label: "Latinoamericano" },
  "asiático":        { flag: "🌏", label: "Asiático" },
  "cualquiera":      { flag: "🌍", label: "Cualquiera" },
};

const DURATION_LABELS: Record<Duration, string> = {
  "corta": "< 90 min",
  "media": "90–120 min",
  "larga": "> 120 min",
};

function PersonBlock({ answers, name }: { answers: QuestionnaireAnswers; name: string }) {
  const origin = ORIGIN_LABELS[answers.origin];

  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-3">{name}</p>
      <ul className="space-y-2 text-sm text-stone-600">
        <li className="flex items-start gap-2">
          <span>🎭</span>
          <span className="capitalize">{answers.genres.join(", ")}</span>
        </li>
        <li className="flex items-center gap-2">
          <span>{origin.flag}</span>
          <span>{origin.label}</span>
        </li>
        <li className="flex items-center gap-2">
          <span>⏱️</span>
          <span>{answers.duration.map((d) => DURATION_LABELS[d]).join(" o ")}</span>
        </li>
        <li className="flex items-center gap-2">
          <span>📅</span>
          <span>{answers.yearMin} – {answers.yearMax}</span>
        </li>
      </ul>
    </div>
  );
}

interface Props {
  person1: QuestionnaireAnswers;
  person2: QuestionnaireAnswers;
}

export function PreferencesPanel({ person1, person2 }: Props) {
  return (
    <div className="bg-beige-50 rounded-xl border border-beige-200 shadow-sm p-5">
      <h2 className="font-serif text-lg text-stone-700 mb-4">Preferencias</h2>
      <div className="flex gap-5">
        <PersonBlock answers={person1} name="Persona 1" />
        <div className="w-px bg-beige-200 self-stretch" />
        <PersonBlock answers={person2} name="Persona 2" />
      </div>
    </div>
  );
}
