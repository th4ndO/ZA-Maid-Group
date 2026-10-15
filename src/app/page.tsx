import Link from "next/link";
import { CtaSection, OfferBadge, Placeholder, PriceCard } from "@/components/bits";
import { WhatsAppIcon } from "@/components/icons";
import { business, highlights, monthlyPlans, priceGroups, rand, services, whatsappLink } from "@/content/site";

export default function Home() {
  const homeCleaning = priceGroups.find((g) => g.id === "home-cleaning")!;
  const popular = { ...homeCleaning, items: homeCleaning.items.slice(0, 4), title: "Popular home cleans" };

  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div>
            <p className="label">Cleaning services · {business.suburb}, {business.city}</p>
            <h1>
              Your space. <span className="accent">Our priority.</span>
            </h1>
            <p className="lede">
              Calm, careful cleaning for homes, apartments and offices, with real prices up front.
            </p>
            <ul className="chips" aria-label="Our services">
              {services.map((s) => (
                <li key={s.slug}>{s.title}</li>
              ))}
            </ul>
            <div className="btn-row">
              <a className="btn btn--primary" href={whatsappLink("Hi ZA Maid Group, I'd like a quote for a clean.")}>
                <WhatsAppIcon /> Get a quote on WhatsApp
              </a>
              <Link className="btn btn--ghost" href="/services">
                See our prices
              </Link>
            </div>
          </div>
          <div className="hero__aside">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
            <img className="hero__logo" src="/brand/logo-primary-white.svg" alt="" width={1145} height={670} />
            <OfferBadge />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">{business.slogan}</p>
            <h2>Why people choose ZA Maid</h2>
          </div>
          <ul className="ticks">
            {highlights.map((h) => (
              <li key={h.title}>
                <strong>{h.title}</strong>
                <p>{h.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap">
          <div className="section-head">
            <p className="label">What we do</p>
            <h2>Cleaning for every kind of space</h2>
            <p className="lede">From a quick shower clean to a full move-out, we&apos;ll do one room or the whole place.</p>
          </div>
          <div className="grid grid--3">
            {services.map((s, i) => (
              <article key={s.slug} className="card card--band">
                <p className="card__num">{String(i + 1).padStart(2, "0")}</p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
            <article className="card card--band">
              <p className="card__num">06</p>
              <h3>Not sure what you need?</h3>
              <p>
                Send us a WhatsApp with a few photos of the space and we&apos;ll tell you what we&apos;d suggest and
                what it costs.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split split--wide-left">
          <div>
            <p className="label">Real prices, no surprises</p>
            <h2>Know what you&apos;ll pay before we arrive</h2>
            <p className="lede">
              Every price is on our price list, from a R69 shower clean to monthly deep-clean plans. You pay a
              once-off callout fee per visit based on distance, and you can pay via {business.payment}.
            </p>
            <div className="btn-row">
              <Link className="btn btn--primary" href="/services">
                Full price list
              </Link>
            </div>
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
          </div>
        </div>
      </section>

      <section className="section section--mist">
        <div className="wrap">
          <div className="section-head">
            <p className="label">How it works</p>
            <h2>Booking takes a minute</h2>
          </div>
          <ol className="steps">
            <li>
              <strong>Tell us about your space</strong>
              <p>WhatsApp us or fill in the quote form with the rooms you need cleaned and where you are.</p>
            </li>
            <li>
              <strong>Get your price and a time</strong>
              <p>We confirm the total, including the callout fee, and a time that suits you.</p>
            </li>
            <li>
              <strong>Come home to a clean space</strong>
              <p>We clean, you check, and you pay via {business.payment}.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--navy">
        <div className="wrap split">
          <div>
            <p className="label">Cleaner homes, brighter futures</p>
            <h2>Every booking creates work for students</h2>
            <p className="lede">
              ZA Maid Group is based in {business.suburb}, and we create work for students along the way. Every clean
              you book helps someone through their studies.
            </p>
            <Link className="btn btn--ghost" href="/about">
              Our story
            </Link>
          </div>
          <Placeholder photo title="team photo">
            Real people, real spaces, in bright natural light (Brand Guide §07).
          </Placeholder>
        </div>
      </section>

      <CtaSection
        title="Ready for a cleaner space?"
        lede="Send us a message with what you need cleaned and where. We'll reply with a price and a time."
      />
    </>
  );
}
