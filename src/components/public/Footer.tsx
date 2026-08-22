import Link from "next/link";

export function Footer({ full = false }: { full?: boolean }) {
  if (!full) {
    return (
      <footer className="flex flex-col items-center gap-2 bg-ink px-5 py-8 text-center text-[13px] font-light text-surface/80 md:flex-row md:justify-between md:px-14 md:py-10 md:text-left">
        <span className="font-serif text-lg font-medium text-surface">Mundodelana</span>
        <span>Taller en Galicia · Envíos a toda España · @mundodelana</span>
      </footer>
    );
  }

  return (
    <footer className="flex flex-col gap-8 bg-ink px-5 py-10 text-surface md:flex-row md:items-start md:justify-between md:px-14 md:py-11">
      <div className="flex flex-col gap-2.5">
        <span className="font-serif text-xl font-medium">Mundodelana</span>
        <span className="text-[13.5px] font-light leading-relaxed text-surface/70">
          Taller en Galicia · Envíos a toda España
          <br />
          Escríbeme antes de encargar, sin compromiso.
        </span>
      </div>
      <div className="grid grid-cols-2 gap-8 text-[13.5px] font-light leading-loose md:flex md:gap-14">
        <div className="flex flex-col">
          <span className="mb-1.5 font-mono text-xs font-medium tracking-wider text-surface/50">TIENDA</span>
          <Link href="/catalogo?cat=Amigurumis" className="text-surface/85">Amigurumis</Link>
          <Link href="/catalogo?cat=Decoraci%C3%B3n" className="text-surface/85">Decoración</Link>
          <Link href="/catalogo?cat=Beb%C3%A9" className="text-surface/85">Bebé</Link>
        </div>
        <div className="flex flex-col">
          <span className="mb-1.5 font-mono text-xs font-medium tracking-wider text-surface/50">ENCARGOS</span>
          <Link href="/como-funciona" className="text-surface/85">Cómo funciona</Link>
          <Link href="/faq" className="text-surface/85">Preguntas frecuentes</Link>
          <Link href="/legal/privacidad" className="text-surface/85">Privacidad</Link>
        </div>
        <div className="flex flex-col">
          <span className="mb-1.5 font-mono text-xs font-medium tracking-wider text-surface/50">SÍGUEME</span>
          <a href="https://instagram.com/mundodelana" target="_blank" rel="noopener noreferrer" className="text-surface/85">Instagram</a>
          <a href="https://tiktok.com/@mundodelana" target="_blank" rel="noopener noreferrer" className="text-surface/85">TikTok</a>
        </div>
      </div>
    </footer>
  );
}
