import crypto from "node:crypto";
import { excerpt, sentences } from "../../src/lib/sentences.js";
import { type ReviewRow, getSetting, setSetting } from "./content.js";
import { getSql } from "./db.js";

/* Google reviews sync through the Business Profile API.

   A Schottky LLC Google Cloud project (OAuth client in GOOGLE_CLIENT_ID /
   GOOGLE_CLIENT_SECRET) signs in once as a manager of Dyllan's profile; the
   refresh token is stored encrypted in site_settings. A daily Vercel cron (and the
   admin's "Check now") pulls every review into the reviews table:
   - new ones arrive hidden and marked new, for Dyllan to pick from
   - edited ones get the new words (any shortening is reset, so nothing
     outdated is shown in the reviewer's name)
   - ones deleted on Google are deleted here
   Google only lets approved projects call these APIs; until then every call
   fails with a quota/permission error, which the admin shows.

   GOOGLE_MOCK=1 (local dev only) answers with example data instead of calling Google. */

const SCOPE = "https://www.googleapis.com/auth/business.manage openid email";
const MOCK = process.env.GOOGLE_MOCK === "1";

export class GoogleError extends Error {}

export const googleConfigured = () => MOCK || Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export type GoogleLocation = { account: string; location: string; title: string; address: string; mapsUri: string };
export type SyncResult = { at: string; total: number; added: number; updated: number; removed: number; skipped: number; average: number | null; error: string };

// ---------- secrets ----------

// The refresh token can manage every profile the signed-in account manages, so it's
// encrypted at rest (AES-256-GCM, key derived from SESSION_SECRET) and never sent to a browser.
function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return crypto.createHash("sha256").update(`google-token:${secret}`).digest();
}

function seal(plain: string): string {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

function unseal(sealed: string): string {
  const [iv, tag, data] = sealed.split(".").map((p) => Buffer.from(p, "base64url"));
  const d = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString("utf8");
}

// OAuth state: a timestamp signed with SESSION_SECRET, good for 15 minutes. The
// callback also needs the admin session, so a forged redirect can't connect an account.
function makeState() {
  const ts = String(Date.now());
  return `${ts}.${crypto.createHmac("sha256", key()).update(ts).digest("hex")}`;
}

function stateOk(state: string) {
  const [ts, sig] = state.split(".");
  if (!ts || !sig || Date.now() - Number(ts) > 15 * 60 * 1000) return false;
  const expected = crypto.createHmac("sha256", key()).update(ts).digest("hex");
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// ---------- sign-in ----------

export function authUrl(redirectUri: string): string {
  if (MOCK) return `${redirectUri}?code=mock&state=${encodeURIComponent(makeState())}`;
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // always hand back a refresh token
    state: makeState(),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "", ...params }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, string>;
  if (!res.ok) throw new GoogleError(data.error === "invalid_grant" ? "The Google connection has expired or was removed. Connect again." : `Google sign-in failed (${data.error ?? res.status}).`);
  return data;
}

/** Finish the OAuth redirect: store the refresh token, return the account's email. */
export async function finishConnect(code: string, state: string, redirectUri: string): Promise<string> {
  if (!stateOk(state)) throw new GoogleError("That sign-in link expired. Try Connect Google again.");
  let refresh: string;
  let email = "example@schottky.com";
  if (MOCK) refresh = "mock-refresh-token";
  else {
    const data = await tokenRequest({ code, redirect_uri: redirectUri, grant_type: "authorization_code" });
    if (!data.refresh_token) throw new GoogleError("Google didn't return offline access. Try Connect Google again.");
    refresh = data.refresh_token;
    try {
      email = JSON.parse(Buffer.from(data.id_token.split(".")[1], "base64url").toString("utf8")).email ?? "";
    } catch {
      email = "";
    }
  }
  await setSetting("google_token", seal(refresh));
  await setSetting("google_email", email);
  return email;
}

export async function disconnect() {
  const sealed = await getSetting("google_token");
  if (sealed && !MOCK) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(unseal(sealed))}`, { method: "POST" }).catch(() => {});
  }
  for (const k of ["google_token", "google_email", "google_location"]) await setSetting(k, "");
}

async function accessToken(): Promise<string> {
  const sealed = await getSetting("google_token");
  if (!sealed) throw new GoogleError("Google isn't connected yet.");
  if (MOCK) return "mock";
  return (await tokenRequest({ refresh_token: unseal(sealed), grant_type: "refresh_token" })).access_token;
}

// ---------- API calls ----------

async function gget<T>(url: string, token: string): Promise<T> {
  if (MOCK) return mock(url) as T;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; status?: string } };
  if (!res.ok) {
    const msg = body.error?.message ?? `HTTP ${res.status}`;
    // Projects Google hasn't approved yet get a quota of 0 or "API not enabled".
    if (res.status === 429 || res.status === 403) throw new GoogleError(`Google hasn't opened its Business Profile API to this project yet (or an API isn't enabled). Google says: ${msg}`);
    throw new GoogleError(`Google error: ${msg}`);
  }
  return body as T;
}

/** Every Business Profile the connected account manages. */
export async function listLocations(): Promise<GoogleLocation[]> {
  const token = await accessToken();
  const out: GoogleLocation[] = [];
  let page = "";
  do {
    const a = await gget<{ accounts?: { name: string }[]; nextPageToken?: string }>(
      `https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=20${page ? `&pageToken=${page}` : ""}`,
      token,
    );
    for (const acct of a.accounts ?? []) {
      let lp = "";
      do {
        const l = await gget<{ locations?: { name: string; title?: string; storefrontAddress?: { locality?: string; administrativeArea?: string }; metadata?: { mapsUri?: string } }[]; nextPageToken?: string }>(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${acct.name}/locations?readMask=name,title,storefrontAddress,metadata&pageSize=100${lp ? `&pageToken=${lp}` : ""}`,
          token,
        );
        for (const loc of l.locations ?? []) {
          const addr = [loc.storefrontAddress?.locality, loc.storefrontAddress?.administrativeArea].filter(Boolean).join(", ");
          out.push({ account: acct.name, location: loc.name, title: loc.title ?? loc.name, address: addr, mapsUri: loc.metadata?.mapsUri ?? "" });
        }
        lp = l.nextPageToken ?? "";
      } while (lp);
    }
    page = a.nextPageToken ?? "";
  } while (page);
  return out;
}

