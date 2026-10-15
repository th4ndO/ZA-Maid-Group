import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap cta">
        <p className="label">Page not found</p>
        <h1>This corner is already clean</h1>
        <p className="lede">We couldn&apos;t find that page. Try the home page or our price list.</p>
        <div className="btn-row">
          <Link className="btn btn--primary" href="/">
            Home
          </Link>
          <Link className="btn btn--ghost" href="/services">
            Services & prices
          </Link>
        </div>
      </div>
    </section>
  );
}
