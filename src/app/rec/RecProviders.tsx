"use client";

import { useEffect, useState } from "react";
import type { WatchProvider } from "@/lib/types";
import { WatchProviders } from "@/components/WatchProviders";

export default function RecProviders({ id, type }: { id: number; type: string }) {
  const [flatrate, setFlatrate] = useState<WatchProvider[]>([]);
  const [rent, setRent] = useState<WatchProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/providers?id=${id}&type=${type}`)
      .then((r) => r.json())
      .then((d) => { setFlatrate(d.flatrate ?? []); setRent(d.rent ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, type]);

  return <WatchProviders flatrate={flatrate} rent={rent} loading={loading} />;
}
