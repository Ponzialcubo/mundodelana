"use client";

import { useMemo, useState } from "react";

type Faq = { id: string; question: string; answer: string };

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term)
    );
  }, [faqs, q]);

  return (
    <div className="flex flex-col gap-6">
      <label className="flex items-center gap-2.5 rounded-full border border-ink/16 bg-white px-5 py-3 md:w-[340px]">
        <span className="text-sm text-ink/45">⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar en las preguntas…"
          className="flex-1 bg-transparent text-sm text-ink outline-none"
        />
      </label>

      {filtered.length > 0 ? (
        <div className="flex flex-col divide-y divide-ink/10 rounded-xl border border-ink/10 bg-white">
          {filtered.map((f) => {
            const open = openId === f.id;
            return (
              <div key={f.id}>
                <button
                  onClick={() => setOpenId(open ? null : f.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left md:px-7"
                >
                  <span className="font-serif text-[16px] font-medium md:text-[17px]">{f.question}</span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ background: open ? "#E8B4B8" : "#F7F1EA" }}
                  >
                    {open ? "–" : "+"}
                  </span>
                </button>
                {open && (
                  <div className="px-5 pb-5 text-[14.5px] font-light leading-relaxed text-ink/80 md:px-7">
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink/20 bg-white p-10 text-center">
          <span className="font-serif text-xl">No tengo esa respuesta escrita</span>
          <span className="text-sm text-ink/70">
            Pregúntamelo directamente y te contesto yo misma, normalmente el mismo día.
          </span>
        </div>
      )}
    </div>
  );
}
