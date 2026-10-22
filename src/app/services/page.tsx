import type { Metadata } from "next";
import Image from "next/image";
import finishedBathroom from "@/assets/work/finished-bathroom.jpg";
import finishedKitchen from "@/assets/work/finished-kitchen.jpg";
import finishedShower from "@/assets/work/finished-shower.jpg";
import { AutoCarousel } from "@/components/AutoCarousel";
import { CtaSection, PageHead, PriceCard } from "@/components/bits";
import {
  business,
  calloutFees,
  calloutNote,
  finishedClean,
  monthlyPlanNote,
  monthlyPlans,
  priceGroups,
  rand,
  services,
  type FinishedPhoto,
} from "@/content/site";

const finishedPhotos: Record<FinishedPhoto, typeof finishedKitchen> = {
  kitchen: finishedKitchen,
  bathroom: finishedBathroom,
  shower: finishedShower,
};

export const metadata: Metadata = {
  title: "Cleaning services & prices in Pretoria",
  description:
    "ZA Maid Group price list: home cleans from R200, couches, mattresses, carpets, move-in/out cleans and monthly deep-clean plans. Hatfield, Pretoria.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const [home, couches, mattress, carpet] = priceGroups;

  return (
    <>
      <PageHead
        label="Services & prices"
        title="Clear prices for every clean"
        lede={`Homes, apartments and offices anywhere in ${business.city}. Pay via ${business.payment}.`}
      />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">What we do</p>
            <h2>Our services</h2>
          </div>
          <AutoCarousel className="grid grid--3" label="Our services">
            {services.map((s) => (
              <article key={s.slug} className="card card--band">
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
            <p className="label">Recent work</p>
            <h2>Spotless, down to the details</h2>
            <p className="lede">A recent full clean, finished with the ZA Maid checklist.</p>
          </div>
          <AutoCarousel className="grid grid--3 ba-row" label="Photos of a finished clean">
            {finishedClean.map((f) => (
              <figure key={f.photo} className="ba">
                <div className="ba__img">
                  <Image src={finishedPhotos[f.photo]} alt={f.alt} sizes="(min-width: 640px) 360px, 88vw" placeholder="blur" />
                </div>
                <figcaption>{f.title}</figcaption>
              </figure>
            ))}
          </AutoCarousel>
        </div>
      </section>

      <section className="section section--mist" aria-labelledby="price-list">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Price list</p>
            <h2 id="price-list">What it costs</h2>
            <p className="lede">Prices are per item or per clean. A callout fee is added once per visit.</p>
          </div>

          <div className="grid grid--2">
            <PriceCard group={home} />
            <div className="price-stack">
              <PriceCard group={couches} />
              <PriceCard group={mattress} />
            </div>
          </div>

          <div className="plans section-foot" id="monthly-plans">
            <p className="label">Monthly plans</p>
            <div className="plans__grid">
              {monthlyPlans.map((p) => (
                <div className="plan" key={p.name}>
                  <span>{p.name}</span>
                  <strong>{rand(p.price)}</strong>
                </div>
              ))}
            </div>
            <p>{monthlyPlanNote}</p>
          </div>

          <div className="section-foot">
            <PriceCard group={carpet} />
          </div>

          <div className="card section-foot" id="callout-fee">
            <div className="price-card">
              <h3>Callout fee · all services</h3>
            </div>
            <ol className="callout">
              {calloutFees.map((c) => (
                <li key={c.label}>
                  <strong>{c.price === null ? "Quoted" : rand(c.price)}</strong>
                  <span>
                    {c.label}
                    {c.detail ? `, ${c.detail}` : ""}
                  </span>
                </li>
              ))}
            </ol>
            <p className="price-note">{calloutNote}</p>
          </div>
        </div>
      </section>

      <CtaSection
        title="Need something that isn't listed?"
        lede="Tell us about your space and we'll put together a custom package."
      />
    </>
  );
}
