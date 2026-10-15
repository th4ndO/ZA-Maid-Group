import Link from "next/link";
import { business, nav, whatsappLink } from "@/content/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__grid">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
            <img
              className="site-footer__logo"
              src="/brand/logo-horizontal-white.svg"
              alt="ZA Maid Group. Spotless, reliable, trusted."
              width={3340}
              height={565}
              loading="lazy"
              decoding="async"
            />
            <p>
              Cleaning for homes, apartments and offices in {business.suburb}, {business.city}, and
              work for students along the way.
            </p>
          </div>
          <div>
            <h2>Pages</h2>
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Get in touch</h2>
            <ul>
              <li>
                <a href={whatsappLink()}>WhatsApp {business.phoneDisplay}</a>
              </li>
              <li>
                <a href={`tel:${business.phoneIntl}`}>Call {business.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </li>
              <li>
                {business.suburb}, {business.city}
              </li>
              {business.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="site-footer__base">
          <span>
            © {year} {business.name}. <span className="site-footer__tagline">{business.tagline}</span>
          </span>
          <span>
            Website by{" "}
            <a href="https://www.instagram.com/profound_productionss/" target="_blank" rel="noopener">
              Profound Productions
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
