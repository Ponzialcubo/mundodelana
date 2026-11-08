// Round floating button: small enough on phones not to cover product text,
// with the label only on wide screens.
export function WhatsAppFloat({ phone = "34600000000" }: { phone?: string }) {
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbeme por WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-white shadow-[0_10px_26px_rgba(74,63,59,0.28)] md:bottom-6 md:right-6 md:h-auto md:w-auto md:px-5 md:py-3.5"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 md:h-5 md:w-5" fill="currentColor">
        <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.25-2.15a12.1 12.1 0 0 0 3.79.61h.01C22.68 27.46 28 22.1 28 15.49 28 8.88 22.68 3 16.04 3Zm0 21.98h-.01a9.9 9.9 0 0 1-3.51-.64l-.25-.1-4.9 1.28 1.31-4.76-.16-.24a9.84 9.84 0 0 1-1.52-5.27c0-5.45 4.45-9.89 9.92-9.89 5.46 0 9.9 4.44 9.9 9.89 0 5.45-4.45 9.73-9.9 9.73Zm5.43-7.4c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span className="hidden text-sm font-medium md:inline">Escríbeme por WhatsApp</span>
    </a>
  );
}
