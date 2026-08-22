import { ContactForm } from "@/components/public/ContactForm";
import { Footer } from "@/components/public/Footer";

export default function ContactoPage() {
  return (
    <>
      <section className="grid grid-cols-1 gap-10 px-5 py-12 md:grid-cols-2 md:gap-14 md:px-14 md:py-16">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-serif text-[30px] font-normal md:text-[38px]">Escríbeme y hablamos</h1>
            <p className="text-[14.5px] font-light leading-relaxed text-ink/78">
              Para dudas rápidas, WhatsApp es lo más cómodo. Si prefieres dejarlo por escrito, este formulario me
              llega igual.
            </p>
          </div>
          <ContactForm />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-xl bg-sage p-6 text-white">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/80">La vía más rápida</span>
            <span className="font-serif text-xl font-medium">Hablar por WhatsApp</span>
            <span className="text-sm text-white/85">+34 600 00 00 00 · contesto yo, no un bot</span>
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-fit rounded-full bg-white px-5 py-2.5 text-sm font-medium text-sage"
            >
              Abrir chat
            </a>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-ink/8 bg-white p-6">
            <span className="font-serif text-lg font-medium">Horario</span>
            <div className="flex flex-col gap-1 text-sm text-ink/78">
              <div className="flex justify-between"><span>Lunes a viernes</span><span>10:00 – 19:00</span></div>
              <div className="flex justify-between"><span>Sábado</span><span>10:00 – 14:00</span></div>
              <div className="flex justify-between"><span>Domingo</span><span>Cerrado</span></div>
            </div>
            <span className="mt-1.5 text-xs text-ink/55">
              Suelo contestar en menos de 24 h. Si escribes un domingo, tendrás respuesta el lunes por la mañana.
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-ink/8 bg-white p-6">
            <span className="font-serif text-lg font-medium">@mundodelana</span>
            <span className="text-sm text-ink/78">
              Subo el proceso de cada encargo en vídeo. Buen sitio para ver acabados de cerca antes de pedir.
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
