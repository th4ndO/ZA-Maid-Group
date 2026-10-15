import Link from "next/link";
import type { ReactNode } from "react";
import { business, firstCleanOffer, rand, whatsappLink, type PriceGroup } from "@/content/site";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href={whatsappLink("Hi ZA Maid Group, I'd like a quote for a clean.")}
      aria-label={`WhatsApp ZA Maid Group on ${business.phoneDisplay}`}
    >
      <WhatsAppIcon />
      <span>WhatsApp us</span>
    </a>
  );
}

// Visible marker for content the client still has to supply. Search the code for
// <Placeholder to find every gap before launch.
export function Placeholder({ title, children, photo }: { title: string; children?: ReactNode; photo?: boolean }) {
  return (
    <div className={photo ? "placeholder placeholder--photo" : "placeholder"} role="note">
      <strong>To add: {title}</strong>
      {children}
    </div>
  );
}

export function PageHead({ label, title, lede }: { label: string; title: string; lede?: ReactNode }) {
  return (
    <section className="page-head">
      <div className="wrap">
        <p className="label">{label}</p>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
    </section>
  );
}

export function PriceCard({ group, headingLevel = 3 }: { group: PriceGroup; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="card price-card" id={group.id}>
      <Heading>{group.title}</Heading>
      <ul className="price-list">
        {group.items.map((item) => (
          <li key={item.name}>
            <span>{item.name}</span>
            <span className="price">{rand(item.price)}</span>
          </li>
        ))}
      </ul>
      {group.note ? <p className="price-note">{group.note}</p> : null}
    </div>
  );
}

export function OfferBadge() {
  if (!firstCleanOffer.enabled) return null;
  return (
    <p className="offer-badge">
      <strong>{firstCleanOffer.percent}%</strong>
      <span>
        off your
        <br />
        first clean
      </span>
    </p>
  );
}

// Compact version of the offer for phones, where the big circle would crowd the hero.
export function OfferPill() {
  if (!firstCleanOffer.enabled) return null;
  return (
    <p className="offer-pill">
      <strong>{firstCleanOffer.percent}% off</strong> your first clean
    </p>
  );
}

export function CtaSection({ title, lede }: { title: string; lede: string }) {
  return (
    <section className="section section--mist">
      <div className="wrap cta">
        <p className="label">{business.slogan}</p>
        <h2>{title}</h2>
        <p className="lede">{lede}</p>
        <div className="btn-row">
          <a className="btn btn--primary" href={whatsappLink("Hi ZA Maid Group, I'd like a quote for a clean.")}>
            <WhatsAppIcon /> WhatsApp {business.phoneDisplay}
          </a>
          <Link className="btn btn--ghost" href="/contact">
            Book online
          </Link>
        </div>
      </div>
    </section>
  );
}
