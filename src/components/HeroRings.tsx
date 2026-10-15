"use client";

import { useEffect, useRef } from "react";

// Decorative rings in the hero (from the brand's social post). They drift with the
// cursor at different depths and light up on hover. Mouse/trackpad only; skipped
// when the visitor prefers reduced motion.
export function HeroRings() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const hero = layer?.parentElement;
    if (!layer || !hero) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rings = Array.from(layer.querySelectorAll<HTMLElement>(".ring"));
    let frame = 0;
    let x = 0;
    let y = 0;
    let cx = -9999;
    let cy = -9999;

    const apply = () => {
      frame = 0;
      layer.style.setProperty("--mx", x.toFixed(3));
      layer.style.setProperty("--my", y.toFixed(3));
      layer.style.setProperty("--px", `${cx}px`);
      layer.style.setProperty("--py", `${cy}px`);
      // A ring "hovers" when the cursor is close to its line, not anywhere inside it,
      // so the rings never block clicks on the content above them.
      for (const ring of rings) {
        const b = ring.getBoundingClientRect();
        const d = Math.hypot(cx + heroLeft - (b.left + b.width / 2), cy + heroTop - (b.top + b.height / 2));
        ring.toggleAttribute("data-near", Math.abs(d - b.width / 2) < 36);
      }
    };
    let heroLeft = 0;
    let heroTop = 0;
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      heroLeft = r.left;
      heroTop = r.top;
      cx = e.clientX - r.left;
      cy = e.clientY - r.top;
      x = cx / r.width - 0.5;
      y = cy / r.height - 0.5;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      cx = -9999;
      cy = -9999;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="hero-rings" aria-hidden>
      <span className="hero-glow" />
      <span className="ring ring--1" />
      <span className="ring ring--2" />
      <span className="ring ring--3" />
    </div>
  );
}
