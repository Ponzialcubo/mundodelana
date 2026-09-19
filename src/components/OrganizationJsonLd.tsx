import { SITE_URL, SITE_NAME, getSiteSettings, phoneDigits } from "@/lib/seo";

function absoluteSocialUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

// Isolated in its own async component (rendered inside a <Suspense> boundary)
// so the DB read doesn't force the whole root layout — including /_not-found —
// out of static prerendering at build time.
export async function OrganizationJsonLd() {
  const { phone, publicEmail, instagramUrl, tiktokUrl } = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: publicEmail,
    telephone: `+${phoneDigits(phone)}`,
    sameAs: [instagramUrl, tiktokUrl].filter(Boolean).map(absoluteSocialUrl),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
