# ZA Maid Group website

Business Site package (5 pages) for ZA Maid Group, a cleaning company in Hatfield, Pretoria.
Built by Profound Productions on Next.js 16 (App Router), fully static, ready for Vercel.

| Page | Route |
|---|---|
| Home | `/` |
| Services & prices | `/services` |
| About | `/about` |
| FAQ & areas | `/faq` |
| Book a clean (quote form + map) | `/contact` |

Also: floating WhatsApp button, `sitemap.xml`, `robots.txt`, LocalBusiness JSON-LD, social share
image, favicon and app icons from the brand kit.

## Where things live

- **All business details and prices:** `src/content/site.ts`. Change prices there, not in the pages.
- **Brand tokens** (Navy `#0F2340`, Royal `#2B59A8`, Sky `#A9C8EE`, Mist `#EEF2F7`, Ink `#121417`),
  Bodoni Moda + Montserrat: `src/app/globals.css`, `src/app/layout.tsx`.
- **Logos:** `public/brand/` (SVGs copied unchanged from the brand kit).
- **Quote form:** `src/components/QuoteForm.tsx`. It has no backend: it opens WhatsApp or the
  visitor's email app with the request filled in. Nothing is stored and no API keys are needed.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

> If your shell exports `NODE_ENV=development`, `next build` fails on `/_global-error`.
> Build with `NODE_ENV=production npm run build` (Vercel already does).

## Deploy (Vercel)

1. Import this repo in Vercel (framework: Next.js, no settings needed).
2. Once the domain is bought **in ZA Maid's name**, add it in Vercel and set
   `NEXT_PUBLIC_SITE_URL=https://www.<domain>` so the sitemap, canonical URLs and share
   cards use it. Until then the Vercel production URL is used.

## Before launch: content still needed from ZA Maid

Every gap shows on the site as a dashed **"To add: …"** box (search the code for `<Placeholder`).

- [ ] **Photos**: team or founder photo (About + Home), ideally a few real before/after or
      in-action shots. Bright, natural light, no stock photos (Brand Guide §07).
- [ ] **Founder's story**: 2–3 short paragraphs from Zinhle Mdluli for the About page.
- [ ] **Working days and hours** → `business.hours`.
- [ ] **Suburbs covered** (FAQ "Which areas do you clean?").
- [ ] **Products/equipment**: does ZA Maid bring its own? (FAQ)
- [ ] **Cancellation / reschedule policy** (FAQ).
- [ ] **Social links** (Instagram / Facebook / TikTok) → `business.socials`.
- [ ] **Domain**: already owned, or which name to buy (`.co.za` recommended), registered to ZA Maid.

## Before launch: claims to confirm

These come from the brand kit's marketing material but are public promises once live:

- [ ] **"10% off your first clean"** (from the social post in the brand guide). Is it running, and
      on what terms? Turn off with `firstCleanOffer.enabled = false`.
- [ ] **"Satisfaction guaranteed"**: what happens if a client isn't happy (e.g. free re-clean
      within 24 hours)? The site currently says "Tell us and we'll make it right."
- [ ] **Prices** match the October 2026 price list. Confirm they're current.
