/** Compact questions list with native <details>: no JavaScript, accessible, first one open. */
export function FaqList({ faqs }: { faqs: { id: string; question: string; answer: string }[] }) {
  return (
    <div className="flex flex-col divide-y divide-ink/10 rounded-2xl bg-white px-5 md:px-7">
      {faqs.map((f, i) => (
        <details key={f.id} open={i === 0} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15.5px] font-medium [&::-webkit-details-marker]:hidden">
            {f.question}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-ink/60 transition group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="pb-4 pr-10 text-[14.5px] font-light leading-relaxed text-ink/78">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
