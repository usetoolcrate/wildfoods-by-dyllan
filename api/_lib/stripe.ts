// Minimal Stripe REST client (no SDK). Pinned API version so response shapes
// stay put. STRIPE_SECRET_KEY is a test key until Dyllan's own account is
// connected; everything here works the same in live mode.

export const STRIPE_VERSION = "2026-04-22.dahlia";

type Params = Record<string, unknown>;

// Stripe's form encoding: nested objects as a[b][c], arrays as a[0][b].
function encode(value: unknown, prefix: string, out: string[]): string[] {
  if (value === undefined || value === null) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => encode(v, `${prefix}[${i}]`, out));
  } else if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Params)) encode(v, prefix ? `${prefix}[${k}]` : k, out);
  } else {
    out.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`);
  }
  return out;
}

export class StripeError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: Stripe responses are loosely typed on purpose.
export async function stripe(method: "GET" | "POST" | "DELETE", path: string, params?: Params, idempotencyKey?: string): Promise<any> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  const query = params ? encode(params, "", []).join("&") : "";
  let url = `https://api.stripe.com/v1/${path}`;
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, "Stripe-Version": STRIPE_VERSION };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  let body: string | undefined;
  if (method === "GET" || method === "DELETE") {
    if (query) url += (url.includes("?") ? "&" : "?") + query;
  } else {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = query;
  }
  const res = await fetch(url, { method, headers, body });
  const data = await res.json();
  if (!res.ok) throw new StripeError(data?.error?.message || `Stripe request failed (${res.status})`, res.status, data?.error?.code);
  return data;
}

export function isTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY || "").includes("_test_");
}

export function dashboardUrl(path: string): string {
  return `https://dashboard.stripe.com/${isTestMode() ? "test/" : ""}${path}`;
}
