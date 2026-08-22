"use client";

import Link from "next/link";
import { useState } from "react";

export function OrderForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fileName, setFileName] = useState("");
  const [ref, setRef] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/encargos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestText: form.get("requestText"),
          name: form.get("name"),
          phone: form.get("phone"),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRef(data.ref);
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <section className="flex flex-col items-center gap-4 px-5 py-16 text-center md:px-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-white">✓</span>
        <h1 className="max-w-md font-serif text-[26px] font-normal leading-tight md:text-[32px]">
          ¡Recibido! Te escribo por WhatsApp muy pronto
        </h1>
        <p className="max-w-md text-[14.5px] font-light leading-relaxed text-ink/78">
          Ya tengo tu descripción{fileName ? " y tu foto de referencia" : ""}. Te contesto con precio y plazo en
          menos de 24 h laborables. Si tienes prisa, ábreme el chat y me lo dices.
        </p>
        <span className="font-mono text-xs text-ink-soft">Referencia: {ref}</span>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://wa.me/34600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-sage px-6 py-3.5 text-[14.5px] font-medium text-white"
          >
            Abrir WhatsApp ahora
          </a>
          <Link href="/catalogo" className="rounded-full border border-ink/22 bg-white px-6 py-3.5 text-[14.5px] font-medium">
            Seguir viendo la tienda
          </Link>
        </div>
        <button
          onClick={() => {
            setSent(false);
            setFileName("");
          }}
          className="mt-1 border-b border-ink/30 text-[13px] text-ink/70"
        >
          Enviar otro encargo
        </button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-10 px-5 py-10 md:grid-cols-[1fr_320px] md:gap-14 md:px-14 md:py-14">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] font-normal md:text-[36px]">Cuéntame qué quieres que teja</h1>
          <p className="text-[14.5px] font-light leading-relaxed text-ink/78">
            Rellenar esto no compromete a nada. Te contesto con precio y plazo, y tú decides después.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink/80">¿Qué te gustaría?</span>
            <textarea
              name="requestText"
              required
              rows={5}
              placeholder="Ej: un amigurumi de mi perro, un teckel marrón con collar rojo, de unos 25 cm, para el cumpleaños de mi madre el 14 de octubre."
              className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none"
            />
            <span className="text-xs text-ink/55">Cuanto más concreto, más ajustado será el presupuesto.</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-ink/80">Foto de referencia</span>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-ink/25 bg-white px-4 py-8 text-center">
              <span className="h-7 w-7 rounded-md bg-pink" />
              <span className="text-sm text-ink/75">{fileName || "Arrastra una foto aquí o haz clic para buscarla"}</span>
              <span className="text-xs text-ink/50">JPG o PNG, hasta 10 MB. Cuantas más referencias, mejor.</span>
              <input
                type="file"
                accept="image/*"
                className="absolute h-0 w-0 opacity-0"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink/80">Tu nombre</span>
            <input
              name="name"
              required
              placeholder="María García"
              className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink/80">Teléfono (WhatsApp)</span>
            <input
              name="phone"
              required
              placeholder="600 000 000"
              className="rounded-lg border border-ink/16 bg-white px-4 py-3 text-sm outline-none"
            />
          </label>

          <span className="text-xs text-ink/55">Te escribo por WhatsApp con precio y plazo. Sin compromiso.</span>
          {error && <span className="text-xs text-admin-danger">Algo ha fallado, inténtalo de nuevo.</span>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-full bg-pink px-6 py-3.5 text-[14.5px] font-medium disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar encargo"}
          </button>
        </form>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-ink/8 bg-white p-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Qué pasa después</span>
          <div className="flex flex-col gap-2.5 text-sm text-ink/80">
            <p>1 · Te escribo por WhatsApp en menos de 24 h laborables.</p>
            <p>2 · Cerramos colores, tamaño, fecha y precio por el chat.</p>
            <p>3 · Empiezo a tejer y te mando fotos del avance.</p>
          </div>
          <Link href="/como-funciona" className="text-sm font-medium text-pink-deep">
            Ver el proceso completo
          </Link>
        </div>
        <div className="rounded-xl bg-cream p-6">
          <span className="font-serif text-lg font-medium">Plazo habitual: 1-2 semanas</span>
          <p className="mt-1.5 text-sm text-ink/75">
            Depende de la dificultad y de la lista de espera. Si tienes fecha, dímela en el mensaje.
          </p>
        </div>
      </aside>
    </section>
  );
}
