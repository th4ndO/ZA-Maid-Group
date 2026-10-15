import type { Metadata } from "next";
import { PageHead, Placeholder } from "@/components/bits";
import { CardIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { QuoteForm } from "@/components/QuoteForm";
import { business, whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a clean",
  description:
    "Get a cleaning quote from ZA Maid Group. WhatsApp or call 071 510 4638, email zamaidgroup@gmail.com, or send the quote form. Hatfield, Pretoria.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHead
        label="Book a clean"
        title="Get your quote"
        lede="Tell us what needs cleaning and where. We'll reply with a price, including the callout fee, and a time."
      />

      <section className="section">
        <div className="wrap split split--wide-left">
          <div>
            <h2>Request a quote</h2>
            <QuoteForm />
          </div>

          <aside aria-label="Contact details">
            <h2>Talk to us</h2>
            <ul className="contact-list">
              <li>
                <WhatsAppIcon />
                <div>
                  <a href={whatsappLink()}>{business.phoneDisplay}</a>
                  <span>WhatsApp, the quickest way to reach us</span>
                </div>
              </li>
              <li>
                <PhoneIcon />
                <div>
                  <a href={`tel:${business.phoneIntl}`}>{business.phoneDisplay}</a>
                  <span>Call us</span>
                </div>
              </li>
              <li>
                <MailIcon />
                <div>
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                  <span>Email</span>
                </div>
              </li>
              <li>
                <PinIcon />
                <div>
                  <strong>
                    {business.suburb}, {business.city}
                  </strong>
                  <span>We come to you, up to 20 km away</span>
                </div>
              </li>
              <li>
                <CardIcon />
                <div>
                  <strong>Payment via {business.payment}</strong>
                </div>
              </li>
              <li>
                <ClockIcon />
                <div>
                  {business.hours ? (
                    <strong>{business.hours}</strong>
                  ) : (
                    <Placeholder title="working hours">Days and times ZA Maid takes bookings.</Placeholder>
                  )}
                </div>
              </li>
            </ul>
            <iframe
              className="map"
              title={`Map of ${business.suburb}, ${business.city}`}
              src="https://www.google.com/maps?q=Hatfield,+Pretoria,+South+Africa&z=14&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </aside>
        </div>
      </section>
    </>
  );
}
