interface Props {
  step: 1 | 2;
}

export function ProgressStepper({ step }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
          step >= 1 ? "bg-pink-400 text-white" : "bg-pink-100 text-pink-400"
        }`}
      >
        1
      </div>
      <div className={`h-0.5 w-12 transition-colors ${step >= 2 ? "bg-pink-400" : "bg-pink-100"}`} />
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
          step >= 2 ? "bg-pink-400 text-white" : "bg-pink-100 text-pink-400"
        }`}
      >
        2
      </div>
      <span className="text-xs text-gray-400 ml-1">
        {step === 1 ? "Tu turno" : "Turno de tu pareja"}
      </span>
    </div>
  );
}
