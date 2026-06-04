import Link from "next/link";
import { HeartPhoto } from "@/components/HeartPhoto";

export default function Home() {
  return (
    <main className="min-h-screen bg-pink-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full flex flex-col items-center gap-10">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-gray-800 mb-2">Nuestras Películas</h1>
          <p className="text-pink-400 text-sm">¿Qué vemos esta noche?</p>
        </div>

        <HeartPhoto />

        <div className="w-full flex flex-col gap-4">
          <Link
            href="/questionnaire?mode=pareja&person=1"
            className="w-full py-4 rounded-2xl text-center font-semibold text-white bg-gradient-to-r from-pink-400 to-rose-400 shadow-md active:scale-95 transition-transform text-lg"
          >
            Ver en pareja ❤️
          </Link>
          <Link
            href="/questionnaire?mode=solo&person=1"
            className="w-full py-4 rounded-2xl text-center font-semibold text-pink-500 bg-white border-2 border-pink-200 shadow-sm active:scale-95 transition-transform"
          >
            Ver solo 🎬
          </Link>
        </div>
      </div>
    </main>
  );
}
