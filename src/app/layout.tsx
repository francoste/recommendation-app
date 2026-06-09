import type { Metadata, Viewport } from "next";
import { Lora, Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { InstallButton } from "@/components/InstallButton";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f5ede0",
};

export const metadata: Metadata = {
  title: "El Recomendador",
  description: "Encontrá tu próxima película o serie",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${lora.variable} ${inter.variable} ${bebasNeue.variable}`}>
      <body className="font-sans antialiased bg-beige-100 text-stone-900">
        <InstallButton />
        {children}
      </body>
    </html>
  );
}