type GReview = {
  reviewId: string;
  reviewer?: { displayName?: string; isAnonymous?: boolean };
  starRating?: string;
  comment?: string;
  createTime?: string;
};

const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

// "Sarah Miller" → "Sarah M.", like the reviews already on the site.
function shortName(r: GReview["reviewer"]) {
  if (!r?.displayName || r.isAnonymous) return "A Google user";
  const parts = r.displayName.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

// Google adds its own translation to reviews written in another language; keep the original.
function reviewText(comment = "") {
  const original = comment.split("(Original)")[1];
  return (original ?? comment.replace(/^\(Translated by Google\)\s*/, "")).trim();
}

// For matching a review Dyllan pasted in by hand to the same review arriving from Google.
const fingerprint = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "").slice(0, 60);

export async function syncReviews(): Promise<SyncResult> {
  const sql = getSql();
  const result: SyncResult = { at: new Date().toISOString(), total: 0, added: 0, updated: 0, removed: 0, skipped: 0, average: null, error: "" };
  try {
    const loc = JSON.parse((await getSetting("google_location")) || "null") as GoogleLocation | null;
    if (!loc) throw new GoogleError("Choose which Google profile to use.");
    const token = await accessToken();

    const all: GReview[] = [];
    let page = "";
    do {
      const r = await gget<{ reviews?: GReview[]; nextPageToken?: string; averageRating?: number; totalReviewCount?: number }>(
        `https://mybusiness.googleapis.com/v4/${loc.account}/${loc.location}/reviews?pageSize=50&orderBy=updateTime%20desc${page ? `&pageToken=${page}` : ""}`,
        token,
      );
      all.push(...(r.reviews ?? []));
      result.average = r.averageRating ?? result.average;
      result.total = r.totalReviewCount ?? result.total;
      page = r.nextPageToken ?? "";
    } while (page);

    const rows = (await sql`SELECT id, name, text, rating, source, google_id, original_text, keep FROM reviews`) as ReviewRow[];
    const byGoogle = new Map(rows.filter((r) => r.google_id).map((r) => [r.google_id!, r]));
    const seen = new Set<string>();

    for (const g of all) {
      const words = reviewText(g.comment);
      if (!words) {
        result.skipped++; // stars only, nothing to quote
        continue;
      }
      seen.add(g.reviewId);
      const name = shortName(g.reviewer);
      const rating = STARS[g.starRating ?? ""] ?? null;
      const date = g.createTime?.slice(0, 10) ?? null;
      const existing = byGoogle.get(g.reviewId);

      if (existing) {
        const changed = (existing.original_text ?? existing.text) !== words;
        if (changed) {
          await sql`
            UPDATE reviews SET name = ${name}, text = ${words}, original_text = ${words}, keep = NULL, rating = ${rating},
              review_date = ${date}::date, updated_at = now()
            WHERE id = ${existing.id}
          `;
          result.updated++;
        } else if (existing.rating !== rating || existing.name !== name) {
          await sql`UPDATE reviews SET name = ${name}, rating = ${rating}, updated_at = now() WHERE id = ${existing.id}`;
          result.updated++;
        }
        continue;
      }

      // Already pasted in by hand? Link that row instead of adding a copy.
      const pasted = rows.find((r) => !r.google_id && r.source === "google" && fingerprint(r.original_text ?? r.text) === fingerprint(words));
      if (pasted) {
        const keep = pasted.keep && (pasted.original_text ?? pasted.text) === words ? pasted.keep : null;
        await sql`
          UPDATE reviews SET google_id = ${g.reviewId}, name = ${name}, original_text = ${words}, keep = ${keep ? JSON.stringify(keep) : null}::text::jsonb,
            text = ${excerpt(sentences(words), keep)}, rating = ${rating}, review_date = ${date}::date, updated_at = now()
          WHERE id = ${pasted.id}
        `;
        result.updated++;
        continue;
      }

      await sql`
        INSERT INTO reviews (name, text, original_text, rating, source, review_date, shown, is_new, google_id, position)
        VALUES (${name}, ${words}, ${words}, ${rating}, 'google', ${date}::date, false, true, ${g.reviewId},
          (SELECT COALESCE(MAX(position), -1) + 1 FROM reviews))
      `;
      result.added++;
    }

    // Deleted on Google (or now stars only): take it off the site too.
    for (const r of rows) {
      if (r.google_id && !seen.has(r.google_id)) {
        await sql`DELETE FROM reviews WHERE id = ${r.id}`;
        result.removed++;
      }
    }

    // Fill in the "Read all reviews on Google" link if it's still empty.
    if (loc.mapsUri && !(await getSetting("google_reviews_url"))) await setSetting("google_reviews_url", loc.mapsUri);
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    if (!(err instanceof GoogleError)) console.error("google sync failed", err);
  }
  await setSetting("google_last_sync", JSON.stringify(result));
  return result;
}

