import type { Metadata } from "next";
import { PageHead, Placeholder } from "@/components/bits";
import { CardIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { Booker } from "@/components/Booker";
import { business, whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a clean",
  description:
    "Book a clean with ZA Maid Group online: choose your services, see the price, pick a day. Or WhatsApp 071 510 4638. Hatfield, Pretoria.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHead
        label="Book a clean"
        title="Book in a minute"
        lede="Choose what needs cleaning, see your price, and pick a day. We'll confirm on WhatsApp."
      />

      <section className="section section--booker">
        <div className="wrap">
          <Booker />
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap split split--wide-left">
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
          </aside>
          <iframe
              className="map"
              title={`Map of ${business.suburb}, ${business.city}`}
              src="https://www.google.com/maps?q=Hatfield,+Pretoria,+South+Africa&z=14&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
      </section>
    </>
  );
}
