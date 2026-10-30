import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/bits";
import { business } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How ZA Maid Group uses the personal information you share when you book a clean.",
  alternates: { canonical: "/privacy" },
};

// Plain-language POPIA notice. Approved by Zinhle (Information Officer), Oct 2026, including
// keeping booking messages up to 5 years (tax records).
export default function PrivacyPage() {
  return (
    <>
      <PageHead
        label="Privacy"
        title="Privacy notice"
        lede="What we do with the information you give us when you book a clean. Last updated October 2026."
      />
      <section className="section">
        <div className="wrap prose">
          <h2>Who we are</h2>
          <p>
            {business.name}, {business.suburb}, {business.city}. Our Information Officer is {business.founder}. You can
            reach us on <a href={`mailto:${business.email}`}>{business.email}</a> or WhatsApp {business.phoneDisplay}.
          </p>

          <h2>What we collect and why</h2>
          <ul>
            <li>
              <strong>Your booking</strong>: your name, cellphone number, address, the services you want, the time you
              choose and any notes. We use it only to arrange, carry out and follow up your clean. The website
              doesn&apos;t store it. It reaches us as a WhatsApp message that you send yourself.
            </li>
            <li>
              <strong>Your address or location</strong>: when you search for your address or tap &ldquo;Use my current
              location&rdquo;, it is looked up on OpenStreetMap so we can work out the callout fee. We only use your
              location if you allow it.
            </li>
            <li>
              <strong>The first-clean discount</strong>: if you claim it, we keep a scrambled (hashed) copy of your
              cellphone number, not the number itself, so each number can only get the discount once.
            </li>
          </ul>
          <p>
            Please don&apos;t send us gate codes, alarm codes or anything else sensitive in your booking notes. Tell us
            in person instead.
          </p>

          <h2>Who else handles it</h2>
          <p>To run the website and bookings we rely on a few services, some of which process data outside South Africa:</p>
          <ul>
            <li>WhatsApp (Meta) or your email provider, which carry your booking message to us.</li>
            <li>OpenStreetMap Foundation (United Kingdom), for address search.</li>
            <li>
              Supabase (servers in Ireland), which holds the scrambled discount record, run for us by our web
              designers, Profound Productions.
            </li>
            <li>Vercel, which hosts the website and keeps standard server logs.</li>
            <li>Google, only if you open the map or our booking calendar.</li>
          </ul>

          <h2>How long we keep it</h2>
          <p>
            We keep booking messages for as long as we need them for your booking and our business records (up to 5
            years, as the tax rules require), then delete them. The scrambled discount record is kept while the
            first-clean offer runs.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask us what information we hold about you, and ask us to correct or delete it. Email{" "}
            <a href={`mailto:${business.email}`}>{business.email}</a>. We won&apos;t send you marketing messages unless
            you ask us to. If you&apos;re unhappy with how we handle your information, you can complain to the
            Information Regulator at{" "}
            <a href="https://inforegulator.org.za" target="_blank" rel="noopener">
              inforegulator.org.za
            </a>
            .
          </p>

          <p>
            <Link href="/contact">Back to booking</Link>
          </p>
        </div>
      </section>
    </>
  );
}
