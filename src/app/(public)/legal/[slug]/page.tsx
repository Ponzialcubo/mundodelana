import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/public/Footer";

const PAGES: Record<
  string,
  { title: string; intro: string; sections: { title: string; text: string; list?: string[] }[] }
> = {
  aviso: {
    title: "Aviso legal",
    intro: "Datos identificativos del titular del sitio y condiciones de uso.",
    sections: [
      {
        title: "Titular del sitio web",
        text: "Nombre y apellidos de la titular, NIF, domicilio a efectos de notificaciones, correo electrónico de contacto y, en su caso, datos de inscripción registral. Este párrafo es un marcador de posición: la gestoría facilitará la redacción definitiva.",
      },
      {
        title: "Objeto y condiciones de uso",
        text: "Descripción de la actividad del sitio, condiciones de acceso y uso por parte de los usuarios, obligaciones de uso lícito y consecuencias del incumplimiento.",
      },
      {
        title: "Propiedad intelectual",
        text: "Titularidad de los textos, fotografías, patrones y diseños publicados, y condiciones para su reproducción total o parcial.",
        list: ["Uso de imágenes de producto por terceros", "Reventa de piezas y patrones", "Enlaces desde otros sitios"],
      },
      {
        title: "Responsabilidad y legislación aplicable",
        text: "Limitación de responsabilidad sobre contenidos y enlaces externos, legislación aplicable y fuero competente para la resolución de conflictos.",
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    intro: "Qué datos se recogen, para qué se usan y qué derechos tienes sobre ellos.",
    sections: [
      {
        title: "Responsable del tratamiento",
        text: "Identificación de la responsable, datos de contacto y vía para ejercer los derechos reconocidos por el RGPD y la LOPDGDD. Texto pendiente de redacción definitiva.",
      },
      {
        title: "Datos que se recogen y finalidad",
        text: "Datos facilitados en los formularios de contacto y encargo, datos de cuenta y datos de envío. Finalidades previstas:",
        list: [
          "Responder consultas y presupuestar encargos",
          "Gestionar pedidos, pagos y envíos",
          "Enviar avisos de nuevos productos, solo con consentimiento previo",
        ],
      },
      {
        title: "Conservación y destinatarios",
        text: "Plazos de conservación de cada categoría de datos y terceros que pueden acceder a ellos: empresa de transporte, pasarela de pago y proveedor de correo electrónico.",
      },
      {
        title: "Tus derechos",
        text: "Acceso, rectificación, supresión, oposición, limitación y portabilidad, con indicación del procedimiento para ejercerlos y del derecho a reclamar ante la Agencia Española de Protección de Datos.",
      },
    ],
  },
  cookies: {
    title: "Política de cookies",
    intro: "Cookies que utiliza este sitio y cómo gestionarlas.",
    sections: [
      {
        title: "Qué son las cookies",
        text: "Explicación breve y en lenguaje claro de qué son las cookies y por qué se usan en este sitio. Texto pendiente de redacción definitiva.",
      },
      {
        title: "Cookies que utiliza este sitio",
        text: "Relación de cookies por tipo, con su finalidad y duración:",
        list: [
          "Técnicas necesarias: sesión y carrito",
          "De preferencia: idioma y avisos aceptados",
          "De análisis: estadísticas de uso agregadas",
        ],
      },
      {
        title: "Cómo gestionarlas o retirarlas",
        text: "Instrucciones para aceptar, rechazar o borrar cookies desde el panel de configuración del sitio y desde los navegadores más habituales.",
      },
    ],
  },
};

const NAV = [
  { slug: "aviso", label: "Aviso legal" },
  { slug: "privacidad", label: "Política de privacidad" },
  { slug: "cookies", label: "Política de cookies" },
];

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <>
      <div className="px-5 pt-5 md:px-14">
        <span className="inline-block rounded-full bg-pink/40 px-3 py-1 font-mono text-[10.5px] uppercase tracking-wide text-ink">
          Texto provisional — pendiente de la gestoría
        </span>
      </div>

      <section className="grid grid-cols-1 gap-8 px-5 py-8 md:grid-cols-[220px_1fr] md:px-14 md:py-10">
        <aside className="flex flex-row gap-2 overflow-auto md:sticky md:top-6 md:flex-col md:gap-1.5 md:self-start">
          {NAV.map((item) => (
            <Link
              key={item.slug}
              href={`/legal/${item.slug}`}
              className="rounded-lg px-3.5 py-2.5 text-sm whitespace-nowrap"
              style={
                item.slug === slug
                  ? { background: "#fff", border: "1px solid rgba(74,63,59,.14)", fontWeight: 500 }
                  : { color: "rgba(74,63,59,.7)" }
              }
            >
              {item.label}
            </Link>
          ))}
          <p className="mt-3 hidden max-w-[200px] text-xs text-ink/55 md:block">
            ¿Dudas sobre tus datos? Escríbeme a hola@mundodelana.es y te contesto yo.
          </p>
        </aside>

        <article className="flex max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-[28px] font-normal md:text-[34px]">{page.title}</h1>
            <p className="text-[14.5px] font-light text-ink/75">{page.intro}</p>
          </div>
          {page.sections.map((s) => (
            <div key={s.title} className="flex flex-col gap-2">
              <h2 className="font-serif text-lg font-medium">{s.title}</h2>
              <p className="text-[14.5px] font-light leading-relaxed text-ink/80">{s.text}</p>
              {s.list && (
                <ul className="ml-4 list-disc text-[14.5px] font-light leading-relaxed text-ink/80">
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </article>
      </section>

      <Footer />
    </>
  );
}
