import Image from "next/image";
import Link from "next/link";
import { AutoCarousel } from "@/components/AutoCarousel";
import { CtaSection, OfferBadge, OfferPill, PriceCard } from "@/components/bits";
import { HeroRings } from "@/components/HeroRings";
import { ArrowIcon, CheckIcon, WhatsAppIcon } from "@/components/icons";
import deskAfter from "@/assets/work/desk-after.jpg";
import deskBefore from "@/assets/work/desk-before.jpg";
import kitchenAfter from "@/assets/work/kitchen-after.jpg";
import kitchenBefore from "@/assets/work/kitchen-before.jpg";
import sinkAfter from "@/assets/work/sink-after.jpg";
import sinkBefore from "@/assets/work/sink-before.jpg";
import {
  beforeAfter,
  business,
  highlights,
  monthlyPlans,
  priceGroups,
  rand,
  services,
  whatsappLink,
  type WorkPhoto,
} from "@/content/site";

const work: Record<WorkPhoto, { before: typeof deskAfter; after: typeof deskAfter }> = {
  kitchen: { before: kitchenBefore, after: kitchenAfter },
  sink: { before: sinkBefore, after: sinkAfter },
  desk: { before: deskBefore, after: deskAfter },
};

// Mobile-first: each section has one job and one thing that stands out.
export default function Home() {
  const homeCleaning = priceGroups.find((g) => g.id === "home-cleaning")!;
  const popular = { ...homeCleaning, items: homeCleaning.items.slice(0, 4), title: "Popular home cleans" };

  return (
    <>
      <section className="hero">
        <HeroRings />
        <div className="wrap hero__grid">
          <div>
            <p className="label">
              {business.suburb} · {business.city}
            </p>
            <h1>
              Your space. <span className="accent">Our priority.</span>
            </h1>
            <p className="lede">Cleaning for homes, apartments and offices. Real prices, no surprises.</p>
            <OfferPill />
            <ul className="chips" aria-label="Our services">
              {services.map((s) => (
                <li key={s.slug}>{s.title}</li>
              ))}
            </ul>
            <div className="btn-row hero__actions">
              <a className="btn btn--primary" href={whatsappLink("Hi ZA Maid Group, I'd like a quote for a clean.")}>
                <WhatsAppIcon /> Get a quote on WhatsApp
              </a>
              <Link className="btn btn--ghost" href="/contact">
                Book online
              </Link>
            </div>
          </div>
          <div className="hero__aside">
            {/* Phones never show this logo, so give them a 1-pixel stand-in instead of a ~17 KB download. */}
            <picture>
              <source media="(max-width: 899px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
              <img className="hero__logo" src="/brand/logo-primary-white.svg" alt="" width={1145} height={670} decoding="async" />
            </picture>
            <OfferBadge />
          </div>
        </div>
      </section>

      <section className="trust" aria-label="Why people choose ZA Maid">
        <ul className="wrap trust__list">
          {highlights.map((h) => (
            <li key={h.title}>
              <CheckIcon />
              <span>{h.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">What we do</p>
            <h2>Cleaning for every kind of space</h2>
          </div>
          <AutoCarousel className="grid grid--3" label="Our services">
            {services.map((s, i) => (
              <article key={s.slug} className="card card--band">
                <p className="card__num">{String(i + 1).padStart(2, "0")}</p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </AutoCarousel>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Before &amp; after</p>
            <h2>See the difference</h2>
            <p className="lede">Real cleans by the ZA Maid team.</p>
          </div>
          <AutoCarousel className="grid grid--3 ba-row" label="Before and after photos">
            {beforeAfter.map((p) => (
              <figure key={p.photo} className="ba">
                <div className="ba__pair">
                  <div className="ba__img">
                    <Image src={work[p.photo].before} alt={`Before: ${p.before}`} sizes="(min-width: 640px) 180px, 42vw" placeholder="blur" />
                    <span className="ba__tag">Before</span>
                  </div>
                  <div className="ba__img">
                    <Image src={work[p.photo].after} alt={`After: ${p.after}`} sizes="(min-width: 640px) 180px, 42vw" placeholder="blur" />
                    <span className="ba__tag ba__tag--after">After</span>
                  </div>
                </div>
                <figcaption>{p.title}</figcaption>
              </figure>
            ))}
          </AutoCarousel>
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap split split--wide-left">
          <div>
            <p className="label">Real prices, no surprises</p>
            <h2>Know what you&apos;ll pay</h2>
            <p className="lede hide-mobile">
              Every price is on our list, from a R69 shower clean to monthly deep-clean plans. A callout fee is added
              per visit, based on distance.
            </p>
            <Link className="btn btn--primary hide-mobile" href="/services">
              Full price list
            </Link>
          </div>
          <div className="price-stack">
            <PriceCard group={popular} />
            <div className="plans">
              <p className="label">Monthly plans</p>
              <div className="plans__grid">
                {monthlyPlans.map((p) => (
                  <div className="plan" key={p.name}>
                    <span>{p.name}</span>
                    <strong>{rand(p.price)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <Link className="text-link only-mobile" href="/services">
              See the full price list <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">How it works</p>
            <h2>Booking takes a minute</h2>
          </div>
          <ol className="steps">
            <li>
              <strong>Tell us what needs cleaning</strong>
              <p>Book online or send us a WhatsApp.</p>
            </li>
            <li>
              <strong>Get your price and a time</strong>
              <p>Including the callout fee. No surprises.</p>
            </li>
            <li>
              <strong>Enjoy your clean space</strong>
              <p>Pay via {business.payment}.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--navy">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Cleaner homes, brighter futures</p>
            <h2>Every booking creates work for students</h2>
            <p className="lede">
              Students who are willing to work earn with us, and get paid the same day. Your clean helps someone
              through their studies.
            </p>
            <Link className="btn btn--ghost" href="/about">
              Our story
            </Link>
          </div>
        </div>
      </section>

      <CtaSection
        title="Ready for a cleaner space?"
        lede="Tell us what needs cleaning and where. We'll reply with a price and a time."
      />
    </>
  );
}
