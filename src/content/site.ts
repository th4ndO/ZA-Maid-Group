// Single source of truth for ZA Maid Group's business details and prices.
// Everything here comes from the client's brand kit (Brand Guide v1, price list,
// business card) unless it is marked TO CONFIRM. Update this file, not the pages.

export const business = {
  name: "ZA Maid Group",
  tagline: "Your space. Our priority.",
  slogan: "We Got You!",
  founder: "Zinhle Mdluli",
  phoneDisplay: "071 510 4638",
  phoneIntl: "+27715104638",
  whatsappNumber: "27715104638",
  email: "zamaidgroup@gmail.com",
  suburb: "Hatfield",
  city: "Pretoria",
  province: "Gauteng",
  payment: "EFT or cash",
  serves: ["Homes", "Apartments", "Offices"],
  hours: "Monday to Saturday, 08:00 to 18:00" as string | null,
  areaServed: "Anywhere in Pretoria",
  // Confirmed by Zinhle (Oct 2026).
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/za_maidgroup" },
    { label: "TikTok", href: "https://www.tiktok.com/@za.maid" },
  ] as { label: string; href: string }[],
};

// Confirmed by Zinhle (Oct 2026): first-time customers get 10% off once-off services
// (not monthly plans, not the callout fee).
export const firstCleanOffer = { enabled: true, percent: 10 };

// Confirmed by Zinhle (Oct 2026).
export const policies = {
  products:
    "We bring our own cleaning products. If you have products you'd prefer us to use, we're happy to use those instead.",
  satisfaction:
    "We don't leave until you've told us you're happy with the clean. If something isn't right, tell us before we go and we'll clean it again.",
  // Deposit confirmed by Zinhle (Oct 2026): 50% by EFT to confirm any booking, monthly plans included.
  depositPercent: 50,
  deposit: "We ask for a 50% deposit by EFT to confirm your booking. We send our banking details when we confirm.",
  cancellation:
    "Cancel at least 24 hours before your clean and your deposit is refunded. If you cancel later than that, the deposit isn't refunded. You can always move your clean to the next available date for free.",
};

