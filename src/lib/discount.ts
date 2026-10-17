import { discountCheck } from "@/content/site";

export type ClaimResult = "granted" | "already_used" | "invalid_phone" | "error";

// South African mobile numbers: 06x/07x/08x + 7 digits, or the +27 form.
export function normaliseSaMobile(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("270")) d = "27" + d.slice(3); // "+27 (0)71 …"
  else if (d.startsWith("0")) d = "27" + d.slice(1);
  return /^27[678]\d{8}$/.test(d) ? d : null;
}

export const displayMobile = (d: string) => `0${d.slice(2, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;

// Records the claim and tells us whether this number may have the first-clean discount.
// The same number may resend within 24 hours (e.g. if WhatsApp didn't open the first time).
export async function claimFirstClean(phone: string): Promise<ClaimResult> {
  try {
    const res = await fetch(`${discountCheck.supabaseUrl}/rest/v1/rpc/za_maid_claim_first_clean`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: discountCheck.publishableKey,
      },
      body: JSON.stringify({ p_phone: phone }),
    });
    if (!res.ok) return "error";
    const result = (await res.json()) as string;
    return result === "granted" || result === "already_used" || result === "invalid_phone" ? result : "error";
  } catch {
    return "error";
  }
}
