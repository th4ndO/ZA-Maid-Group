// The live domain. NEXT_PUBLIC_SITE_URL can override it (e.g. for a staging copy).
// Canonical links, the sitemap and social previews always point here, even on preview deploys.
const PRODUCTION = "https://zamaidgroup.co.za";

export function siteUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION);
}
