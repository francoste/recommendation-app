import { Suspense } from "react";
import { QuestionnaireClient } from "@/components/QuestionnaireClient";

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-pink-50 flex items-center justify-center">
          <div className="text-4xl animate-pulse">❤️</div>
        </div>
      }
    >
      <QuestionnaireClient />
    </Suspense>
  );
}
