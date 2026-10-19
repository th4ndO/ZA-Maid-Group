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
- **Booking:** `src/components/Booker.tsx` (4 steps). It opens WhatsApp or the visitor's email app
  with the booking filled in; the booking itself isn't stored. The only thing stored is a hashed
  phone number when the first-clean discount is claimed (see below). Privacy notice: `/privacy`.

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

## Before launch: still open (as of October 2026)

Zinhle's answers are in (hours Mon–Sat 08:00–18:00, anywhere in Pretoria, products, cancellation,
10% first clean, satisfaction, prices confirmed, founder story). Still needed:

- [x] **Founder headshot** (About → Meet the team).
- [x] **Team**: photos for Zinhle, Precious, Zoleka, Amahle, Mvuni (6 names). Everyone agreed to be shown online (Oct 2026). - [ ] Amukelani's photo. Crop
      with `python3 scripts/headshot.py IN src/assets/team-NAME.jpg EYE_X EYE_Y FACE_W` so every
      face matches, then add them to `team` in `src/content/site.ts` and `photos` in
      `src/app/about/page.tsx`.
- [ ] **Work photos** (Home): real before/after shots. Dashed "To add" boxes show where they go.
- [x] **Social links**: Instagram @za_maidgroup, TikTok @za.maid (footer + Google structured data).
- [x] **Deposit**: 50% by EFT, on all bookings including monthly plans (booker, WhatsApp message,
      FAQ). Banking details are sent by ZA Maid when confirming, not shown on the site.
- [x] **Discount**: 10% on once-off services only (not monthly plans or the callout fee). A
      monthly-plan-only booking doesn't offer it, so it can't use up the number's claim.
- [x] **Carpets**: R100 + R29 per m². **Latest custom start**: 17:00.
- [x] **Base**: Duncan Court, 1226 Park Street, Hatfield (-25.7483, 28.2416). Callout distances
      are measured from here.
- [x] **Founder story**: approved by Zinhle. **Trained staff**: confirmed.
- [x] **Monthly plans**: callout fee on every visit (2 or 4 a month), counted in the estimate.
- [x] **Domain**: `zamaidgroup.co.za` (Hostinger), A `@` → 216.198.79.1, CNAME `www` → Vercel.
      Registered to ZA Maid Group / Zinhle, managed in Profound Productions' Hostinger account;
      Zinhle pays the yearly renewal.
- [x] **Privacy notice**: approved by Zinhle; booking messages kept up to 5 years (tax records).
- [x] **Google booking page**: connected (`https://calendar.app.google/va6cm26uCpFS9umz6`). It opens
      in a new tab from step 3. For the calendar to show *inside* the page, use the full link from
      Google Calendar → the schedule → Share → **Website embed** (a `calendar.google.com/…` URL).

## Online booking

`/contact` has a 4-step booker (services → address → time → details) that sends the booking to
ZA Maid on WhatsApp or email. The booking isn't stored; see "Address check and first-clean
discount" for the one thing that is.

**Real availability (free):** Zinhle creates a Google Calendar *appointment schedule* in her own
Google account, then in Vercel → Project → Settings → Environment Variables add

```
NEXT_PUBLIC_GOOGLE_BOOKING_URL=<the booking page link>
```

and redeploy. Step 3 then embeds her booking page (real open slots, no double bookings); the
WhatsApp message still carries the service list and estimate. Without the variable, step 3 falls
back to the built-in request calendar (days/time windows in `booking` in `src/content/site.ts`).
Accepted links: `https://calendar.app.google/…` or `https://calendar.google.com/calendar/appointments/…`.

## Address check and first-clean discount

**Address (step 2).** The visitor types a street address and presses Find (or uses their location).
It's looked up on OpenStreetMap (Nominatim, free; one search per press, as its usage policy asks)
and must be inside Pretoria/Tshwane. The callout fee is worked out from the distance to the base
(`addressCheck` in `src/content/site.ts`: Duncan Court, straight-line × 1.3 ≈ road km),
so visitors can't pick a cheaper band. The WhatsApp message includes the verified address and a map
link. If the lookup service is down, the visitor picks a band and the message says "address not
verified".

**Discount (step 4).** A cellphone number is required. When a visitor ticks "first clean", the site
calls `za_maid_claim_first_clean()` in the Profound Productions Supabase project. It stores only an
HMAC of the number (secret key in the private `za_maid_private` schema) and answers `granted` (new
number, or a resend within 24 h) or `already_used`. The claims table can't be read with the website
key. If the check is down, the booking is sent without the discount and asks ZA Maid to check.

**For ZA Maid when a booking arrives:** compare the "Phone:" line with the WhatsApp number it came
from. A different number with a discount line means someone may be using another number, so check
before honouring the 10%. No website can stop someone with a second SIM card; this check plus the
database makes repeat claims hard, not impossible.

To reset a number (e.g. a booking that never happened): in Supabase, delete its row from
`public.za_maid_discount_claims` (ask Profound Productions; rows are hashes, so match by time).
