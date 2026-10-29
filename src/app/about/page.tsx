import type { Metadata } from "next";
import Image from "next/image";
import { CtaSection, PageHead } from "@/components/bits";
import { business, founderStory, highlights, team } from "@/content/site";
import { initials, teamPhotos as photos } from "@/content/team-photos";

export const metadata: Metadata = {
  title: "About us: Hatfield cleaners",
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
        <div className="wrap prose">
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
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Meet the team</p>
            <h2>The people in your space</h2>
          </div>
          <ul className="team">
            {team.map((m) => {
              const photo = m.photo ? photos[m.photo] : undefined;
              return (
                <li key={m.name}>
                  {photo ? (
                    <Image src={photo} alt={`${m.name}, ${m.role}`} sizes="(min-width: 640px) 156px, 30vw" placeholder="blur" />
                  ) : (
                    <span className="team__initials" aria-hidden="true">
                      {initials(m.name)}
                    </span>
                  )}
                  <strong>{m.name}</strong>
                  <span>{m.role}</span>
                </li>
              );
            })}
          </ul>
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
