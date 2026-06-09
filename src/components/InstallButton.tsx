"use client";

import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(true); // true por defecto para evitar flash
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  useEffect(() => {
    if (!showTip) return;
    function onClickOutside(e: MouseEvent) {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setShowTip(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showTip]);

  if (isInstalled) return null;

  const isIos = /iphone|ipad|ipod/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    } else {
      setShowTip((v) => !v);
    }
  }

  return (
    <div ref={tipRef} className="fixed top-4 right-4 z-50">
      <button
        onClick={handleClick}
        title="Instalar app"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-800 text-white text-sm font-semibold shadow-lg hover:bg-cyan-900 active:scale-95 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4" /><path d="M8 12l4 4 4-4" /><path d="M4 20h16" />
        </svg>
        Instalar
      </button>

      {showTip && (
        <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-xl border border-beige-200 p-3 text-xs text-stone-600 leading-relaxed">
          {isIos ? (
            <>
              En Safari: tocá <strong>Compartir</strong> (□↑) y luego{" "}
              <strong>"Agregar a inicio"</strong>
            </>
          ) : (
            <>
              En Chrome: tocá el menú <strong>⋮</strong> y luego{" "}
              <strong>"Instalar app"</strong> o{" "}
              <strong>"Agregar a pantalla de inicio"</strong>
            </>
          )}
        </div>
      )}
    </div>
  );
}
