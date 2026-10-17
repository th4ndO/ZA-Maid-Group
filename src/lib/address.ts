import { addressCheck, calloutFees } from "@/content/site";

export type Place = {
  label: string;
  lat: number;
  lon: number;
  suburb: string | null;
  // True when the result is a street or building, not just a suburb or city centre.
  // Only these count as a verified address (otherwise searching "Hatfield" would give
  // the Hatfield callout fee to anyone).
  street: boolean;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
};

const NOMINATIM = "https://nominatim.openstreetmap.org";

function toPlace(r: NominatimResult): Place {
  const a = r.address ?? {};
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const suburb = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? null;
  const label = [a.building ?? a.amenity, street, suburb, a.city ?? a.town ?? "Pretoria"]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(", ");
  return { label: label || r.display_name, lat: Number(r.lat), lon: Number(r.lon), suburb, street: Boolean(a.road) };
}

function insideArea(p: Place) {
  const [west, north, east, south] = addressCheck.bbox;
  return p.lon >= west && p.lon <= east && p.lat <= north && p.lat >= south;
}

// Nominatim's usage policy: no autocomplete, at most one request a second. We only search
// when the visitor presses "Find address", and the button is disabled while a search runs.
// Remember recent answers and keep at least a second between requests.
const cache = new Map<string, Place[]>();
let lastRequest = 0;
async function politeWait() {
  const wait = lastRequest + 1000 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
}

export async function searchAddress(query: string): Promise<Place[]> {
  const key = query.trim().toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;
  await politeWait();
  const [west, north, east, south] = addressCheck.bbox;
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "za",
    limit: "5",
    viewbox: `${west},${north},${east},${south}`,
    bounded: "1",
    "accept-language": "en",
  });
  const res = await fetch(`${NOMINATIM}/search?${params}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Address lookup failed (${res.status})`);
  const data = (await res.json()) as NominatimResult[];
  const places = data.map(toPlace).filter((p) => insideArea(p) && p.street);
  cache.set(key, places);
  return places;
}

export async function reverseLookup(lat: number, lon: number): Promise<Place | null> {
  await politeWait();
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
    "accept-language": "en",
  });
  const res = await fetch(`${NOMINATIM}/reverse?${params}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Address lookup failed (${res.status})`);
  const place = toPlace((await res.json()) as NominatimResult);
  return insideArea(place) && place.street ? place : null;
}

// Great-circle distance in km.
function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export function roadKmFromBase(p: Place) {
  const { base, roadFactor } = addressCheck;
  return haversineKm(base.lat, base.lon, p.lat, p.lon) * roadFactor;
}

// Index into `calloutFees`: 1 Hatfield, 2 up to 5 km, 3 5–10, 4 10–15, 5 15–20, 6 over 20.
// (0, same building, is only ever set by the visitor ticking that box.)
export function calloutIndexFor(p: Place): number {
  const km = roadKmFromBase(p);
  if ((p.suburb ?? "").toLowerCase() === "hatfield") return 1;
  const bands = [5, 10, 15, 20];
  const i = bands.findIndex((max) => km <= max);
  const index = i === -1 ? 6 : i + 2;
  return Math.min(index, calloutFees.length - 1);
}

export const mapsLink = (p: Place) => `https://maps.google.com/?q=${p.lat.toFixed(6)},${p.lon.toFixed(6)}`;