// The founder's story, in Zinhle's words (lightly edited from her WhatsApp voice notes).
// Approved by Zinhle (Oct 2026).
export const founderStory = [
  "I started ZA Maid Group in 2026, when I saw how hard it was to find good cleaning services in Duncan Court. I talked it through with a friend and we saw the gap. I crunched the numbers, and it all made sense.",
  "I've always had a big dream of building a self-sustaining shelter, and bit by bit, ZA Maid has become one of the main ways that dream is becoming a reality. We give students who are willing to work the chance to earn, and they get paid the same day.",
  "ZA Maid is here to help people, and I know it's going to change the world. We love to clean. We love the transformation, the before and after. It's a beautiful sight to see a place sparkling clean. The ZA Maid team loves to clean and loves to serve.",
];

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${business.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const highlights = [
  // From the social post in ZA Maid's brand kit. Zinhle confirmed staff are trained (Oct 2026).
  { title: "Trusted & trained staff", body: "Careful people who treat your space with respect." },
  { title: "Quality products", body: "We bring our own, or use yours if you prefer." },
  { title: "Flexible scheduling", body: "Monday to Saturday, 08:00 to 18:00." },
  { title: "We don't leave until you're happy", body: "You check the clean before we go." },
];

export type ServiceSummary = { slug: string; title: string; body: string };

export const services: ServiceSummary[] = [
  {
    slug: "home",
    title: "Home & Apartment",
    body: "Regular cleans for houses, flats and student apartments, from a single bathroom to the whole place.",
  },
  {
    slug: "office",
    title: "Office",
    body: "A clean, calm workspace for your team and your clients.",
  },
  {
    slug: "move",
    title: "Move-In / Move-Out",
    body: "A thorough clean before you hand back the keys, or before you unpack.",
  },
  {
    slug: "deep",
    title: "Deep Cleaning",
    body: "Couches, mattresses, carpets and the corners that need extra attention.",
  },
  {
    slug: "custom",
    title: "Custom Packages",
    body: "Monthly plans or a mix of services, put together around your space.",
  },
];

export type PriceItem = { name: string; price: number };
export type PriceGroup = { id: string; title: string; items: PriceItem[]; note?: string };

// From ZA-Maid_Price-List_Post_1080x1350.png (brand kit, October 2026).
export const priceGroups: PriceGroup[] = [
  {
    id: "home-cleaning",
    title: "Home cleaning",
    items: [
      { name: "Standard clean", price: 200 },
      { name: "Bachelor clean", price: 329 },
      { name: "One bedroom clean", price: 350 },
      { name: "Two bedroom clean", price: 399 },
      { name: "Bathroom clean", price: 100 },
      { name: "Kitchen clean", price: 149 },
      { name: "Shower clean", price: 69 },
      { name: "Wardrobe organisation", price: 149 },
      { name: "Move in / out clean", price: 399 },
    ],
  },
  {
    id: "couches-chairs",
    title: "Couches & chairs",
    items: [
      { name: "Dining chair", price: 80 },
      { name: "Armchair", price: 190 },
      { name: "2-seater couch", price: 300 },
      { name: "3-seater couch", price: 400 },
      { name: "L-shaped / 5-seater set", price: 550 },
    ],
  },
  {
    id: "mattress-cleaning",
    title: "Mattress cleaning",
    items: [
      { name: "Single mattress", price: 200 },
      { name: "Double mattress", price: 300 },
    ],
    note: "Prices are per side.",
  },
  {
    id: "carpet-cleaning",
    title: "Carpet cleaning",
    items: [
      { name: "Wall-to-wall carpet wash", price: 400 },
      { name: "Carpet, per square metre", price: 29 },
    ],
    note: "Carpets are R100 plus R29 per square metre.",
  },
];

export const monthlyPlans = [
  { name: "2 monthly deep cleans", price: 650, visits: 2 },
  { name: "4 monthly deep cleans", price: 1099, visits: 4 },
];
// Confirmed by Zinhle (Oct 2026): the callout fee is charged on every visit of a plan.
export const monthlyPlanNote =
  "Plan fee is due on or before the 1st of each month. The callout fee is added for each visit.";

export const calloutFees: { label: string; detail: string; price: number | null }[] = [
  { label: "Same building", detail: "", price: 0 },
  { label: "Hatfield", detail: "other building", price: 80 },
  { label: "Up to 5 km", detail: "", price: 150 },
  { label: "5 to 10 km", detail: "", price: 220 },
  { label: "10 to 15 km", detail: "", price: 320 },
  { label: "15 to 20 km", detail: "", price: 420 },
  { label: "Over 20 km", detail: "", price: null },
];
export const calloutNote = "Charged once per visit, for all services.";

export function rand(amount: number) {
  return `R${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services & prices" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Book a clean" },
];

// Online booking (a request that ZA Maid confirms on WhatsApp unless the Google booking
// page below is connected). Hours confirmed: Monday to Saturday, 08:00 to 18:00.
// Zinhle's free Google Calendar booking page (Calendar → Create → Appointment schedule →
// Share → Website embed). Set NEXT_PUBLIC_GOOGLE_BOOKING_URL in Vercel to its link and
// redeploy: step 3 of the booker then shows real open slots instead of our request calendar.
function googleBookingUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    const ok =
      url.protocol === "https:" &&
      (url.hostname === "calendar.app.google" ||
        (url.hostname === "calendar.google.com" && url.pathname.includes("/appointments/")));
    if (!ok) return null;
    if (url.hostname === "calendar.google.com") url.searchParams.set("gv", "true"); // embed mode
    return url.toString();
  } catch {
    return null;
  }
}

export const booking = {
  // Zinhle's booking page (shared 16 Oct 2026). NEXT_PUBLIC_GOOGLE_BOOKING_URL overrides it.
  googleBookingUrl: googleBookingUrl(
    process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL ?? "https://calendar.app.google/va6cm26uCpFS9umz6",
  ),
  daysAhead: 60,
  closedWeekdays: [0] as number[], // 0 = Sunday … 6 = Saturday (closed Sundays)
  // Custom start times customers may request (24h "HH:MM"). Latest start 17:00, confirmed
  // by Zinhle (Oct 2026).
  customTime: { earliest: "08:00", latest: "17:00", stepMinutes: 15 },
  timeWindows: [
    { id: "morning", label: "Morning", detail: "Start 08:00 to 12:00" },
    { id: "afternoon", label: "Afternoon", detail: "Start after 12:00" },
    { id: "flexible", label: "Any time", detail: "Whatever suits you" },
    { id: "exact", label: "A specific time", detail: "Choose your start time" },
  ],
};

// Address check (step 2 of the booker). Addresses are looked up on OpenStreetMap
// (Nominatim) and must be inside the Tshwane / Pretoria area. The callout fee is worked
// out from the distance to ZA Maid's base, so customers can't pick a cheaper band.
export const addressCheck = {
  // ZA Maid's base: Duncan Court, 1226 Park Street, Hatfield (confirmed Oct 2026; map point
  // from OpenStreetMap).
  base: { lat: -25.7483, lon: 28.2416 },
  baseName: "Duncan Court",
  // Straight-line distance × this ≈ distance by road (roads are rarely straight).
  roadFactor: 1.3,
  // Roughly the City of Tshwane: [west, north, east, south].
  bbox: [27.85, -25.35, 28.75, -26.05] as const,
  // Distances (by road, km) for each callout band, matching `calloutFees` above.
  // (Only addresses OpenStreetMap places in the suburb of Hatfield get the Hatfield fee.)
};

// First-clean discount check: one per phone number, recorded (as a keyed hash, never the
// number itself) in Supabase via the za_maid_claim_first_clean() function. These are
// public, browser-safe values; the table itself is not readable with them.
export const discountCheck = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ofbitzqczupdobofuosh.supabase.co",
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_Xr63gZIZfqb9TVtomJVyQA_2drxFNIF",
};

// About page team grid ("more people will be added as time goes"). To add someone, add a line
// here. Members without a photo show their initials. To add a photo, crop it with
// scripts/headshot.py, import it in app/about/page.tsx and give it a key in `photos` there.
// Everyone listed agreed to be shown online (confirmed via Zinhle, Oct 2026). Get the same OK
// from anyone new before adding them.
export type TeamPhoto = "zinhle" | "precious" | "amahle" | "zoleka" | "mvuni" | "amukelani";
export const team: { name: string; role: string; photo?: TeamPhoto }[] = [
  { name: business.founder, role: "Founder", photo: "zinhle" },
  { name: "Precious Musuamba Mujanay", role: "Cleaner", photo: "precious" },
  { name: "Amukelani Shabangu", role: "Cleaner", photo: "amukelani" },
  { name: "Zoleka Kene", role: "Cleaner", photo: "zoleka" },
  { name: "Amahle Mbali Zibane", role: "Cleaner", photo: "amahle" },
  { name: "Mvuni Mdoka", role: "Cleaner", photo: "mvuni" },
];

// Home page before & after (real cleans, sent by Zinhle Oct 2026). Photos are in
// src/assets/work and mapped by key in app/page.tsx. Personal photos in shot are blurred;
// check with the customer before adding new ones.
export type WorkPhoto = "kitchen" | "sink" | "desk";
export const beforeAfter: { photo: WorkPhoto; title: string; before: string; after: string }[] = [
  {
    photo: "kitchen",
    title: "Kitchen counter",
    before: "Kitchen counter covered in dishes, pots and cutlery",
    after: "The same kitchen counter, cleared and wiped down",
  },
  {
    photo: "sink",
    title: "Sink",
    before: "Kitchen sink full of soapy water with bottles and gloves around it",
    after: "The same sink, empty and shining",
  },
  {
    photo: "desk",
    title: "Desk corner",
    before: "Desk covered in clutter with socks on the chair",
    after: "The same desk, cleared and tidy",
  },
];

// Services page: photos from one finished full clean (Oct 2026). "After" shots only, so
// they're shown as a finished clean, not as before & after.
export type FinishedPhoto = "kitchen" | "bathroom" | "shower";
export const finishedClean: { photo: FinishedPhoto; title: string; alt: string }[] = [
  { photo: "kitchen", title: "Kitchen", alt: "Spotless kitchen with the ZA Maid checklist and a thank-you card on the counter" },
  { photo: "bathroom", title: "Bathroom", alt: "Clean bathroom with a shining basin and toilet" },
  { photo: "shower", title: "Shower", alt: "Clean shower with clear glass and fresh tiles" },
];
