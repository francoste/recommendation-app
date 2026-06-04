import { Suspense } from "react";
import { QuestionnaireClient } from "@/components/QuestionnaireClient";

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-beige-100 flex flex-col items-center justify-center gap-4">
          <div className="text-5xl animate-pulse">🎬</div>
          <p className="text-stone-400 text-sm">Cargando...</p>
        </div>
      }
    >
      <QuestionnaireClient />
    </Suspense>
  );
}
