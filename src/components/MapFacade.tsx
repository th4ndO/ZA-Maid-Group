"use client";

import { useState } from "react";
import { PinIcon } from "./icons";

// A Google Maps embed downloads megabytes of scripts and tiles, which is a lot on a slow
// or prepaid connection. Show a light placeholder and load the real map only on request.
export function MapFacade({ query, label }: { query: string; label: string }) {
  const [show, setShow] = useState(false);
  const q = encodeURIComponent(query);

  if (show) {
    return (
      <iframe
        className="map"
        title={`Map of ${label}`}
        src={`https://www.google.com/maps?q=${q}&z=14&output=embed`}
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  return (
    <div className="map map--facade">
      <PinIcon />
      <strong>{label}</strong>
      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={() => setShow(true)}>
          Show map
        </button>
        <a className="btn btn--ghost" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener">
          Open Google Maps
        </a>
      </div>
    </div>
  );
}
