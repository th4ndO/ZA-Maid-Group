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
  "Home, apartment and office cleaning anywhere in Pretoria, from Hatfield. Clear prices, trained staff, Monday to Saturday. Book online or WhatsApp 071 510 4638.";

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
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#0F2340",
};

function localBusinessJsonLd() {
  const prices = priceGroups.flatMap((g) => g.items.map((i) => i.price));
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    slogan: business.tagline,
    url: siteUrl().toString(),
    telephone: business.phoneIntl,
    email: business.email,
    priceRange: `R${Math.min(...prices)}–R${Math.max(...prices)}`,
    paymentAccepted: "Cash, EFT",
    currenciesAccepted: "ZAR",
    address: {
      "@type": "PostalAddress",
      addressLocality: `${business.suburb}, ${business.city}`,
      addressRegion: business.province,
      addressCountry: "ZA",
    },
    areaServed: { "@type": "City", name: business.city },
    founder: { "@type": "Person", name: business.founder },
    foundingDate: "2026",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
  };
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
