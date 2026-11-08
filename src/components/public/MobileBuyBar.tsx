"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Phone-only bar pinned to the bottom of a product page once the main buttons
 * scroll out of view, so ordering is always one tap away.
 */
export function MobileBuyBar({ price, cta, href, whatsappHref }: { price: string; cta: string; href: string; whatsappHref: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("comprar");
    if (!target) return;
    // A scroll listener rather than an IntersectionObserver: a fast flick can jump
    // past the buttons without them ever intersecting, and the bar would never show.
    const update = () => setVisible(target.getBoundingClientRect().bottom < 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-surface/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-2.5">
        <span className="min-w-0 flex-1 truncate font-serif text-[17px]">{price}</span>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Preguntar por WhatsApp" tabIndex={visible ? 0 : -1} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.25-2.15a12.1 12.1 0 0 0 3.79.61h.01C22.68 27.46 28 22.1 28 15.49 28 8.88 22.68 3 16.04 3Zm5.43 14.58c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.48 2.49 1.08 2.99.87 3.56.81.57-.06 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
          </svg>
        </a>
        <Link href={href} tabIndex={visible ? 0 : -1} className="shrink-0 rounded-full bg-ink px-5 py-3 text-[14.5px] font-medium text-surface">
          {cta}
        </Link>
      </div>
    </div>
  );
}
