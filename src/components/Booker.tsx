"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addressCheck,
  booking,
  business,
  calloutFees,
  firstCleanOffer,
  monthlyPlans,
  policies,
  priceGroups,
  rand,
  team,
  whatsappLink,
} from "@/content/site";
import { calloutIndexFor, mapsLink, reverseLookup, roadKmFromBase, searchAddress, type Place } from "@/lib/address";
import Image from "next/image";
import { initials, teamPhotos } from "@/content/team-photos";
import { claimFirstClean, displayMobile, normaliseSaMobile, type ClaimResult } from "@/lib/discount";
import { CalendarIcon, CheckIcon, MailIcon, PinIcon, WhatsAppIcon } from "./icons";

// Online booking *request*. Visitors build their clean from the real price list, pick a
// day and a time window, and send it to ZA Maid on WhatsApp (or email). ZA Maid confirms
// every booking. The booking itself isn't stored by the site; the only thing kept is a
// hashed phone number when the first-clean discount is claimed (see src/lib/discount.ts).

type Item = {
  id: string;
  group: string;
  name: string;
  price: number;
  kind: "count" | "sqm";
  max?: number;
  visits?: number; // monthly plans: visits a month, each with a callout fee
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
      note: g.id === "mattress-cleaning" ? "per side (add 2 for both sides)" : undefined,
    })),
  ),
  ...monthlyPlans.map<Item>((p) => ({
    id: `plan:${slug(p.name)}`,
    group: "Monthly plans",
    name: p.name,
    price: p.price,
    kind: "count",
    max: 1,
    visits: p.visits,
    note: "per month",
  })),
];
const groups = Array.from(new Set(items.map((i) => i.group)));

// Carpet per m²: "R100 plus R29 per square metre."
function lineTotal(item: Item, qty: number) {
  if (item.kind === "sqm") return qty <= 0 ? 0 : 100 + item.price * qty;
  return item.price * qty;
}

