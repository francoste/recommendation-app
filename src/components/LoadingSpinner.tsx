export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="text-6xl animate-pulse">❤️</div>
      <p className="text-pink-400 text-sm font-medium text-center">
        Buscando la película perfecta para esta noche...
      </p>
    </div>
  );
}
