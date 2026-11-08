import Link from "next/link";

function absoluteSocialUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

// Fallback for the static /not-found page, which can't query the DB at build time.
const DEFAULT_CATEGORIES = [
  { slug: "amigurumis", name: "Amigurumis" },
  { slug: "bebe", name: "Bebé" },
  { slug: "decoracion", name: "Decoración" },
];

export function Footer({
  instagramUrl = "",
  tiktokUrl = "",
  categories = DEFAULT_CATEGORIES,
}: {
  instagramUrl?: string;
  tiktokUrl?: string;
  categories?: { slug: string; name: string }[];
}) {
  return (
    <footer className="flex flex-col gap-8 bg-ink px-5 pb-24 pt-10 text-surface md:flex-row md:items-start md:justify-between md:px-14 md:py-11">
      <div className="flex flex-col gap-2.5">
        <span className="font-serif text-xl font-medium">Mundolana</span>
        <span className="text-[13.5px] font-light leading-relaxed text-surface/70">
          Taller en Galicia · Envíos a toda España
          <br />
          Escríbeme antes de encargar, sin compromiso.
        </span>
      </div>
      <div className="grid grid-cols-2 gap-8 text-[13.5px] font-light leading-loose md:flex md:gap-14">
        <div className="flex flex-col">
          <span className="mb-1.5 font-mono text-xs font-medium tracking-wider text-surface/50">TIENDA</span>
          {categories.map((c) => (
            <Link key={c.slug} href={`/categoria/${c.slug}`} className="text-surface/85">
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col">
          <span className="mb-1.5 font-mono text-xs font-medium tracking-wider text-surface/50">ENCARGOS</span>
          <Link href="/como-funciona" className="text-surface/85">Cómo funciona</Link>
          <Link href="/faq" className="text-surface/85">Preguntas frecuentes</Link>
          <Link href="/contacto" className="text-surface/85">Contacto</Link>
        </div>
        {(instagramUrl || tiktokUrl) && (
          <div className="flex flex-col">
            <span className="mb-1.5 font-mono text-xs font-medium tracking-wider text-surface/50">SÍGUEME</span>
            {instagramUrl && (
              <a href={absoluteSocialUrl(instagramUrl)} target="_blank" rel="noopener noreferrer" className="text-surface/85">
                Instagram
              </a>
            )}
            {tiktokUrl && (
              <a href={absoluteSocialUrl(tiktokUrl)} target="_blank" rel="noopener noreferrer" className="text-surface/85">
                TikTok
              </a>
            )}
          </div>
        )}
        <div className="flex flex-col">
          <span className="mb-1.5 font-mono text-xs font-medium tracking-wider text-surface/50">LEGAL</span>
          <Link href="/legal/aviso" className="text-surface/85">Aviso legal</Link>
          <Link href="/legal/privacidad" className="text-surface/85">Privacidad</Link>
          <Link href="/legal/cookies" className="text-surface/85">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
