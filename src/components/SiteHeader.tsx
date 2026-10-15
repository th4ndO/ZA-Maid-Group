"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { business, nav, whatsappLink } from "@/content/site";
import {
  CalendarIcon,
  ChevronIcon,
  CloseIcon,
  HelpIcon,
  HomeIcon,
  MenuIcon,
  PhoneIcon,
  TagIcon,
  UsersIcon,
  WhatsAppIcon,
} from "./icons";

const navIcons: Record<string, ComponentType<{ className?: string }>> = {
  "/": HomeIcon,
  "/services": TagIcon,
  "/about": UsersIcon,
  "/faq": HelpIcon,
  "/contact": CalendarIcon,
};

export function SiteHeader() {
  const pathname = usePathname();
  // Remember which page the mobile menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const toggle = () => setOpenOn(open ? null : pathname);

  // Full-screen menu: stop the page behind it from scrolling, and close on Escape.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="site-header" data-menu-open={open}>
      <div className="wrap site-header__inner">
        <Link href="/" className="site-header__logo" aria-label="ZA Maid Group, home">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG, no optimisation needed */}
          <img src="/brand/logo-horizontal-navy.svg" alt="" width={3340} height={565} fetchPriority="high" />
        </Link>
        <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-nav" onClick={toggle}>
          {open ? <CloseIcon /> : <MenuIcon />}
          <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
        </button>
        <nav id="site-nav" className="site-nav" data-open={open} aria-label="Main">
          <div className="site-nav__links">
            {nav.map((item) => {
              const Icon = navIcons[item.href];
              const isCta = item.href === "/contact";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isCta ? "site-nav__cta" : undefined}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {Icon ? <Icon className="site-nav__icon" /> : null}
                  <span>{item.label}</span>
                  <ChevronIcon className="site-nav__chevron" />
                </Link>
              );
            })}
          </div>
          <div className="site-nav__contact">
            <a className="btn btn--primary" href={whatsappLink("Hi ZA Maid Group, I'd like a quote for a clean.")}>
              <WhatsAppIcon /> WhatsApp {business.phoneDisplay}
            </a>
            <a className="btn btn--ghost" href={`tel:${business.phoneIntl}`}>
              <PhoneIcon /> Call us
            </a>
            <p>{business.tagline}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
