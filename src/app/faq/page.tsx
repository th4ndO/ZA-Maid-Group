import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CtaSection, PageHead, Placeholder } from "@/components/bits";
import { business, calloutFees, firstCleanOffer, monthlyPlanNote, rand } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ & areas we cover",
  description:
    "Where ZA Maid Group cleans, how the callout fee works, how to pay and how to book. Based in Hatfield, Pretoria.",
  alternates: { canonical: "/faq" },
};

const hatfield = calloutFees.find((c) => c.label === "Hatfield")!;

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Which areas do you clean?",
    a: (
      <>
        <p>
          We&apos;re based in {business.suburb}, {business.city}, and travel up to 20 km. Further than that, ask us and
          we&apos;ll quote the travel. See the <Link href="/services#callout-fee">callout fees</Link> by distance.
        </p>
        <Placeholder title="list of suburbs">The main suburbs ZA Maid covers, e.g. Hatfield, Arcadia, Brooklyn…</Placeholder>
      </>
    ),
  },
  {
    q: "What is the callout fee?",
    a: (
      <p>
        A once-off fee per visit, for all services, based on how far we travel. It&apos;s free in the same building,{" "}
        {rand(hatfield.price!)} elsewhere in {business.suburb}, and goes up by distance to R420 for 15 to 20 km.
      </p>
    ),
  },
  {
    q: "How do I pay?",
    a: <p>Via {business.payment}. We confirm the total before we start, including the callout fee.</p>,
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
        WhatsApp or call us on <a href={`tel:${business.phoneIntl}`}>{business.phoneDisplay}</a>, email{" "}
        <a href={`mailto:${business.email}`}>{business.email}</a>, or use the{" "}
        <Link href="/contact">quote form</Link>.
      </p>
    ),
  },
  ...(firstCleanOffer.enabled
    ? [
        {
          q: "Is there a discount for new clients?",
          a: <p>Yes, you get {firstCleanOffer.percent}% off your first clean. Just mention it when you book.</p>,
        },
      ]
    : []),
  {
    q: "Do I need to provide cleaning products?",
    a: <Placeholder title="answer">Does ZA Maid bring its own products and equipment?</Placeholder>,
  },
  {
    q: "What are your working hours?",
    a: business.hours ? <p>{business.hours}</p> : <Placeholder title="answer">Days and hours you clean.</Placeholder>,
  },
  {
    q: "What if I need to cancel or move my booking?",
    a: <Placeholder title="answer">Cancellation / reschedule notice period and any fee.</Placeholder>,
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
