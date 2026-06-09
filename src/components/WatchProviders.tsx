import type { WatchProvider } from "@/lib/types";

interface Props {
  flatrate: WatchProvider[];
  rent: WatchProvider[];
  loading: boolean;
}

const PROVIDER_URLS: Record<number, string> = {
  8:    "https://www.netflix.com",
  9:    "https://www.amazon.com/prime-video",
  10:   "https://www.amazon.com/prime-video",
  119:  "https://www.primevideo.com",
  337:  "https://www.disneyplus.com",
  384:  "https://www.max.com",
  1825: "https://www.max.com",
  619:  "https://www.starplus.com",
  350:  "https://tv.apple.com",
  531:  "https://www.paramountplus.com",
  11:   "https://mubi.com",
  283:  "https://www.crunchyroll.com",
  167:  "https://www.clarovideo.com",
  300:  "https://pluto.tv",
  386:  "https://www.peacocktv.com",
  3:    "https://play.google.com/store/movies",
  188:  "https://www.youtube.com/premium",
};

function ProviderLogo({ provider }: { provider: WatchProvider }) {
  const url = PROVIDER_URLS[provider.id];
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
        alt={provider.name}
        className="w-12 h-12 rounded-lg object-cover border border-beige-200 transition-transform hover:scale-110"
      />
      <span className="text-xs text-stone-500 text-center leading-tight">{provider.name}</span>
    </>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 w-16"
        title={`Ir a ${provider.name}`}
      >
        {inner}
      </a>
    );
  }

  return <div className="flex flex-col items-center gap-1 w-16">{inner}</div>;
}

export function WatchProviders({ flatrate, rent, loading }: Props) {
  return (
    <div className="bg-beige-50 rounded-2xl p-5 border border-beige-200 shadow-md mt-0">
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
