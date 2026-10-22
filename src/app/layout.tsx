import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppFab } from "@/components/bits";
import { business, priceGroups } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// Brand fonts (Brand Guide §06): Bodoni Moda for headings, Montserrat for everything else.
const serif = Bodoni_Moda({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Home, apartment and office cleaning anywhere in Pretoria, from Hatfield. Clear prices, Monday to Saturday. Book online or WhatsApp 071 510 4638.";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "ZA Maid Group | Cleaning services in Hatfield, Pretoria",
    template: "%s | ZA Maid Group",
  },
  description,
  applicationName: business.name,
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: business.name,
    title: "ZA Maid Group | Your space. Our priority.",
    description,
  },
  alternates: { canonical: "/" },
  formatDetection: { telephone: true },
  // Google Search Console's "HTML tag" check, if used instead of the DNS record. Set
  // NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel to the code from the tag's content="…".
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#0F2340",
};

// What Google reads about the business (structured data). The street address is left out on
// purpose: Duncan Court is a home, and ZA Maid goes to customers, so it's a service-area business.
function jsonLd() {
  const base = siteUrl();
  const url = base.toString();
  const prices = priceGroups.flatMap((g) => g.items.map((i) => i.price));
  return [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${url}#business`,
      name: business.name,
      slogan: business.tagline,
      description,
      url,
      logo: new URL("/icon.png", base).toString(),
      image: new URL("/opengraph-image.png", base).toString(),
      telephone: business.phoneIntl,
      email: business.email,
      priceRange: `R${Math.min(...prices)}–R${Math.max(...prices)}`,
      paymentAccepted: "Cash, EFT",
      currenciesAccepted: "ZAR",
      address: {
        "@type": "PostalAddress",
        addressLocality: business.suburb,
        addressRegion: business.province,
        postalCode: "0083",
        addressCountry: "ZA",
      },
      areaServed: { "@type": "City", name: business.city },
      founder: { "@type": "Person", name: business.founder },
      foundingDate: "2026",
      sameAs: business.socials.map((s) => s.href),
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "18:00",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Cleaning services",
        itemListElement: priceGroups.map((g) => ({
          "@type": "OfferCatalog",
          name: g.title,
          itemListElement: g.items.map((i) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: i.name },
            price: i.price,
            priceCurrency: "ZAR",
          })),
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${url}#website`,
      name: business.name,
      url,
      inLanguage: "en-ZA",
      publisher: { "@id": `${url}#business` },
    },
  ];
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WhatsAppFab />
        <script
          type="application/ld+json"
          // JSON-LD is built from our own constants; escape "<" so it can't close the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
