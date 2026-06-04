import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-beige-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full flex flex-col items-center gap-10">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-stone-900 mb-2">Recomendaciones</h1>
          <p className="text-stone-500 text-sm">¿Qué querés ver hoy?</p>
        </div>

        <div className="w-12 h-px bg-beige-300" />

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/questionnaire?mode=pareja&person=1"
            className="w-full py-4 rounded-xl text-center font-semibold text-white bg-cyan-800 shadow-md active:scale-95 transition-transform hover:bg-cyan-900"
          >
            Ver en pareja 👫
          </Link>
          <Link
            href="/questionnaire?mode=solo&person=1"
            className="w-full py-4 rounded-xl text-center font-semibold text-stone-700 bg-beige-50 border border-beige-200 shadow-sm active:scale-95 transition-transform hover:bg-white"
          >
            Ver solo 🎬
          </Link>
        </div>
      </div>
    </main>
  );
}
