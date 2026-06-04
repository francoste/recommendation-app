"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GenreChips } from "@/components/ui/GenreChips";
import { YearRangeSlider } from "@/components/ui/YearRangeSlider";
import { DurationToggle } from "@/components/ui/DurationToggle";
import { OriginSelector } from "@/components/ui/OriginSelector";
import { ProgressStepper } from "@/components/ProgressStepper";
import type { Genre, Duration, Origin, QuestionnaireAnswers, Preferences } from "@/lib/types";

export function QuestionnaireClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = (searchParams.get("mode") ?? "solo") as "solo" | "pareja";
  const person = (parseInt(searchParams.get("person") ?? "1") || 1) as 1 | 2;

  const [genres, setGenres] = useState<Genre[]>([]);
  const [yearMin, setYearMin] = useState(1990);
  const [yearMax, setYearMax] = useState(2024);
  const [duration, setDuration] = useState<Duration[]>([]);
  const [origin, setOrigin] = useState<Origin | null>(null);

  useEffect(() => {
    setGenres([]);
    setYearMin(1990);
    setYearMax(2024);
    setDuration([]);
    setOrigin(null);
  }, [person]);

  const isComplete = genres.length > 0 && duration.length > 0 && origin !== null;

  function handleSubmit() {
    if (!isComplete) return;

    const answers: QuestionnaireAnswers = {
      genres,
      yearMin,
      yearMax,
      duration,
      origin: origin!,
    };

    if (mode === "pareja" && person === 1) {
      sessionStorage.setItem("person1Answers", JSON.stringify(answers));
      router.push("/questionnaire?mode=pareja&person=2");
      return;
    }

    let prefs: Preferences;
    if (mode === "pareja") {
      const raw = sessionStorage.getItem("person1Answers");
      if (!raw) {
        router.push("/questionnaire?mode=pareja&person=1");
        return;
      }
      let p1: QuestionnaireAnswers;
      try {
        p1 = JSON.parse(raw);
      } catch {
        router.push("/questionnaire?mode=pareja&person=1");
        return;
      }
      prefs = { mode: "pareja", person1: p1, person2: answers };
    } else {
      prefs = { mode: "solo", person1: answers };
    }

    sessionStorage.setItem("preferences", JSON.stringify(prefs));
    router.push("/recommendations");
  }

  const title =
    mode === "solo"
      ? "¿Qué querés ver? 🎬"
      : person === 1
      ? "Tus preferencias 🎭"
      : "¿Y la otra persona? 👤";

  const backHref =
    mode === "pareja" && person === 2
      ? "/questionnaire?mode=pareja&person=1"
      : "/";

  return (
    <main className="min-h-screen bg-beige-100 pb-28">
      <div className="max-w-sm mx-auto px-4 pt-8 flex flex-col gap-7">
        <button
          onClick={() => router.push(backHref)}
          className="self-start flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          ← Volver
        </button>

        {mode === "pareja" && <ProgressStepper step={person} />}

        <h1 className="font-serif text-2xl text-stone-900 text-center">{title}</h1>

        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Género
          </h2>
          <GenreChips value={genres} onChange={setGenres} />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Época — {yearMin} a {yearMax}
          </h2>
          <YearRangeSlider
            min={yearMin}
            max={yearMax}
            onMinChange={setYearMin}
            onMaxChange={setYearMax}
          />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Duración
          </h2>
          <DurationToggle value={duration} onChange={setDuration} />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Origen
          </h2>
          <OriginSelector value={origin} onChange={setOrigin} />
        </section>

        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`w-full py-4 rounded-xl font-semibold text-white text-base transition-all ${
            isComplete
              ? "bg-cyan-800 shadow-md active:scale-95 hover:bg-cyan-900"
              : "bg-beige-200 text-stone-400 cursor-not-allowed"
          }`}
        >
          {mode === "pareja" && person === 1 ? "Siguiente →" : "Ver recomendación ✨"}
        </button>
      </div>
    </main>
  );
}
