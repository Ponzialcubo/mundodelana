import type { NavIcon } from "@/components/admin/admin-nav";

const PATHS: Record<NavIcon, React.ReactNode> = {
  home: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  orders: <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8zM9 8V6.5a3 3 0 0 1 6 0V8" />,
  messages: <path d="M4.5 6.5A1.5 1.5 0 0 1 6 5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 16H10l-4.5 3.5V16H6a1.5 1.5 0 0 1-1.5-1.5z" />,
  products: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M5 9c4 1 10 1 14 0M4.5 13.5c4.5 1.5 10.5 1.5 15 0M8 19c1-5 1-10 0-14M14 20c1.5-5 1.5-11 0-16" />
    </>
  ),
  categories: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  brands: <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8z" />,
  photos: <path d="M4 7h3l2-2.5h6L17 7h3v12H4zm8 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />,
  pages: <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />,
  dates: <path d="M5 6h14v14H5zM5 10h14M9 4v4M15 4v4M9 14h2" />,
  social: <path d="M7 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm15-6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM6.8 11l10.4-4M6.8 13l10.4 4" />,
  settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.4a7.5 7.5 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7.5 7.5 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z" />,
  newsletter: <path d="M4 6h16v12H4zM4.5 7l7.5 6 7.5-6" />,
  legal: <path d="M12 4v16M6 8h12M7 8l-3 6a3 3 0 0 0 6 0zM17 8l-3 6a3 3 0 0 0 6 0zM8 20h8" />,
  profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />,
  ideas: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />,
};

export function AdminIcon({ name, className = "h-[18px] w-[18px]" }: { name: NavIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
