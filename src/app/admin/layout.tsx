export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-admin-bg text-admin-ink">{children}</div>;
}
