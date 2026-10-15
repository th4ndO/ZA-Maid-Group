import type { Metadata } from "next";
import { CtaSection, PageHead, Placeholder } from "@/components/bits";
import { business, highlights } from "@/content/site";

export const metadata: Metadata = {
  title: "About us",
  description:
    "ZA Maid Group is a cleaning company in Hatfield, Pretoria, looking after homes, apartments and offices and creating work for students along the way.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHead
        label="About us"
        title="Who we are"
        lede="A cleaning company in Hatfield, Pretoria, looking after homes, apartments and offices, and creating work for students along the way."
      />

      <section className="section">
        <div className="wrap split">
          <div>
            <p className="label">Our story</p>
            <h2>Your space. Our priority.</h2>
            <p className="lede">
              We think a clean space should feel calm, fresh and well organised. That&apos;s what we leave behind
              after every visit, whether it&apos;s a student flat, a family home or an office.
            </p>
            <Placeholder title="founder's story">
              2–3 short paragraphs from {business.founder}: why ZA Maid Group started, when, and what
              matters most about the work.
            </Placeholder>
          </div>
          <div>
            <Placeholder photo title={`photo of ${business.founder} or the team`}>
              Bright, natural light. Real people in a real space.
            </Placeholder>
            <p className="label" style={{ marginTop: 20 }}>
              Founder
            </p>
            <h3>{business.founder}</h3>
          </div>
        </div>
      </section>

      <section className="section section--navy">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Cleaner homes, brighter futures</p>
            <h2>Work for students, care for your space</h2>
            <p className="lede">
              Hatfield is a student neighbourhood, and we create work for students along the way. You get a careful,
              trained cleaner, and your booking helps someone through their studies.
            </p>
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

      <CtaSection title="We Got You!" lede="Tell us what needs cleaning and we'll take it from there." />
    </>
  );
}
