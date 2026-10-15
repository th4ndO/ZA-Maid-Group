"use client";

import { useState, type FormEvent } from "react";
import { business, services, whatsappLink } from "@/content/site";
import { MailIcon, WhatsAppIcon } from "./icons";

// The quote form has no server: it builds a message and opens WhatsApp (or email) with it
// filled in, so the request lands straight in ZA Maid's chats. Nothing is stored.
function buildMessage(data: FormData) {
  const get = (k: string) => String(data.get(k) ?? "").trim();
  const lines = [
    "Hi ZA Maid Group, I'd like a quote.",
    "",
    `Name: ${get("name")}`,
    `Service: ${get("service")}`,
    `Area: ${get("area")}`,
  ];
  if (get("date")) lines.push(`Preferred date: ${get("date")}`);
  if (get("details")) lines.push(`Details: ${get("details")}`);
  return lines.join("\n");
}

export function QuoteForm() {
  const [sentVia, setSentVia] = useState<"whatsapp" | "email" | null>(null);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const via = submitter?.value === "email" ? "email" : "whatsapp";
    const message = buildMessage(new FormData(form));

    const url =
      via === "email"
        ? `mailto:${business.email}?subject=${encodeURIComponent("Quote request")}&body=${encodeURIComponent(message)}`
        : whatsappLink(message);

    if (via === "email") {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener");
    }
    setSentVia(via);
  }

  return (
    <form className="form" onSubmit={send}>
      <div className="form__row">
        <div className="field">
          <label htmlFor="q-name">Your name</label>
          <input id="q-name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="q-area">
            Suburb or building <span className="hint">(for the callout fee)</span>
          </label>
          <input id="q-area" name="area" autoComplete="address-level3" required />
        </div>
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="q-service">What do you need?</label>
          <select id="q-service" name="service" required defaultValue="">
            <option value="" disabled>
              Choose a service
            </option>
            {services.map((s) => (
              <option key={s.slug}>{s.title}</option>
            ))}
            <option>Couch / mattress / carpet cleaning</option>
            <option>Monthly plan</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="q-date">
            Preferred date <span className="hint">(optional)</span>
          </label>
          <input id="q-date" name="date" type="date" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="q-details">
          Tell us about the space <span className="hint">(optional)</span>
        </label>
        <textarea
          id="q-details"
          name="details"
          placeholder="e.g. 2-bedroom apartment, one bathroom, and a 3-seater couch"
        />
      </div>
      <div className="btn-row">
        <button className="btn btn--primary" type="submit" value="whatsapp">
          <WhatsAppIcon /> Send on WhatsApp
        </button>
        <button className="btn btn--ghost" type="submit" value="email">
          <MailIcon /> Send by email
        </button>
      </div>
      <p className="form__note" aria-live="polite">
        {sentVia === "whatsapp"
          ? "WhatsApp should have opened with your message. Just press send there."
          : sentVia === "email"
            ? "Your email app should have opened with your message. Just press send there."
            : "Your message opens in WhatsApp or your email app, ready to send. We don't store anything on this site."}
      </p>
    </form>
  );
}
