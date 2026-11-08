/** Line icons used across the info pages (24px grid, stroke follows the text colour). */
const PATHS = {
  chat: <path d="M4 5h16v11H8l-4 4V5Z" />,
  tag: <path d="M3 12V4h8l10 10-8 8L3 12Zm5-4.5h.01" />,
  camera: <path d="M4 8h3l2-3h6l2 3h3v11H4V8Zm8 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />,
  yarn: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M5 9c4 1 10 1 14 0M4.5 13.5c4.5 1.5 10.5 1.5 15 0M8 19c1-5 1-10 0-14M14 20c1.5-5 1.5-11 0-16" />
    </>
  ),
  baby: <path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-3-8h.01M15 13h.01M9.5 16.5c1.5 1 3.5 1 5 0M12 5c0-1.5 1-2 2-2" />,
  box: <path d="M3 8l9-5 9 5v8l-9 5-9-5V8Zm0 0 9 5 9-5M12 13v8" />,
  shield: <path d="M12 3 4.5 6v6c0 4.5 3.2 7.7 7.5 9 4.3-1.3 7.5-4.5 7.5-9V6L12 3Zm-3.5 9 2.5 2.5 4.5-5" />,
  shop: <path d="M4 9h16l-1.2 11H5.2L4 9Zm4 0V7a4 4 0 0 1 8 0v2" />,
  pencil: <path d="M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4" />,
  clock: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
  hand: <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5v-6a1.5 1.5 0 0 1 3 0V11m0-4a1.5 1.5 0 0 1 3 0v6.5c0 4-2.7 7-6.5 7-2.5 0-4-1.2-5.6-3.6L4 13.6a1.4 1.4 0 0 1 2.2-1.7L8 13.8" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
