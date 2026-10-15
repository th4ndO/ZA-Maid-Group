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
  // TO CONFIRM: working days and hours.
  hours: null as string | null,
  // TO CONFIRM: Instagram / Facebook / TikTok links.
  socials: [] as { label: string; href: string }[],
};

// TO CONFIRM before launch: the 10% first-clean offer appears on the social post
// in the brand guide. Set to false if it is not running.
export const firstCleanOffer = { enabled: true, percent: 10 };

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${business.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const highlights = [
  { title: "Trusted & trained staff", body: "Trained people who treat your space with care." },
  { title: "Quality products", body: "Good products that leave your space fresh." },
  { title: "Flexible scheduling", body: "Once-off, before a move, or every month." },
  // TO CONFIRM: what "satisfaction guaranteed" means in practice (e.g. free re-clean within 24 hours).
  { title: "Satisfaction guaranteed", body: "Not happy with something? Tell us and we'll make it right." },
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
    note: "R100 base price for carpets smaller than 9 square metres.",
  },
];

export const monthlyPlans = [
  { name: "2 monthly deep cleans", price: 650 },
  { name: "4 monthly deep cleans", price: 1099 },
];
export const monthlyPlanNote = "Plan fee is due on or before the 1st of each month.";

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

// Online booking (a request that ZA Maid confirms on WhatsApp; there's no live
// availability yet). TO CONFIRM: real time windows, days off and how far ahead to book.
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
  googleBookingUrl: googleBookingUrl(process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL),
  daysAhead: 60,
  closedWeekdays: [] as number[], // 0 = Sunday … 6 = Saturday
  timeWindows: [
    { id: "morning", label: "Morning", detail: "Start before 12:00" },
    { id: "afternoon", label: "Afternoon", detail: "Start after 12:00" },
    { id: "flexible", label: "Any time", detail: "Whatever suits you" },
  ],
};
