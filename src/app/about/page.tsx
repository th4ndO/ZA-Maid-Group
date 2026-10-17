import type { Metadata } from "next";
import { CtaSection, PageHead, Placeholder } from "@/components/bits";
import { business, founderStory, highlights } from "@/content/site";

export const metadata: Metadata = {
  title: "About us",
  description:
    "ZA Maid Group was started in 2026 in Hatfield by Zinhle Mdluli. We clean homes, apartments and offices anywhere in Pretoria, and give students same-day paid work.",
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
            <blockquote className="story">
              {founderStory.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
              <footer>
                <strong>{business.founder}</strong>
                <span>Founder, ZA Maid Group</span>
              </footer>
            </blockquote>
          </div>
          <div>
            <Placeholder photo title={`photo of ${business.founder} or the team`}>
              Bright, natural light. Real people in a real space.
            </Placeholder>
          </div>
        </div>
      </section>

      <section className="section section--navy">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Cleaner homes, brighter futures</p>
            <h2>Work for students, care for your space</h2>
            <p className="lede">
              We give students who are willing to work the chance to earn, and they get paid the same day. You get a
              careful cleaner, and your booking helps someone through their studies.
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
