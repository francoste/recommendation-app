export function LoadingSpinner() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start animate-pulse">
      <div className="w-full lg:w-1/2">
        <div className="bg-beige-200 rounded-2xl" style={{ aspectRatio: "2/3" }} />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-md p-5 space-y-3">
          <div className="h-3 bg-beige-200 rounded-full w-1/3" />
          <div className="h-4 bg-beige-200 rounded-full w-3/4" />
          <div className="h-3 bg-beige-200 rounded-full w-full" />
          <div className="h-3 bg-beige-200 rounded-full w-5/6" />
        </div>

        <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-md p-4 space-y-3">
          <div className="h-3 bg-beige-200 rounded-full w-1/2" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-12 h-12 bg-beige-200 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="h-14 bg-beige-200 rounded-xl" />
        <div className="h-14 bg-beige-200 rounded-xl opacity-60" />
      </div>
    </div>
  );
}
