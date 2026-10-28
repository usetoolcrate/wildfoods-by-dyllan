import { neon } from "@neondatabase/serverless";

// Uses the pooled connection string that Vercel's Neon integration injects.
// Local development (scripts/dev-api.ts, run with Bun) points DATABASE_URL at a
// plain Postgres on localhost; Bun's built-in client speaks the same tagged
// template, so the API code doesn't change.
export function getSql(): ReturnType<typeof neon> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  // biome-ignore lint/suspicious/noExplicitAny: Bun exists only in local dev.
  const BunSQL = (globalThis as any).Bun?.SQL;
  if (BunSQL && /@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    // biome-ignore lint/suspicious/noExplicitAny: same tagged-template contract as neon().
    localSql ??= new BunSQL(url) as any;
    return localSql as ReturnType<typeof neon>;
  }
  return neon(url);
}
let localSql: ReturnType<typeof neon> | undefined;

export async function ensureSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT 'Uncategorized',
      time TEXT NOT NULL DEFAULT '',
      teaser TEXT NOT NULL DEFAULT '',
      ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
      steps JSONB NOT NULL DEFAULT '[]'::jsonb,
      image_url TEXT,
      published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

// Answers from one-off questionnaires (e.g. /questions). One row per
// browser submission; re-sending from the same browser updates the row.
export async function ensureFormResponsesSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS form_responses (
      id SERIAL PRIMARY KEY,
      form TEXT NOT NULL,
      submission_id TEXT UNIQUE NOT NULL,
      answers JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

// Ticket sales for Dyllan's own events, and gift certificates / credits.
// Partner dinners don't live here: the partner sells those tickets.
export async function ensureTicketSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS ticket_events (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      event_date DATE NOT NULL,
      time_label TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      about TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      max_per_order INTEGER NOT NULL DEFAULT 8,
      add_ons JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL DEFAULT 'draft',
      test BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ticket_orders (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES ticket_events(id),
      ref TEXT UNIQUE NOT NULL,
      session_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'open',
      seats INTEGER NOT NULL,
      add_ons JSONB NOT NULL DEFAULT '[]'::jsonb,
      amount_subtotal INTEGER,
      amount_discount INTEGER,
      amount_total INTEGER,
      amount_refunded INTEGER NOT NULL DEFAULT 0,
      promo_code TEXT,
      buyer_name TEXT,
      buyer_email TEXT,
      buyer_phone TEXT,
      guests JSONB NOT NULL DEFAULT '[]'::jsonb,
      guests_at TIMESTAMPTZ,
      payment_intent TEXT,
      livemode BOOLEAN NOT NULL DEFAULT false,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS gift_certificates (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL DEFAULT 'gift',
      session_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'open',
      amount_cents INTEGER NOT NULL,
      code TEXT UNIQUE,
      coupon_id TEXT,
      promotion_code_id TEXT,
      buyer_name TEXT,
      buyer_email TEXT,
      recipient_name TEXT,
      from_name TEXT,
      message TEXT,
      order_id INTEGER REFERENCES ticket_orders(id),
      note TEXT,
      livemode BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

// Partner dinners live next to Dyllan's own events: same table, but tickets are
// sold by the partner (ticket_links), so price and capacity are optional.
export async function ensureEventExtras() {
  const sql = getSql();
  await ensureTicketSchema();
  await sql`ALTER TABLE ticket_events ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'dinner'`;
  await sql`ALTER TABLE ticket_events ADD COLUMN IF NOT EXISTS partner TEXT`;
  await sql`ALTER TABLE ticket_events ADD COLUMN IF NOT EXISTS ticket_links JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE ticket_events ADD COLUMN IF NOT EXISTS host_logo TEXT`;
  // Logos replaced the single host_logo; carry an old one over the first time.
  await sql`ALTER TABLE ticket_events ADD COLUMN IF NOT EXISTS logos JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`
    UPDATE ticket_events SET logos = jsonb_build_array(jsonb_build_object('src', host_logo, 'name', ''))
    WHERE host_logo IS NOT NULL AND logos = '[]'::jsonb
  `;
  await sql`ALTER TABLE ticket_events ALTER COLUMN price_cents DROP NOT NULL`;
  await sql`ALTER TABLE ticket_events ALTER COLUMN capacity DROP NOT NULL`;
}

// Content Dyllan edits from /admin: signature plates, reviews, private dining
// inquiries, and a few site settings (e.g. the Google reviews link).
export async function ensureContentSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS plates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT,
      image_alt TEXT NOT NULL DEFAULT '',
      rows JSONB NOT NULL DEFAULT '[]'::jsonb,
      position INTEGER NOT NULL DEFAULT 0,
      published BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      rating INTEGER,
      source TEXT NOT NULL DEFAULT 'google',
      review_date DATE,
      shown BOOLEAN NOT NULL DEFAULT true,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Google sync: google_id links a row to its Google review, original_text keeps the
  // reviewer's full words, keep lists the sentence numbers shown (null = all of them),
  // is_new marks reviews that arrived from Google and haven't been looked at yet.
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS google_id TEXT`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS original_text TEXT`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS keep JSONB`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT false`;
  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      event_date TEXT,
      guests INTEGER,
      experience TEXT,
      location TEXT,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}
