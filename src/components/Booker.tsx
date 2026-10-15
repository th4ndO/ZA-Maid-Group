"use client";

import { useMemo, useState } from "react";
import {
  booking,
  business,
  calloutFees,
  firstCleanOffer,
  monthlyPlans,
  priceGroups,
  rand,
  whatsappLink,
} from "@/content/site";
import { CalendarIcon, CheckIcon, MailIcon, WhatsAppIcon } from "./icons";

// Online booking *request*. Visitors build their clean from the real price list, pick a
// day and a time window, and send it to ZA Maid on WhatsApp (or email). There is no
// live availability: ZA Maid confirms every booking. Nothing is stored on the site.

type Item = {
  id: string;
  group: string;
  name: string;
  price: number;
  kind: "count" | "sqm";
  max?: number;
  note?: string;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const items: Item[] = [
  ...priceGroups.flatMap((g) =>
    g.items.map<Item>((i) => ({
      id: `${g.id}:${slug(i.name)}`,
      group: g.title,
      name: i.name,
      price: i.price,
      kind: i.name.toLowerCase().includes("per square metre") ? "sqm" : "count",
      note: g.id === "mattress-cleaning" ? "per side" : undefined,
    })),
  ),
  ...monthlyPlans.map<Item>((p) => ({
    id: `plan:${slug(p.name)}`,
    group: "Monthly plans",
    name: p.name,
    price: p.price,
    kind: "count",
    max: 1,
    note: "per month",
  })),
];
const groups = Array.from(new Set(items.map((i) => i.group)));

// Carpet per m²: "R100 base price for carpets smaller than 9 square metres."
function lineTotal(item: Item, qty: number) {
  if (item.kind === "sqm") return qty <= 0 ? 0 : qty < 9 ? 100 : item.price * qty;
  return item.price * qty;
}

const STEPS = ["What", "Where", "When", "You"] as const;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
const longDate = (d: Date) =>
  d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export function Booker() {
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [callout, setCallout] = useState<number | null>(null);
  const [area, setArea] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [firstClean, setFirstClean] = useState(false);
  const [sent, setSent] = useState<null | "whatsapp" | "email">(null);
  const [tried, setTried] = useState(false);

  const chosen = items.filter((i) => (qty[i.id] ?? 0) > 0);
  const subtotal = chosen.reduce((sum, i) => sum + lineTotal(i, qty[i.id]), 0);
  const fee = callout === null ? null : calloutFees[callout];
  const discount = firstClean && firstCleanOffer.enabled ? Math.round((subtotal * firstCleanOffer.percent) / 100) : 0;
  const total = subtotal - discount + (fee?.price ?? 0);
  const timeLabel = booking.timeWindows.find((t) => t.id === time);

  const stepValid = [
    chosen.length > 0,
    callout !== null && area.trim().length > 1,
    date !== null && time !== null,
    name.trim().length > 1,
  ];

  const change = (item: Item, delta: number) =>
    setQty((q) => {
      const next = Math.max(0, Math.min(item.max ?? 999, (q[item.id] ?? 0) + delta));
      return { ...q, [item.id]: next };
    });

  const next = () => {
    if (!stepValid[step]) {
      setTried(true);
      return;
    }
    setTried(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    document.getElementById("booker")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const back = () => {
    setTried(false);
    setStep((s) => Math.max(0, s - 1));
  };

  function message() {
    const lines = [
      "Hi ZA Maid Group, I'd like to book a clean.",
      "",
      `Date: ${date ? longDate(date) : "-"}${timeLabel ? `, ${timeLabel.label.toLowerCase()}` : ""}`,
      `Where: ${area.trim()}${fee ? ` (${fee.label}${fee.detail ? `, ${fee.detail}` : ""})` : ""}`,
      "",
      "Services:",
      ...chosen.map((i) =>
        i.kind === "sqm"
          ? `• ${i.name}: ${qty[i.id]} m² – ${rand(lineTotal(i, qty[i.id]))}`
          : `• ${qty[i.id]} × ${i.name}${i.note ? ` (${i.note})` : ""} – ${rand(lineTotal(i, qty[i.id]))}`,
      ),
      "",
      `Callout fee: ${fee ? (fee.price === null ? "to be quoted" : rand(fee.price)) : "-"}`,
    ];
    if (discount) lines.push(`First clean ${firstCleanOffer.percent}% off: -${rand(discount)}`);
    lines.push(`Estimated total: ${rand(total)}${fee?.price === null ? " + travel" : ""}`, "", `Name: ${name.trim()}`);
    if (notes.trim()) lines.push(`Notes: ${notes.trim()}`);
    return lines.join("\n");
  }

  function send(via: "whatsapp" | "email") {
    if (!stepValid.every(Boolean)) {
      setTried(true);
      return;
    }
    const text = message();
    if (via === "email") {
      window.location.href = `mailto:${business.email}?subject=${encodeURIComponent("Booking request")}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(whatsappLink(text), "_blank", "noopener");
    }
    setSent(via);
  }

  return (
    <div className="booker" id="booker" data-step={step}>
      <ol className="booker__progress" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <li key={label} data-state={i < step ? "done" : i === step ? "current" : "todo"}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i >= step}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="booker__dot">{i < step ? <CheckIcon /> : i + 1}</span>
              <span className="booker__step-label">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="booker__body">
        <div className="booker__panel">
          {step === 0 && (
            <section aria-labelledby="b-what">
              <h3 id="b-what">What needs cleaning?</h3>
              <p className="booker__hint">Add everything you need. Prices are from our price list.</p>
              {groups.map((g, gi) => {
                const groupItems = items.filter((i) => i.group === g);
                const count = groupItems.filter((i) => (qty[i.id] ?? 0) > 0).length;
                return (
                  <details key={g} className="booker__group" open={gi === 0}>
                    <summary>
                      <span>{g}</span>
                      {count > 0 && <span className="booker__badge">{count}</span>}
                    </summary>
                    <ul>
                      {groupItems.map((item) => {
                        const n = qty[item.id] ?? 0;
                        return (
                          <li key={item.id} data-selected={n > 0}>
                            <div className="booker__item">
                              <span className="booker__item-name">{item.name}</span>
                              <span className="booker__item-price">
                                {item.kind === "sqm" ? `${rand(item.price)} / m²` : rand(item.price)}
                                {item.note ? <small> {item.note}</small> : null}
                              </span>
                            </div>
                            {n === 0 ? (
                              <button type="button" className="booker__add" onClick={() => change(item, 1)}>
                                Add<span className="visually-hidden"> {item.name}</span>
                              </button>
                            ) : (
                              <div className="booker__stepper">
                                <button type="button" onClick={() => change(item, -1)} aria-label={`Less ${item.name}`}>
                                  −
                                </button>
                                <output aria-live="polite">
                                  {n}
                                  {item.kind === "sqm" ? " m²" : ""}
                                </output>
                                <button
                                  type="button"
                                  onClick={() => change(item, 1)}
                                  disabled={n >= (item.max ?? 999)}
                                  aria-label={`More ${item.name}`}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                );
              })}
              {tried && !stepValid[0] && <p className="booker__error">Add at least one service to continue.</p>}
            </section>
          )}

          {step === 1 && (
            <section aria-labelledby="b-where">
              <h3 id="b-where">Where are we cleaning?</h3>
              <p className="booker__hint">This sets the callout fee, charged once per visit.</p>
              <div className="booker__options" role="radiogroup" aria-label="Distance from Hatfield">
                {calloutFees.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    role="radio"
                    aria-checked={callout === i}
                    className="booker__option"
                    onClick={() => setCallout(i)}
                  >
                    <span>
                      {c.label}
                      {c.detail ? <small>{c.detail}</small> : null}
                    </span>
                    <strong>{c.price === null ? "Quoted" : rand(c.price)}</strong>
                  </button>
                ))}
              </div>
              <div className="field">
                <label htmlFor="b-area">Suburb, street or building</label>
                <input
                  id="b-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  autoComplete="street-address"
                  placeholder="e.g. Hatfield, Burnett Street"
                />
              </div>
              {tried && !stepValid[1] && (
                <p className="booker__error">Choose a distance and tell us the suburb or building.</p>
              )}
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="b-when">
              <h3 id="b-when">When suits you?</h3>
              <p className="booker__hint">Pick a day and a time. We&apos;ll confirm it on WhatsApp.</p>
              <MonthCalendar value={date} onChange={setDate} />
              <div className="booker__options booker__options--3" role="radiogroup" aria-label="Time of day">
                {booking.timeWindows.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={time === t.id}
                    className="booker__option booker__option--stack"
                    onClick={() => setTime(t.id)}
                  >
                    <strong>{t.label}</strong>
                    <small>{t.detail}</small>
                  </button>
                ))}
              </div>
              {tried && !stepValid[2] && <p className="booker__error">Pick a day and a time to continue.</p>}
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="b-you">
              <h3 id="b-you">Almost done</h3>
              <div className="field">
                <label htmlFor="b-name">Your name</label>
                <input id="b-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="b-notes">
                  Anything we should know? <span className="hint">(optional)</span>
                </label>
                <textarea
                  id="b-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. pets at home, gate code, parking"
                />
              </div>
              {firstCleanOffer.enabled && (
                <label className="booker__check">
                  <input type="checkbox" checked={firstClean} onChange={(e) => setFirstClean(e.target.checked)} />
                  <span>
                    This is my first clean with ZA Maid ({firstCleanOffer.percent}% off)
                  </span>
                </label>
              )}
              {tried && !stepValid[3] && <p className="booker__error">Please add your name.</p>}
              <div className="booker__send">
                <button type="button" className="btn btn--primary" onClick={() => send("whatsapp")}>
                  <WhatsAppIcon /> Send booking on WhatsApp
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => send("email")}>
                  <MailIcon /> Send by email
                </button>
              </div>
              <p className="form__note" aria-live="polite">
                {sent
                  ? `Your ${sent === "whatsapp" ? "WhatsApp" : "email app"} should have opened with your booking. Just press send there. We'll confirm the time and final price.`
                  : "This is a booking request. We'll confirm the time and final price with you before the clean."}
              </p>
            </section>
          )}
        </div>

        <aside className="booker__summary" aria-label="Your booking">
          <p className="label">Your booking</p>
          {chosen.length === 0 ? (
            <p className="booker__empty">Nothing added yet.</p>
          ) : (
            <ul className="booker__lines">
              {chosen.map((i) => (
                <li key={i.id}>
                  <span>
                    {i.kind === "sqm" ? `${i.name} (${qty[i.id]} m²)` : `${qty[i.id]} × ${i.name}`}
                  </span>
                  <span>{rand(lineTotal(i, qty[i.id]))}</span>
                </li>
              ))}
              {fee && (
                <li>
                  <span>Callout fee</span>
                  <span>{fee.price === null ? "Quoted" : rand(fee.price)}</span>
                </li>
              )}
              {discount > 0 && (
                <li>
                  <span>First clean −{firstCleanOffer.percent}%</span>
                  <span>−{rand(discount)}</span>
                </li>
              )}
            </ul>
          )}
          {date && (
            <p className="booker__when">
              <CalendarIcon /> {longDate(date)}
              {timeLabel ? `, ${timeLabel.label.toLowerCase()}` : ""}
            </p>
          )}
          <p className="booker__total">
            <span>Estimate</span>
            <strong>
              {rand(total)}
              {fee?.price === null ? " + travel" : ""}
            </strong>
          </p>
        </aside>
      </div>

      <div className="booker__bar">
        <div className="booker__bar-total">
          <small>Estimate</small>
          <strong>{rand(total)}</strong>
        </div>
        <div className="booker__bar-actions">
          {step > 0 && (
            <button type="button" className="btn btn--ghost" onClick={back}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button type="button" className="btn btn--primary" onClick={next}>
              Next: {STEPS[step + 1]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthCalendar({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  // Rendered only after the visitor reaches this step, so "today" is the visitor's today
  // (the page itself is pre-built and would otherwise carry the build date).
  const today = useMemo(() => startOfDay(new Date()), []);
  const first = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), [today]);
  const last = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + booking.daysAhead),
    [today],
  );
  const [month, setMonth] = useState(() => new Date((value ?? first).getFullYear(), (value ?? first).getMonth(), 1));

  const cells = useMemo(() => {
    const lead = (month.getDay() + 6) % 7; // Monday first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    ];
  }, [month]);

  const canPrev = month > new Date(first.getFullYear(), first.getMonth(), 1);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= last;
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  return (
    <div className="cal">
      <div className="cal__head">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">
          ‹
        </button>
        <strong aria-live="polite">{month.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}</strong>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="cal__grid" role="grid">
        {WEEKDAYS.map((d) => (
          <span key={d} className="cal__wd" aria-hidden>
            {d[0]}
          </span>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              type="button"
              className="cal__day"
              disabled={d < first || d > last || booking.closedWeekdays.includes(d.getDay())}
              aria-pressed={value ? sameDay(d, value) : false}
              aria-label={longDate(d)}
              onClick={() => onChange(d)}
            >
              {d.getDate()}
            </button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}
