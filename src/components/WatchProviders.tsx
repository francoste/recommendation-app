import type { WatchProvider } from "@/lib/types";

interface Props {
  flatrate: WatchProvider[];
  rent: WatchProvider[];
  loading: boolean;
}

function ProviderLogo({ provider }: { provider: WatchProvider }) {
  return (
    <div className="flex flex-col items-center gap-1 w-16">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
        alt={provider.name}
        className="w-12 h-12 rounded-lg object-cover border border-beige-200"
      />
      <span className="text-xs text-stone-500 text-center leading-tight">{provider.name}</span>
    </div>
  );
}

export function WatchProviders({ flatrate, rent, loading }: Props) {
  return (
    <div className="bg-beige-50 rounded-xl p-4 border border-beige-200 shadow-sm mt-4">
      <h4 className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-3">
        Dónde verla en Argentina
      </h4>

      {loading && (
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 w-16">
              <div className="w-12 h-12 rounded-lg bg-beige-200 animate-pulse" />
              <div className="w-10 h-2 rounded bg-beige-200 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && flatrate.length > 0 && (
        <>
          <p className="text-xs text-stone-400 mb-2">Incluida en tu suscripción</p>
          <div className="flex flex-wrap gap-3">
            {flatrate.map((p) => (
              <ProviderLogo key={p.id} provider={p} />
            ))}
          </div>
        </>
      )}

      {!loading && flatrate.length === 0 && rent.length > 0 && (
        <>
          <p className="text-xs text-stone-400 mb-2">Disponible para alquilar</p>
          <div className="flex flex-wrap gap-3">
            {rent.map((p) => (
              <ProviderLogo key={p.id} provider={p} />
            ))}
          </div>
        </>
      )}

      {!loading && flatrate.length === 0 && rent.length === 0 && (
        <p className="text-sm text-stone-400">No encontramos disponibilidad en Argentina.</p>
      )}
    </div>
  );
}
