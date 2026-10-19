import type { Metadata } from "next";
import Image from "next/image";
import { CtaSection, PageHead } from "@/components/bits";
import amahle from "@/assets/team-amahle-mbali-zibane.jpg";
import mvuni from "@/assets/team-mvuni-mdoka.jpg";
import precious from "@/assets/team-precious-musuamba-mujanay.jpg";
import zoleka from "@/assets/team-zoleka-kene.jpg";
import zinhle from "@/assets/team-zinhle-mdluli.jpg";
import { business, founderStory, highlights, team, type TeamPhoto } from "@/content/site";

// Headshots are square, cropped with scripts/headshot.py so faces line up.
const photos: Record<TeamPhoto, typeof zinhle> = { zinhle, precious, amahle, zoleka, mvuni };

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

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
