// The production domain isn't bought yet. Set NEXT_PUBLIC_SITE_URL in Vercel once it is
// (e.g. https://www.zamaidgroup.co.za); until then use Vercel's production URL.
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
