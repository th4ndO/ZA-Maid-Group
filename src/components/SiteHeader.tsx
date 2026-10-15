"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/content/site";
import { CloseIcon, MenuIcon } from "./icons";

export function SiteHeader() {
  const pathname = usePathname();
  // Remember which page the mobile menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (fn: (v: boolean) => boolean) => setOpenOn(fn(open) ? pathname : null);

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="site-header__logo" aria-label="ZA Maid Group, home">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG, no optimisation needed */}
          <img src="/brand/logo-horizontal-navy.svg" alt="" width={3340} height={565} />
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
          <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
        </button>
        <nav id="site-nav" className="site-nav" data-open={open} aria-label="Main">
          {nav.map((item) => {
            const isCta = item.href === "/contact";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isCta ? "site-nav__cta" : undefined}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