const STEPS = ["What", "Where", "When", "Details"] as const;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
// "HH:MM" or "HH:MM:SS" → minutes since midnight.
function toMinutes(t: string): number | null {
  const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
function timeAllowed(t: string, earliest: string, latest: string, step: number) {
  const v = toMinutes(t);
  const lo = toMinutes(earliest)!;
  const hi = toMinutes(latest)!;
  return v !== null && v >= lo && v <= hi && (v - lo) % step === 0;
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
  const [lookup, setLookup] = useState<"idle" | "busy" | "none" | "error" | "nolocation">("idle");
  const [sameBuilding, setSameBuilding] = useState(false);
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  // Step 3: "slots" = Zinhle's Google booking page, "custom" = a day + exact start time we confirm.
  const [whenMode, setWhenMode] = useState<"slots" | "custom">("slots");
  const [customTime, setCustomTime] = useState("");
  const [booked, setBooked] = useState(false); // ticked after picking a slot on Google's page
  const [bookedWhen, setBookedWhen] = useState(""); // the day/time they picked there, so ZA Maid can match it
  const google = booking.googleBookingUrl;
  // Short calendar.app.google links redirect to a page Google may not allow inside another
  // site, so they open in a new tab; full calendar.google.com links (embed mode) show inline.
  const embeddable = google?.startsWith("https://calendar.google.com/") ?? false;
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [cleaner, setCleaner] = useState(""); // a team member's name, or "" for no preference
  const [firstClean, setFirstClean] = useState(false);
  const [phone, setPhone] = useState("");
  const [claim, setClaim] = useState<ClaimResult | null>(null);
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [sent, setSent] = useState<null | "whatsapp" | "email">(null);
  const [tried, setTried] = useState(false);

  const chosen = items.filter((i) => (qty[i.id] ?? 0) > 0);
  const subtotal = chosen.reduce((sum, i) => sum + lineTotal(i, qty[i.id]), 0);
  // The first-clean discount is for once-off services only, not monthly plans.
  const onceOff = chosen
    .filter((i) => i.group !== "Monthly plans")
    .reduce((sum, i) => sum + lineTotal(i, qty[i.id]), 0);
  const canDiscount = firstCleanOffer.enabled && onceOff > 0;
  // With a verified address the callout band is worked out, not chosen. If the lookup
  // service is down, the visitor picks a band and the booking is marked "not verified".
  const placeIndex = place ? calloutIndexFor(place) : null;
  const calloutIndex = placeIndex !== null ? (sameBuilding && placeIndex === 1 ? 0 : placeIndex) : lookup === "error" ? callout : null;
  const fee = calloutIndex === null ? null : calloutFees[calloutIndex];
  // A monthly plan has a callout fee on every visit; anything else is one visit.
  const visits = chosen.find((i) => i.visits)?.visits ?? 1;
  const calloutTotal = (fee?.price ?? 0) * visits;
  const mobile = normaliseSaMobile(phone);
  const wantsDiscount = firstClean && canDiscount && claim !== "already_used" && claim !== "error";
  const discount = wantsDiscount ? Math.round((onceOff * firstCleanOffer.percent) / 100) : 0;
  const total = subtotal - discount + calloutTotal;
  const deposit = Math.round((total * policies.depositPercent) / 100);
  const timeLabel = booking.timeWindows.find((t) => t.id === time);
  const { earliest, latest, stepMinutes } = booking.customTime;
  const customTimeOk = timeAllowed(customTime, earliest, latest, stepMinutes);
  const isCustom = (google && whenMode === "custom") || (!google && time === "exact");

  const stepValid = [
    chosen.length > 0,
    place !== null || (lookup === "error" && callout !== null && area.trim().length >= 4),
    isCustom
      ? date !== null && customTimeOk
      : google
        ? booked && bookedWhen.trim().length >= 4
        : date !== null && time !== null,
    name.trim().length > 1 && mobile !== null,
  ];

  const change = (item: Item, delta: number) =>
    setQty((q) => {
      const next = Math.max(0, Math.min(item.max ?? 999, (q[item.id] ?? 0) + delta));
      const updated = { ...q, [item.id]: next };
      // Only one monthly plan at a time: choosing one replaces the other.
      if (item.group === "Monthly plans" && next > 0) {
        for (const other of items) if (other.group === "Monthly plans" && other.id !== item.id) updated[other.id] = 0;
      }
      return updated;
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
      const found = await searchAddress(q); // cached and spaced ≥1 s apart (OSM usage policy)
      setResults(found);
      setLookup(found.length ? "idle" : "none");
      if (found.length === 1) choosePlace(found[0]);
    } catch {
      setLookup("error");
    }
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setLookup("nolocation");
      return;
    }
    // Only show "busy" once we have a position: some browsers never answer if the
    // permission prompt is dismissed, which would otherwise leave the search stuck.
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLookup("busy");
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
      () => setLookup("nolocation"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function choosePlace(p: Place) {
    setPlace(p);
    setSameBuilding(false);
  }

  function message(c: ClaimResult | null = claim) {
    const okDiscount = firstClean && canDiscount && c !== "already_used" && c !== "error";
    const discount = okDiscount ? Math.round((onceOff * firstCleanOffer.percent) / 100) : 0;
    const total = subtotal - discount + calloutTotal;
    const deposit = Math.round((total * policies.depositPercent) / 100);
    const lines = [
      "Hi ZA Maid Group, I'd like to book a clean.",
      "",
      isCustom
        ? `Requested time: ${date ? longDate(date) : "-"} at ${customTime} (custom time, please confirm)`
        : google
          ? `Time: booked on your calendar for ${bookedWhen.trim()}`
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
      `Callout fee: ${fee ? (fee.price === null ? "to be quoted" : visits > 1 ? `${visits} visits × ${rand(fee.price)} = ${rand(calloutTotal)}` : rand(fee.price)) : "-"}${fee ? ` (${fee.label}${fee.detail ? `, ${fee.detail}` : ""})` : ""}`,
    ];
    if (discount) lines.push(`First clean ${firstCleanOffer.percent}% off once-off services (checked online for this number): -${rand(discount)}`);
    if (firstClean && canDiscount && c === "error") lines.push("First clean: please check my first-clean discount (the online check didn't work).");
    lines.push(
      `Estimated total: ${rand(total)}${fee?.price === null ? " + travel" : ""}`,
      `Deposit to confirm (${policies.depositPercent}%): about ${rand(deposit)}`,
      "",
      `Name: ${name.trim()}`,
      `Phone: ${mobile ? displayMobile(mobile) : phone.trim()}`,
    );
    if (cleaner) lines.push(`Preferred cleaner: ${cleaner} (if available, please confirm)`);
    if (notes.trim()) lines.push(`Notes: ${notes.trim()}`);
    return lines.join("\n");
  }

  // The discount is checked against the phone number when the booking is sent. If this number
  // has had it before, we stop and say so; pressing send again goes ahead without it.
  async function send(via: "whatsapp" | "email") {
    if (!stepValid.every(Boolean) || !mobile) {
      setTried(true);
      const firstBad = stepValid.indexOf(false);
      if (firstBad !== -1 && firstBad !== step) setStep(firstBad);
      return;
    }
    // Only claim when the discount actually applies, so a monthly-plan-only booking doesn't use it up.
    if (firstClean && canDiscount && claim !== "granted" && claim !== "already_used") {
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
                                {item.kind === "sqm" ? `R100 + ${rand(item.price)} / m²` : rand(item.price)}
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
                      setUnit("");
                      setSameBuilding(false);
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
                  <button type="button" className="text-link addr-locate" onClick={useMyLocation} disabled={lookup === "busy"}>
                    <PinIcon /> Use my current location
                  </button>

                  {results && results.length > 1 && (
                    <div className="addr-results" role="group" aria-label="Matching addresses">
                      <p className="booker__hint">Which one is it?</p>
                      {results.map((r, i) => (
                        <button
                          key={i}
                          type="button"
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
                      We couldn&apos;t find that street address in Pretoria. Include the street number and name (and the
                      suburb if you like), and check the spelling.
                    </p>
                  )}
                  {lookup === "nolocation" && (
                    <p className="booker__notice">
                      We couldn&apos;t get your location. Please type your street address instead.
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
                  <span>I&apos;m in {addressCheck.baseName}, same building as ZA Maid (no callout fee, we&apos;ll confirm)</span>
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
              <div className="seg" role="group" aria-label="How to choose a time">
                <button
                  type="button"
                  aria-pressed={whenMode === "slots"}
                  onClick={() => setWhenMode("slots")}
                >
                  Open slots
                </button>
                <button
                  type="button"
                  aria-pressed={whenMode === "custom"}
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
              {booked && (
                <div className="field booked-when">
                  <label htmlFor="b-booked-when">
                    Which day and time did you book? <span className="req" aria-hidden>*</span>
                  </label>
                  <input
                    id="b-booked-when"
                    value={bookedWhen}
                    onChange={(e) => setBookedWhen(e.target.value)}
                    placeholder="e.g. Tuesday 21 October, 09:00"
                    required
                    aria-required="true"
                  />
                </div>
              )}
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
                    : "Book a time on the calendar, tick the box and tell us the day and time you booked."}
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
                <label htmlFor="b-name">
                  Your name <span className="req" aria-hidden>*</span>
                </label>
                <input
                  id="b-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={(touched.name || tried) && name.trim().length < 2}
                  aria-describedby="b-name-err"
                />
                {(touched.name || tried) && name.trim().length < 2 && (
                  <p className="field__error" id="b-name-err">
                    Please enter your name.
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="b-phone">
                  Cellphone number <span className="req" aria-hidden>*</span>
                </label>
                <input
                  id="b-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setClaim(null);
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  autoComplete="tel"
                  placeholder="e.g. 071 234 5678"
                  required
                  aria-required="true"
                  aria-invalid={(touched.phone || tried) && !mobile}
                  aria-describedby="b-phone-err"
                />
                {(touched.phone || tried) && !mobile && (
                  <p className="field__error" id="b-phone-err">
                    {phone.trim() ? "That doesn't look like a South African cellphone number." : "Please enter your cellphone number."}
                  </p>
                )}
              </div>
              <p className="form__note form__note--req">
                <span className="req" aria-hidden>*</span> Required
              </p>
              {booking.chooseCleaner && (
                <fieldset className="cleaners">
                  <legend>
                    Choose your cleaner <span className="hint">(optional)</span>
                  </legend>
                  <div className="cleaners__grid">
                    {[{ name: "", role: "", photo: undefined }, ...team].map((m) => {
                      const photo = m.photo ? teamPhotos[m.photo] : undefined;
                      const label = m.name ? m.name.split(" ")[0] : "No preference";
                      return (
                        <label key={m.name || "any"} className="cleaners__opt" data-selected={cleaner === m.name}>
                          <input
                            type="radio"
                            name="cleaner"
                            value={m.name}
                            checked={cleaner === m.name}
                            onChange={() => setCleaner(m.name)}
                          />
                          {photo ? (
                            <Image src={photo} alt="" sizes="56px" className="cleaners__img" />
                          ) : (
                            <span className="cleaners__img cleaners__img--any" aria-hidden="true">
                              {m.name ? initials(m.name) : "Any"}
                            </span>
                          )}
                          <span className="cleaners__name">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="form__note">
                    We&apos;ll do our best to send who you choose. If they&apos;re not free that day, we&apos;ll tell you
                    before we confirm.
                  </p>
                </fieldset>
              )}
              <div className="field">
                <label htmlFor="b-notes">
                  Anything we should know? <span className="hint">(optional)</span>
                </label>
                <textarea
                  id="b-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. pets at home, parking"
                />
              </div>
              {canDiscount && claim !== "already_used" && (
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
                    This is my first clean with ZA Maid ({firstCleanOffer.percent}% off once-off services, not monthly plans
                    or the callout fee; one per cellphone number)
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
                <p className="booker__error">Please fill in your name and cellphone number above.</p>
              )}
              <p className="booker__privacy">
                We use your name, number, address and notes only to arrange your clean. They reach us on WhatsApp or
                email when you press send there. If you claim the first-clean discount, we keep a scrambled copy of
                your number so each number gets it once. Please don&apos;t include gate or alarm codes.{" "}
                <Link href="/privacy">Privacy notice</Link>
              </p>
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
                  : isCustom
                    ? `This is a request for your chosen time. We'll confirm the time and final price on WhatsApp. ${policies.deposit}`
                    : firstClean && canDiscount && claim !== "already_used"
                    ? "We check the first-clean discount against your number when you send. We keep only a scrambled record of the number, to stop repeat claims."
                    : google
                    ? `Send us this list so we know what to bring. We'll confirm the final price. ${policies.deposit}`
                    : `This is a booking request. We'll confirm the time and final price before the clean. ${policies.deposit}`}
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
                  <span>Callout fee{visits > 1 && fee.price !== null ? ` (${visits} visits)` : ""}</span>
                  <span>{fee.price === null ? "Quoted" : rand(calloutTotal)}</span>
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
          {cleaner && <p className="booker__when">Cleaner: {cleaner.split(" ")[0]} (requested)</p>}
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
          {chosen.length > 0 && (
            <p className="booker__deposit">
              {policies.depositPercent}% deposit to confirm: about {rand(deposit)}
            </p>
          )}
        </aside>
      </div>

      <div className="booker__bar">
        <div className="booker__bar-total">
          <small>Estimate</small>
          <strong>
            {rand(total)}
            {fee?.price === null ? " + travel" : ""}
          </strong>
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
  const bad = value !== "" && !timeAllowed(value, earliest, latest, stepMinutes);
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
      {bad && (
        <p className="booker__error">
          Choose a start time between {earliest} and {latest}, on the quarter hour (e.g. 09:15), Monday to Saturday.
        </p>
      )}
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
      <div className="cal__grid">
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
