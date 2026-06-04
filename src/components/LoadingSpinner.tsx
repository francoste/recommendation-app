export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 border-2 border-beige-200 border-t-cyan-700 rounded-full animate-spin" />
      <p className="text-stone-400 text-sm">Buscando películas... 🎬</p>
    </div>
  );
}
