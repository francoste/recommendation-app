import { useMemo } from "react";
import type { WatchProvider } from "@/lib/types";

interface Props {
  flatrate: WatchProvider[];
  rent: WatchProvider[];
  loading: boolean;
}

const PROVIDER_URLS: Record<number, string> = {
  // Global
  8:    "https://www.netflix.com",
  9:    "https://www.primevideo.com",
  10:   "https://www.primevideo.com",
  119:  "https://www.primevideo.com",
  337:  "https://www.disneyplus.com",
  384:  "https://play.hbomax.com",
  1825: "https://www.max.com",
  619:  "https://www.disneyplus.com",
  350:  "https://tv.apple.com",
  2:    "https://tv.apple.com",          // Apple TV Store (rent/buy)
  531:  "https://www.paramountplus.com",
  11:   "https://mubi.com",
  283:  "https://www.crunchyroll.com",
  300:  "https://pluto.tv",
  3:    "https://movies.google.com",     // Google Play Movies
  192:  "https://www.youtube.com",
  188:  "https://www.youtube.com/premium",
  // Argentina
  167:  "https://www.clarovideo.com",
  339:  "https://tv.movistar.com.ar",
  149:  "https://tv.movistar.com.ar",
  202:  "https://www.directvgo.com",
};

// Canales add-on que no son plataformas propias (ej. "Paramount+ Amazon Channel")
const ADDON_CHANNEL = /(Amazon|Apple TV)\s+Channel/i;

function dedupeByUrl(providers: WatchProvider[]): WatchProvider[] {
  const seen = new Set<string>();
  return providers.filter((p) => {
    const url = PROVIDER_URLS[p.id];
    if (!url) return true;
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function ProviderLogo({ provider }: { provider: WatchProvider }) {
  const url = PROVIDER_URLS[provider.id];

  const logo = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
      alt={provider.name}
      loading="lazy"
      decoding="async"
      className="w-12 h-12 rounded-lg object-cover border border-beige-200 transition-transform hover:scale-110"
    />
  );

  return (
    <div className="flex flex-col items-center gap-1 w-16">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" title={`Ir a ${provider.name}`}>
          {logo}
        </a>
      ) : (
        logo
      )}
      <span className="text-xs text-stone-500 text-center leading-tight">{provider.name}</span>
    </div>
  );
}

export function WatchProviders({ flatrate, rent, loading }: Props) {
  const flatrateFiltered = useMemo(
    () => dedupeByUrl(flatrate.filter((p) => !ADDON_CHANNEL.test(p.name))),
    [flatrate]
  );
  const rentFiltered = useMemo(
    () => dedupeByUrl(rent.filter((p) => !ADDON_CHANNEL.test(p.name))),
    [rent]
  );

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

      {!loading && flatrateFiltered.length > 0 && (
        <>
          <p className="text-xs text-stone-400 mb-2">Incluida en tu suscripción</p>
          <div className="flex flex-wrap gap-3">
            {flatrateFiltered.map((p) => (
              <ProviderLogo key={p.id} provider={p} />
            ))}
          </div>
        </>
      )}

      {!loading && flatrateFiltered.length === 0 && rentFiltered.length > 0 && (
        <>
          <p className="text-xs text-stone-400 mb-2">Disponible para alquilar</p>
          <div className="flex flex-wrap gap-3">
            {rentFiltered.map((p) => (
              <ProviderLogo key={p.id} provider={p} />
            ))}
          </div>
        </>
      )}

      {!loading && flatrateFiltered.length === 0 && rentFiltered.length === 0 && (
        <p className="text-sm text-stone-400">No encontramos disponibilidad en Argentina.</p>
      )}
    </div>
  );
}
