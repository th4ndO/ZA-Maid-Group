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
import { calloutIndexFor, mapsLink, reverseLookup, roadKmFromBase, searchAddress, type Place } from "@/lib/address";
import { claimFirstClean, displayMobile, normaliseSaMobile, type ClaimResult } from "@/lib/discount";
import { CalendarIcon, CheckIcon, MailIcon, PinIcon, WhatsAppIcon } from "./icons";

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
  const [callout, setCallout] = useState<number | null>(null); // only used if the address check is down
  const [area, setArea] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [results, setResults] = useState<Place[] | null>(null);
  const [lookup, setLookup] = useState<"idle" | "busy" | "none" | "error">("idle");
  const [sameBuilding, setSameBuilding] = useState(false);
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  // Step 3: "slots" = Zinhle's Google booking page, "custom" = a day + exact start time we confirm.
  const [whenMode, setWhenMode] = useState<"slots" | "custom">("slots");
  const [customTime, setCustomTime] = useState("");
  const [booked, setBooked] = useState(false); // ticked after picking a slot on Google's page
  const google = booking.googleBookingUrl;
  // Short calendar.app.google links redirect to a page Google may not allow inside another
  // site, so they open in a new tab; full calendar.google.com links (embed mode) show inline.
  const embeddable = google?.startsWith("https://calendar.google.com/") ?? false;
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [firstClean, setFirstClean] = useState(false);
  const [phone, setPhone] = useState("");
  const [claim, setClaim] = useState<ClaimResult | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "whatsapp" | "email">(null);
  const [tried, setTried] = useState(false);

  const chosen = items.filter((i) => (qty[i.id] ?? 0) > 0);
  const subtotal = chosen.reduce((sum, i) => sum + lineTotal(i, qty[i.id]), 0);
  // With a verified address the callout band is worked out, not chosen. If the lookup
  // service is down, the visitor picks a band and the booking is marked "not verified".
  const placeIndex = place ? calloutIndexFor(place) : null;
  const calloutIndex = placeIndex !== null ? (sameBuilding && placeIndex === 1 ? 0 : placeIndex) : lookup === "error" ? callout : null;
  const fee = calloutIndex === null ? null : calloutFees[calloutIndex];
  const mobile = normaliseSaMobile(phone);
  const wantsDiscount = firstClean && firstCleanOffer.enabled && claim !== "already_used" && claim !== "error";
  const discount = wantsDiscount ? Math.round((subtotal * firstCleanOffer.percent) / 100) : 0;
  const total = subtotal - discount + (fee?.price ?? 0);
  const timeLabel = booking.timeWindows.find((t) => t.id === time);
  const { earliest, latest, stepMinutes } = booking.customTime;
  const customTimeOk = /^\d{2}:\d{2}$/.test(customTime) && customTime >= earliest && customTime <= latest;
  const isCustom = (google && whenMode === "custom") || (!google && time === "exact");

  const stepValid = [
    chosen.length > 0,
    place !== null || (lookup === "error" && callout !== null && area.trim().length > 4),
    isCustom
      ? date !== null && customTimeOk
      : google
        ? booked
        : date !== null && time !== null,
    name.trim().length > 1 && mobile !== null,
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

  async function findAddress() {
    const q = area.trim();
    if (q.length < 4 || lookup === "busy") return;
    setLookup("busy");
    setResults(null);
    try {
      const found = await searchAddress(q);
      setResults(found);
      setLookup(found.length ? "idle" : "none");
      if (found.length === 1) choosePlace(found[0]);
    } catch {
      setLookup("error");
    }
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    setLookup("busy");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const found = await reverseLookup(pos.coords.latitude, pos.coords.longitude);
          if (found) {
            setResults([found]);
            choosePlace(found);
            setLookup("idle");
          } else {
            setResults([]);
            setLookup("none");
          }
        } catch {
          setLookup("error");
        }
      },
      () => setLookup("idle"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function choosePlace(p: Place) {
    setPlace(p);
    setSameBuilding(false);
  }

  function message(c: ClaimResult | null = claim) {
    const okDiscount = firstClean && firstCleanOffer.enabled && c !== "already_used" && c !== "error";
    const discount = okDiscount ? Math.round((subtotal * firstCleanOffer.percent) / 100) : 0;
    const total = subtotal - discount + (fee?.price ?? 0);
    const lines = [
      "Hi ZA Maid Group, I'd like to book a clean.",
      "",
      isCustom
        ? `Requested time: ${date ? longDate(date) : "-"} at ${customTime} (custom time, please confirm)`
        : google
          ? "Time: I've booked a slot on your booking page."
          : `Date: ${date ? longDate(date) : "-"}${timeLabel ? `, ${timeLabel.label.toLowerCase()}` : ""}`,
      place
        ? `Where: ${[unit.trim(), place.label].filter(Boolean).join(", ")} (verified address, about ${roadKmFromBase(place).toFixed(1)} km by road)`
        : `Where: ${area.trim()} (address not verified)`,
      ...(place ? [`Map: ${mapsLink(place)}`] : []),
      "",
      "Services:",
      ...chosen.map((i) =>
        i.kind === "sqm"
          ? `• ${i.name}: ${qty[i.id]} m² – ${rand(lineTotal(i, qty[i.id]))}`
          : `• ${qty[i.id]} × ${i.name}${i.note ? ` (${i.note})` : ""} – ${rand(lineTotal(i, qty[i.id]))}`,
      ),
      "",
      `Callout fee: ${fee ? (fee.price === null ? "to be quoted" : rand(fee.price)) : "-"}${fee ? ` (${fee.label}${fee.detail ? `, ${fee.detail}` : ""})` : ""}`,
    ];
    if (discount) lines.push(`First clean ${firstCleanOffer.percent}% off (checked online for this number): -${rand(discount)}`);
    if (firstClean && c === "error") lines.push("First clean: please check my first-clean discount (the online check didn't work).");
    lines.push(
      `Estimated total: ${rand(total)}${fee?.price === null ? " + travel" : ""}`,
      "",
      `Name: ${name.trim()}`,
      `Phone: ${mobile ? displayMobile(mobile) : phone.trim()}`,
    );
    if (notes.trim()) lines.push(`Notes: ${notes.trim()}`);
    return lines.join("\n");
  }

  // The discount is checked against the phone number when the booking is sent. If this number
  // has had it before, we stop and say so; pressing send again goes ahead without it.
  async function send(via: "whatsapp" | "email") {
    if (!stepValid.every(Boolean) || !mobile) {
      setTried(true);
      return;
    }
    if (firstClean && firstCleanOffer.enabled && claim !== "granted" && claim !== "already_used") {
      setSending(true);
      const result = await claimFirstClean(mobile);
      setSending(false);
      setClaim(result);
      if (result === "already_used") return; // show the notice; the next press sends without the discount
      if (result === "invalid_phone") {
        setTried(true);
        return;
      }
      // "granted" or "error": carry on (an error sends without the discount, asking ZA Maid to check).
      sendNow(via, result);
      return;
    }
    sendNow(via, claim);
  }

  function sendNow(via: "whatsapp" | "email", latestClaim: ClaimResult | null) {
    // React state hasn't updated yet inside send(), so build the message with the latest claim.
    const text = message(latestClaim);
    setSent(via);
    // Same-tab navigation: opening a new window after the (async) check would be blocked on phones.
    window.location.assign(
      via === "email"
        ? `mailto:${business.email}?subject=${encodeURIComponent("Booking request")}&body=${encodeURIComponent(text)}`
        : whatsappLink(text),
    );
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
              <h2 id="b-what">What needs cleaning?</h2>
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
              <h2 id="b-where">Where are we cleaning?</h2>
              <p className="booker__hint">
                We check the address on the map and work out the callout fee from the distance.
              </p>

              {place ? (
                <div className="addr-ok">
                  <PinIcon />
                  <div>
                    <strong>{place.label}</strong>
                    <span>
                      About {roadKmFromBase(place).toFixed(1)} km from us · Callout fee{" "}
                      {fee ? (fee.price === null ? "quoted" : rand(fee.price)) : "-"}
                    </span>
                    <a href={mapsLink(place)} target="_blank" rel="noopener">
                      Check it on the map
                    </a>
                  </div>
                  <button
                    type="button"
                    className="addr-ok__change"
                    onClick={() => {
                      setPlace(null);
                      setResults(null);
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label htmlFor="b-area">Street address</label>
                    <div className="addr-search">
                      <input
                        id="b-area"
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          if (lookup === "none") setLookup("idle");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            findAddress();
                          }
                        }}
                        autoComplete="street-address"
                        placeholder="e.g. 1131 Burnett Street, Hatfield"
                      />
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={findAddress}
                        disabled={lookup === "busy" || area.trim().length < 4}
                      >
                        {lookup === "busy" ? "Finding…" : "Find"}
                      </button>
                    </div>
                  </div>
                  <button type="button" className="text-link addr-locate" onClick={useMyLocation}>
                    <PinIcon /> Use my current location
                  </button>

                  {results && results.length > 1 && (
                    <div className="addr-results" role="radiogroup" aria-label="Matching addresses">
                      <p className="booker__hint">Which one is it?</p>
                      {results.map((r) => (
                        <button
                          key={`${r.lat},${r.lon}`}
                          type="button"
                          role="radio"
                          aria-checked={false}
                          className="booker__option"
                          onClick={() => choosePlace(r)}
                        >
                          <span>{r.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {lookup === "none" && (
                    <p className="booker__error">
                      We couldn&apos;t find that address in Pretoria. Try adding the suburb, or check the spelling.
                    </p>
                  )}
                  {lookup === "error" && (
                    <div className="addr-fallback">
                      <p className="booker__hint">
                        Our address check isn&apos;t working right now. Choose your distance from Hatfield and
                        we&apos;ll confirm the callout fee.
                      </p>
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
                    </div>
                  )}
                </>
              )}

              {place && (
                <div className="field">
                  <label htmlFor="b-unit">
                    Unit, flat or building name <span className="hint">(optional)</span>
                  </label>
                  <input id="b-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. Unit 12, Duncan Court" />
                </div>
              )}
              {place && placeIndex === 1 && (
                <label className="booker__check">
                  <input type="checkbox" checked={sameBuilding} onChange={(e) => setSameBuilding(e.target.checked)} />
                  <span>I&apos;m in the same building as ZA Maid (no callout fee, we&apos;ll confirm)</span>
                </label>
              )}
              <p className="addr-credit">
                Address search ©{" "}
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
                  OpenStreetMap contributors
                </a>
              </p>
              {tried && !stepValid[1] && (
                <p className="booker__error">
                  {lookup === "error"
                    ? "Choose your distance and type your full address."
                    : "Find your address and pick the right one to continue."}
                </p>
              )}
            </section>
          )}

          {step === 2 && google && (
            <section aria-labelledby="b-when">
              <h2 id="b-when">Pick your time</h2>
              <div className="seg" role="tablist" aria-label="How to choose a time">
                <button
                  type="button"
                  role="tab"
                  aria-selected={whenMode === "slots"}
                  onClick={() => setWhenMode("slots")}
                >
                  Open slots
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={whenMode === "custom"}
                  onClick={() => setWhenMode("custom")}
                >
                  Custom time
                </button>
              </div>
              {whenMode === "custom" ? (
                <CustomTime
                  date={date}
                  onDate={setDate}
                  value={customTime}
                  onChange={setCustomTime}
                  earliest={earliest}
                  latest={latest}
                  stepMinutes={stepMinutes}
                />
              ) : (
              <>
              {embeddable ? (
                <>
                  <p className="booker__hint">
                    These are our real open slots. Choose one and add your details, then come back here to send us
                    your list.
                  </p>
                  <div className="gcal">
                    <iframe src={google} title="ZA Maid Group booking calendar" loading="lazy" />
                  </div>
                  <p className="booker__hint">
                    Calendar not loading?{" "}
                    <a href={google} target="_blank" rel="noopener">
                      Open it in a new tab
                    </a>
                    .
                  </p>
                </>
              ) : (
                <div className="gcal-link">
                  <CalendarIcon />
                  <p>
                    Our calendar shows only the times we&apos;re free. Pick one, add your details, then come back to
                    this tab to send us your list.
                  </p>
                  <a className="btn btn--primary" href={google} target="_blank" rel="noopener">
                    Choose a time on our calendar
                  </a>
                </div>
              )}
              <label className="booker__check">
                <input type="checkbox" checked={booked} onChange={(e) => setBooked(e.target.checked)} />
                <span>I&apos;ve booked my time</span>
              </label>
              <p className="booker__hint booker__hint--after">
                None of the slots suit you?{" "}
                <button type="button" className="linklike" onClick={() => setWhenMode("custom")}>
                  Request a custom time
                </button>
              </p>
              </>
              )}
              {tried && !stepValid[2] && (
                <p className="booker__error">
                  {whenMode === "custom"
                    ? `Pick a day and a start time between ${earliest} and ${latest}.`
                    : "Book a time on the calendar, then tick the box to continue."}
                </p>
              )}
            </section>
          )}

          {step === 2 && !google && (
            <section aria-labelledby="b-when">
              <h2 id="b-when">When suits you?</h2>
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
              {time === "exact" && (
                <TimeInput value={customTime} onChange={setCustomTime} earliest={earliest} latest={latest} stepMinutes={stepMinutes} />
              )}
              {tried && !stepValid[2] && (
                <p className="booker__error">
                  {time === "exact"
                    ? `Pick a day and a start time between ${earliest} and ${latest}.`
                    : "Pick a day and a time to continue."}
                </p>
              )}
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="b-you">
              <h2 id="b-you">Almost done</h2>
              <div className="field">
                <label htmlFor="b-name">Your name</label>
                <input id="b-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="b-phone">Cellphone number</label>
                <input
                  id="b-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setClaim(null);
                  }}
                  autoComplete="tel"
                  placeholder="e.g. 071 234 5678"
                  aria-invalid={phone.trim() !== "" && !mobile}
                />
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
              {firstCleanOffer.enabled && claim !== "already_used" && (
                <label className="booker__check">
                  <input
                    type="checkbox"
                    checked={firstClean}
                    onChange={(e) => {
                      setFirstClean(e.target.checked);
                      setClaim(null);
                    }}
                  />
                  <span>
                    This is my first clean with ZA Maid ({firstCleanOffer.percent}% off, one per cellphone number)
                  </span>
                </label>
              )}
              {claim === "already_used" && (
                <p className="booker__notice">
                  This number has already had the first-clean discount, so it isn&apos;t included. Press send to book
                  at the normal price.
                </p>
              )}
              {tried && !stepValid[3] && (
                <p className="booker__error">
                  {name.trim().length < 2 ? "Please add your name." : "Please add a valid South African cellphone number."}
                </p>
              )}
              <div className="booker__send">
                <button type="button" className="btn btn--primary" onClick={() => send("whatsapp")} disabled={sending}>
                  <WhatsAppIcon /> {sending ? "Checking…" : "Send booking on WhatsApp"}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => send("email")} disabled={sending}>
                  <MailIcon /> Send by email
                </button>
              </div>
              <p className="form__note" aria-live="polite">
                {sent
                  ? `Your ${sent === "whatsapp" ? "WhatsApp" : "email app"} should have opened with your booking. Just press send there. We'll confirm the time and final price.`
                  : firstClean && claim !== "already_used"
                    ? "We check the first-clean discount against your number when you send. We keep only a scrambled record of the number, to stop repeat claims."
                    : google
                    ? "Your time is booked. Send us this list so we know what to bring. We'll confirm the final price."
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
                  <span>
                    First clean −{firstCleanOffer.percent}%{claim === "granted" ? "" : " (checked when you send)"}
                  </span>
                  <span>−{rand(discount)}</span>
                </li>
              )}
            </ul>
          )}
          {isCustom && date && customTimeOk && (
            <p className="booker__when">
              <CalendarIcon /> {longDate(date)} at {customTime} (requested)
            </p>
          )}
          {!isCustom && google && booked && (
            <p className="booker__when">
              <CalendarIcon /> Time booked on our calendar
            </p>
          )}
          {!isCustom && !google && date && (
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

function TimeInput({
  value,
  onChange,
  earliest,
  latest,
  stepMinutes,
}: {
  value: string;
  onChange: (v: string) => void;
  earliest: string;
  latest: string;
  stepMinutes: number;
}) {
  const bad = value !== "" && (value < earliest || value > latest);
  return (
    <div className="field custom-time">
      <label htmlFor="b-time">
        Start time <span className="hint">({earliest} to {latest})</span>
      </label>
      <input
        id="b-time"
        type="time"
        min={earliest}
        max={latest}
        step={stepMinutes * 60}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={bad}
      />
      {bad && <p className="booker__error">We start between {earliest} and {latest}, Monday to Saturday.</p>}
    </div>
  );
}

function CustomTime(props: {
  date: Date | null;
  onDate: (d: Date) => void;
  value: string;
  onChange: (v: string) => void;
  earliest: string;
  latest: string;
  stepMinutes: number;
}) {
  return (
    <div className="custom-when">
      <p className="booker__hint">
        Choose a day and the time you&apos;d like us to start. We&apos;ll confirm on WhatsApp, or suggest the closest
        time we can do.
      </p>
      <MonthCalendar value={props.date} onChange={props.onDate} />
      <TimeInput
        value={props.value}
        onChange={props.onChange}
        earliest={props.earliest}
        latest={props.latest}
        stepMinutes={props.stepMinutes}
      />
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
