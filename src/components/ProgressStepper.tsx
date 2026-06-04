interface Props {
  step: 1 | 2;
}

export function ProgressStepper({ step }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
        step >= 1 ? "bg-cyan-800 text-white" : "bg-beige-200 text-stone-400"
      }`}>
        1
      </div>
      <div className={`h-px w-12 transition-colors ${step >= 2 ? "bg-cyan-700" : "bg-beige-200"}`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
        step >= 2 ? "bg-cyan-800 text-white" : "bg-beige-200 text-stone-400"
      }`}>
        2
      </div>
      <span className="text-xs text-stone-400 ml-1">
        {step === 1 ? "Persona 1" : "Persona 2"}
      </span>
    </div>
  );
}