export async function googleStatus() {
  return {
    configured: googleConfigured(),
    connected: Boolean(await getSetting("google_token")),
    email: await getSetting("google_email"),
    location: JSON.parse((await getSetting("google_location")) || "null") as GoogleLocation | null,
    lastSync: JSON.parse((await getSetting("google_last_sync")) || "null") as SyncResult | null,
    mock: MOCK,
  };
}

// ---------- local example data (GOOGLE_MOCK=1) ----------

function mock(url: string): unknown {
  if (url.includes("/v1/accounts?")) return { accounts: [{ name: "accounts/1001" }] };
  if (url.includes("/locations?"))
    return {
      locations: [
        { name: "locations/2001", title: "Wild Foods by Dyllan", storefrontAddress: { locality: "Seymour", administrativeArea: "MO" }, metadata: { mapsUri: "https://maps.google.com/?cid=0000000000000000001" } },
        { name: "locations/2002", title: "Another profile you manage", storefrontAddress: { locality: "Springfield", administrativeArea: "MO" } },
      ],
    };
  const r = (id: string, name: string, stars: string, comment: string, date: string): GReview & { createTime: string } => ({ reviewId: id, reviewer: { displayName: name }, starRating: stars, comment, createTime: `${date}T18:00:00Z` });
  return {
    averageRating: 4.9,
    totalReviewCount: 6,
    reviews: [
      r("ex1", "Example Reviewer", "FIVE", "Example review one. The duck was the best thing I ate all year. We'll be back for the next farm dinner!", "2026-09-20"),
      r("ex2", "Sample Guest", "FIVE", "Example review two. Dyllan explained every course and where it came from. Great evening with friends.", "2026-08-11"),
      r("ex3", "Test Diner", "FOUR", "Example review three. Lovely setting at the farm.\nService was a bit slow between courses, but the food made up for it.", "2026-07-02"),
      r("ex4", "Demo Person", "FIVE", "(Translated by Google) Example review four, translated.\n\n(Original)\nEjemplo de reseña cuatro. ¡Comida increíble!", "2026-06-15"),
      r("ex5", "Stars Only", "FIVE", "", "2026-05-01"),
      { reviewId: "ex6", reviewer: { isAnonymous: true }, starRating: "FIVE", comment: "Example review six from an anonymous guest. Unforgettable.", createTime: "2026-04-09T18:00:00Z" },
    ],
  };
}
