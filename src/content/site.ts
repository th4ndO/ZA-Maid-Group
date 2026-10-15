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
  // TO CONFIRM: Instagram / Facebook / TikTok links.
  socials: [] as { label: string; href: string }[],
};

// Confirmed by Zinhle (Oct 2026): first-time customers get 10% off their first clean or service.
export const firstCleanOffer = { enabled: true, percent: 10 };

// Confirmed by Zinhle (Oct 2026).
export const policies = {
  products:
    "We bring our own cleaning products. If you have products you'd prefer us to use, we're happy to use those instead.",
  satisfaction:
    "We don't leave until you've told us you're happy with the clean. If something isn't right, we sort it out there and then.",
  // TO CONFIRM: deposit amount, when it's paid and how (the price list says "payment via EFT or cash").
  cancellation:
    "Cancel at least 24 hours before your clean and your deposit is refunded. If you cancel later than that, the deposit isn't refunded. You can always move your clean to the next available date for free.",
};

// The founder's story, in Zinhle's words (lightly edited from her WhatsApp voice notes).
// TO CONFIRM with Zinhle before launch: the edited wording, especially "bit by bit".
export const founderStory = [
  "I started ZA Maid Group in 2026, when I saw how hard it was to find good cleaning services in Duncan Court. I talked it through with a friend and we saw the gap. I crunched the numbers, and it all made sense.",
  "I've always had a big dream of building a self-sustaining shelter, and bit by bit, ZA Maid has become one of the main ways that dream is becoming a reality. We give students who are willing to work the chance to earn, and get paid the same day.",
  "ZA Maid is here to help people, and I know it's going to change the world. We love to clean. We love the transformation, the before and after. It's a beautiful sight to see a place sparkling clean. The ZA Maid team loves to clean and loves to serve.",
];

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${business.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const highlights = [
  { title: "Trusted & trained staff", body: "Trained people who treat your space with care." },
  { title: "Quality products", body: "We bring our own, or use yours if you prefer." },
  { title: "Flexible scheduling", body: "Monday to Saturday, 08:00 to 18:00." },
  { title: "Satisfaction guaranteed", body: "We don't leave until you're happy with the clean." },
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
  googleBookingUrl: googleBookingUrl(process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL),
  daysAhead: 60,
  closedWeekdays: [0] as number[], // 0 = Sunday … 6 = Saturday (closed Sundays)
  timeWindows: [
    { id: "morning", label: "Morning", detail: "Start 08:00 to 12:00" },
    { id: "afternoon", label: "Afternoon", detail: "Start after 12:00" },
    { id: "flexible", label: "Any time", detail: "Whatever suits you" },
  ],
};
