import Link from "next/link";

type Step = { title: string; text: string; icon: keyof typeof ICONS };

const ICONS = {
  idea: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />,
  chat: <path d="M4 5h16v11H8l-4 4V5Z" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  yarn: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M5 9c4 1 10 1 14 0M4.5 13.5c4.5 1.5 10.5 1.5 15 0M8 19c1-5 1-10 0-14M14 20c1.5-5 1.5-11 0-16" />
    </>
  ),
  box: <path d="M3 8l9-5 9 5v8l-9 5-9-5V8Zm0 0 9 5 9-5M12 13v8" />,
};

export const DEFAULT_STEPS: Step[] = [
  { icon: "idea", title: "Elige o cuéntame tu idea", text: "Una pieza del catálogo, en tus colores, o algo nuevo a partir de una foto." },
  { icon: "chat", title: "Hablamos por WhatsApp", text: "Contesto yo, no un bot. Cerramos colores, tamaño, fecha y precio." },
  { icon: "yarn", title: "Tejo tu pieza", text: "Te voy enseñando fotos del avance para que lo veas crecer." },
  { icon: "box", title: "Te llega a casa", text: "Envío a toda España con número de seguimiento." },
];

/** Vertical timeline on phones, horizontal on desktop. */
export function HowItWorks({ steps = DEFAULT_STEPS, title = "Así funciona un encargo", showLink = true }: { steps?: Step[]; title?: string; showLink?: boolean }) {
  return (
    <section className="bg-cream px-5 py-12 md:px-14 md:py-16">
      <h2 className="mb-7 font-serif text-[28px] font-normal md:mb-10 md:text-center md:text-[36px]">{title}</h2>
      <ol className="relative flex flex-col gap-6 md:grid md:gap-6" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        <span aria-hidden="true" className="absolute bottom-6 left-[27px] top-6 w-px border-l-2 border-dashed border-pink-deep/30 md:bottom-auto md:left-[10%] md:right-[10%] md:top-[27px] md:h-px md:w-auto md:border-l-0 md:border-t-2" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
            <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-pink-deep shadow-[0_6px_18px_rgba(74,63,59,.08)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[s.icon]}
              </svg>
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-pink text-[12px] font-medium text-ink">{i + 1}</span>
            </span>
            <span className="flex flex-col gap-1 pt-1.5 md:pt-0">
              <span className="font-serif text-[18px] font-medium leading-snug">{s.title}</span>
              <span className="text-[14.5px] font-light leading-relaxed text-ink/75">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
      {showLink && (
        <div className="mt-8 flex justify-center">
          <Link href="/como-funciona" className="rounded-full border border-ink/20 bg-white px-6 py-3 text-[14px] font-medium">
            Plazos, envíos y pagos
          </Link>
        </div>
      )}
    </section>
  );
}
