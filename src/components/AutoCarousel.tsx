"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

const INTERVAL = 3500; // ms between slides
const RESUME_AFTER = 6000; // ms after the visitor last touched it

// On phones the cards sit in a horizontal row (see .carousel in globals.css). This
// moves the row on its own so visitors can see there's more, shows dots for where
// they are, and pauses while they're touching it, when it's off screen, or when they
// prefer reduced motion. From tablet up the row is a normal grid and nothing moves.
export function AutoCarousel({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const slideTo = (i: number) => {
    const el = ref.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: "smooth" });
  };

  // Track which card is in view, for the dots.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cards = Array.from(el.children) as HTMLElement[];
        const left = el.scrollLeft;
        let best = 0;
        cards.forEach((c, i) => {
          if (Math.abs(c.offsetLeft - left) < Math.abs(cards[best].offsetLeft - left)) best = i;
        });
        // At the very end the last card may never reach the left edge.
        if (left + el.clientWidth >= el.scrollWidth - 4) best = cards.length - 1;
        setActive(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Autoplay.
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    let pausedUntil = 0;
    const pause = () => (pausedUntil = Date.now() + RESUME_AFTER);
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.5 });
    observer.observe(el);
    el.addEventListener("pointerdown", pause, { passive: true });
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("focusin", pause);

    const timer = window.setInterval(() => {
      const scrollable = el.scrollWidth > el.clientWidth + 4;
      if (!scrollable || !visible || document.hidden || Date.now() < pausedUntil) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      const cards = Array.from(el.children) as HTMLElement[];
      const pad = parseFloat(getComputedStyle(el).paddingLeft);
      // The next card is the first one starting to the right of the current snap point.
      const next = atEnd ? 0 : cards.findIndex((c) => c.offsetLeft - pad > el.scrollLeft + 8);
      const card = cards[next === -1 ? 0 : next];
      el.scrollTo({ left: card.offsetLeft - pad, behavior: "smooth" });
    }, INTERVAL);

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("focusin", pause);
    };
  }, []);

  return (
    <div className="carousel-wrap">
      <div ref={ref} className={`carousel ${className ?? ""}`} role="region" aria-label={label}>
        {children}
      </div>
      <div className="carousel-dots" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" tabIndex={-1} data-active={i === active} onClick={() => slideTo(i)} />
        ))}
      </div>
    </div>
  );
}
