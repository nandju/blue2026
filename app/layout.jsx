import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { Analytics } from "@vercel/analytics/react";
import ClientTopProgressBar from "@/components/ClientTopProgressBar";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { SiteContentProvider } from "@/components/SiteContentProvider";
import { getSiteData } from "@/lib/content/siteData.server";
import { googleFontsUrl, fontById, normalizeFonts } from "@/lib/content/fonts";
import { paletteFrom } from "@/lib/colors";

const SITE_URL = "https://www.bluemakers.net";

export async function generateMetadata() {
  const { content, settings } = await getSiteData();
  const seo = content.shared.seo;
  const identity = settings.identity;
  return {
    metadataBase: new URL(SITE_URL),
    title: seo.title,
    description: seo.description,
    applicationName: identity.name,
    keywords: seo.keywords,
    icons: identity.favicon ? { icon: identity.favicon } : undefined,
    openGraph: {
      type: "website",
      url: SITE_URL,
      title: seo.ogTitle || seo.title,
      siteName: identity.name,
      description: seo.ogDescription || seo.description,
      images: seo.ogImage
        ? [{ url: seo.ogImage, alt: `${identity.name} - Organisation Non Gouvernementale`, width: 1200, height: 630 }]
        : undefined,
    },
  };
}

export default async function RootLayout({ children }) {
  const { content, settings } = await getSiteData();
  const p = paletteFrom(settings.colors);
  const fonts = normalizeFonts(settings.fonts);
  const { identity, contact, socials } = settings;

  const cssVars = {
    "--color-primary": p.primary,
    "--color-primary-rgb": p.rgb.primary,
    "--color-secondary": p.secondary,
    "--color-secondary-rgb": p.rgb.secondary,
    "--color-dark": p.dark,
    "--color-dark-rgb": p.rgb.dark,
    "--color-navy": p.navy,
    "--color-navy-rgb": p.rgb.navy,
    "--color-primary-dark": p.primaryDark,
    "--color-primary-dark-rgb": p.rgb.primaryDark,
    "--font-heading": fontById(fonts.heading).stack,
    "--font-body": fontById(fonts.body).stack,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: identity.name,
    url: SITE_URL,
    logo: identity.logo ? new URL(identity.logo, SITE_URL).toString() : undefined,
    description:
      content.shared.seo.description ||
      "Organisation non gouvernementale dédiée à la lutte contre la pollution plastique en Côte d'Ivoire",
    foundingDate: "2022-01",
    address: {
      "@type": "PostalAddress",
      addressLocality: contact.address || "Abidjan",
      addressCountry: "CI",
    },
    contactPoint:
      contact.phones?.[0] || contact.email
        ? {
            "@type": "ContactPoint",
            telephone: contact.phones?.[0] || undefined,
            email: contact.email || undefined,
            contactType: "Customer Service",
          }
        : undefined,
    sameAs: Object.values(socials || {}).filter((v) => typeof v === "string" && v.startsWith("http")),
  };

  return (
    <html lang="fr" style={cssVars}>
      <body>
        {/* Polices choisies dans /admin/webmaster (2 familles maximum chargées) */}
        <link rel="stylesheet" href={googleFontsUrl(fonts)} precedence="fonts" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SiteContentProvider value={{ content, settings }}>
          <ClientTopProgressBar />
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </SiteContentProvider>
        <Analytics />
      </body>
    </html>
  );
}
