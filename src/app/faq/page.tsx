import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CtaSection, PageHead, Placeholder } from "@/components/bits";
import { business, calloutFees, firstCleanOffer, monthlyPlanNote, policies, rand } from "@/content/site";

export const metadata: Metadata = {
  title: "Cleaning FAQ & areas we cover in Pretoria",
  description:
    "ZA Maid Group cleans anywhere in Pretoria. Callout fees, products, cancellations, payment and booking explained. Based in Hatfield.",
  alternates: { canonical: "/faq" },
};

const hatfield = calloutFees.find((c) => c.label === "Hatfield")!;

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Which areas do you clean?",
    a: (
      <>
        <p>
          Anywhere in {business.city}, including Hatfield, Arcadia, Sunnyside, Brooklyn, Hillcrest, Menlo Park,
          Lynnwood, Waterkloof, the CBD and Centurion. We&apos;re based in {business.suburb} and come to you for a
          callout fee based on distance. See the <Link href="/services#callout-fee">callout fees</Link>. We&apos;re growing, and look
          forward to serving more of the country soon.
        </p>
      </>
    ),
  },
  {
    q: "What is the callout fee?",
    a: (
      <p>
        It&apos;s charged once per visit, for all services, based on how far we travel: {rand(hatfield.price!)} in{" "}
        {business.suburb}, rising by distance to {rand(calloutFees[calloutFees.length - 2].price!)} for 15 to 20 km.
        Further than that, we quote the travel. Your exact fee is worked out from your address when you book online.
      </p>
    ),
  },
  {
    q: "How do I pay?",
    a: <p>
        Via {business.payment}. {policies.deposit} We confirm the total, including the callout fee, before we
        start.
      </p>,
  },
  {
    q: "How do the monthly plans work?",
    a: (
      <p>
        Choose 2 or 4 deep cleans a month and we&apos;ll book them in with you. {monthlyPlanNote}
      </p>
    ),
  },
  {
    q: "Are mattress prices for both sides?",
    a: <p>No, mattress cleaning prices are per side.</p>,
  },
  {
    q: "Do you clean offices?",
    a: (
      <p>
        Yes. Tell us the size of the office and how often you&apos;d like it cleaned, and we&apos;ll send you a
        quote.
      </p>
    ),
  },
  {
    q: "How do I book?",
    a: (
      <p>
        <Link href="/contact">Book online</Link>, WhatsApp or call us on{" "}
        <a href={`tel:${business.phoneIntl}`}>{business.phoneDisplay}</a>, or email{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a>.
      </p>
    ),
  },
  ...(firstCleanOffer.enabled
    ? [
        {
          q: "Is there a discount for new clients?",
          a: (
            <p>
              Yes. First-time customers get {firstCleanOffer.percent}% off once-off services on their first booking
              (not monthly plans or the callout fee), once per cellphone number. Tick the box when you book online and we check your number automatically.
            </p>
          ),
        },
      ]
    : []),
  {
    q: "Do I need to provide cleaning products?",
    a: <p>{policies.products}</p>,
  },
  {
    q: "What are your working hours?",
    a: business.hours ? <p>{business.hours}. We&apos;re closed on Sundays.</p> : <Placeholder title="answer">Days and hours you clean.</Placeholder>,
  },
  {
    q: "What if I need to cancel or move my booking?",
    a: <p>{policies.cancellation}</p>,
  },
  {
    q: "What if I'm not happy with the clean?",
    a: <p>{policies.satisfaction}</p>,
  },
  {
    q: "What do you do with my details?",
    a: (
      <p>
        When you book online, your booking (name, number, address and what you need cleaned) goes straight to us on
        WhatsApp. It isn&apos;t stored on the website. If you ask for the first-clean discount, we keep a
        scrambled record of your cellphone number (not the number itself) so the discount can only be used once.
        Your address is looked up on OpenStreetMap to work out the callout fee. To have your details removed, email{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a>.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHead
        label="FAQ & areas"
        title="Good questions"
        lede="Everything you need to know before you book. Still unsure? WhatsApp us."
      />
      <section className="section">
        <div className="wrap">
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div>{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <CtaSection title="Still have a question?" lede="Send us a message and we'll get back to you." />
    </>
  );
}
