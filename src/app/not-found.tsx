import Link from "next/link";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-5 bg-surface px-5 py-20 text-center">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-[10px] border-pink" />
          <div className="absolute right-0 top-1 h-5 w-5 rotate-45 rounded-sm border-2 border-ink/40" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[.16em] text-ink-soft">Error 404</span>
        <h1 className="max-w-md font-serif text-[26px] font-normal leading-tight md:text-[34px]">
          Vaya, esta página se ha perdido como un ovillo debajo del sofá
        </h1>
        <p className="max-w-md text-[14.5px] font-light leading-relaxed text-ink/78">
          El enlace ya no existe o lo he movido de sitio. Vuelve al principio o echa un ojo a lo que hay tejido
          ahora mismo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium">
            Volver al inicio
          </Link>
          <Link href="/catalogo" className="rounded-full border border-ink/22 bg-white px-6 py-3.5 text-[14.5px] font-medium">
            Ver la tienda
          </Link>
        </div>
        <div className="mt-2 flex gap-4 text-[13px] text-ink/60">
          <Link href="/faq" className="border-b border-ink/25">Preguntas frecuentes</Link>
          <Link href="/como-funciona" className="border-b border-ink/25">Cómo funciona un encargo</Link>
          <Link href="/contacto" className="border-b border-ink/25">Escribirme</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
