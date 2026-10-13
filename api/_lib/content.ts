import { ensureContentSchema, ensureEventExtras, getSql } from "./db.js";

/* Site content Dyllan edits in /admin. The first time it runs, it copies what
   used to be hard-coded (signature plates, testimonials, upcoming partner
   dinners) into the database, so nothing changes on the site when this ships.
   A settings flag makes each copy happen once, even if he later deletes
   everything. */

export type PlateRow = { id: number; name: string; image_url: string | null; image_alt: string; rows: { label: string; text: string }[]; position: number; published: boolean };
export type ReviewRow = { id: number; name: string; text: string; rating: number | null; source: string; review_date: string | null; shown: boolean; position: number };
export type InquiryRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  guests: number | null;
  experience: string | null;
  location: string | null;
  details: string | null;
  status: string;
  notified: boolean;
  created_at: string;
};

let ready: Promise<void> | null = null;

// Schema + one-time copies, once per warm function instance.
export function ensureContent(): Promise<void> {
  ready ??= (async () => {
    await ensureEventExtras();
    await ensureContentSchema();
    await seedOnce("seed.plates.v1", seedPlates);
    await seedOnce("seed.reviews.v1", seedReviews);
    await seedOnce("seed.partner-events.v1", seedPartnerEvents);
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

async function seedOnce(key: string, run: () => Promise<void>) {
  const sql = getSql();
  const done = (await sql`SELECT 1 FROM site_settings WHERE key = ${key}`) as unknown[];
  if (done.length) return;
  await run();
  await sql`INSERT INTO site_settings (key, value) VALUES (${key}, 'done') ON CONFLICT (key) DO NOTHING`;
}

async function seedPlates() {
  const sql = getSql();
  const count = (await sql`SELECT COUNT(*)::int AS n FROM plates`) as { n: number }[];
  if (count[0]?.n) return;
  const duck = [
    {
      label: "The farms",
      text: "Duck breast from Redbud Duck Co. in Ava. Wild rice with oyster mushrooms from Mo' Mushrooms and onions from Ozarks Farm Stop. Seared daikon radish with a coconut cream reduction, and baby chard.",
    },
    { label: "The chutney", text: "Apple chutney made with mugolio, a syrup of young pine cones — two years in the making." },
    {
      label: "The plate",
      text: "Dyllan worked on this dish for a year before the plating finally came together. “Duck is a delicate protein to work with, because every cut has to be done just right.”",
    },
  ];
  const roulade = [{ label: "The wild", text: "Chanterelles from summer hardwoods, and pawpaw — the Ozarks' native fruit, with a season only a few weeks long." }];
  await sql`
    INSERT INTO plates (name, image_url, image_alt, rows, position) VALUES
      ('Seared duck, wild rice & mugolio apple chutney', '/images/g-duck.jpg',
        'Sliced seared duck breast over wild rice with apple chutney, sage, daikon, and baby chard', ${JSON.stringify(duck)}::text::jsonb, 0),
      ('Chicken roulade, chanterelle & pawpaw', '/images/dish-chanterelle-pawpaw.webp',
        'Chicken roulade with chanterelle mushrooms and a pawpaw glaze', ${JSON.stringify(roulade)}::text::jsonb, 1)
  `;
}

async function seedReviews() {
  const sql = getSql();
  const count = (await sql`SELECT COUNT(*)::int AS n FROM reviews`) as { n: number }[];
  if (count[0]?.n) return;
  await sql`
    INSERT INTO reviews (name, text, source, shown, position) VALUES
      ('Noah H.', 'I was skeptical at first — I couldn''t pronounce any of the dishes on the menu. I couldn''t believe how incredibly good the food tasted. A 10 out of 10 night.', 'site', true, 0),
      ('Jobeth S.', 'A wonderful, quiet evening of meeting new friends and enjoying an artfully prepared, wild foraged, six-course dinner. I will be returning as often as possible.', 'site', true, 1),
      ('Julie S.', 'I never liked venison before I had it at one of the pop-ups. Now the flavors are seared in my memory and one I hope to repeat at one of his next pop-up events.', 'site', false, 2),
      ('Amy H.', 'The Wild Foods dinner was a delightful exploration of foraged ingredients. Dyllan''s dedication to crafting a meal that honored nature''s offerings was evident in every meticulously plated course.', 'site', false, 3)
  `;
}

// The partner dinners that were hard-coded on the site as of Oct 2026.
async function seedPartnerEvents() {
  const sql = getSql();
  const rows = [
    {
      slug: "open-fire-dinner-at-the-ranch-2026-10-23",
      name: "Open Fire Dinner at the Ranch",
      date: "2026-10-23",
      time: "6–8pm",
      location: "Walnut Shade, MO",
      about: "A family-style dinner cooked over an open fire at Parmele Ranch Co., built around ingredients sourced close to home. Seating is intentionally limited.",
      price: 17500,
      partner: "Parmele Ranch Co.",
      links: [{ label: "Tickets", url: "https://parmeleranchco.com/open-fire-at-the-ranch/" }],
    },
    {
      slug: "fall-harvest-dinner-2026-11-06",
      name: "Fall Harvest Dinner",
      date: "2026-11-06",
      time: "6–8pm",
      location: "Ozark, MO",
      about:
        "A collaborative dinner in the farmstead, built on the foraged and farm ingredients of late autumn. Non-alcoholic pairings included; an alcohol pairing is available as an add-on. 18+.",
      price: null,
      partner: "Finley Farms",
      links: [
        {
          label: "Tickets",
          url: "https://www.sevenrooms.com/experiences/theozarkmillatfinleyfarmsevents/fall-harvest-dinner-with-wild-foods-by-dyllan-6349774408040448?group_venue=theozarkmillatfinleyfarmsevents&venues=theozarkmillatfinleyfarmsevents%2Cthegarrisonatfinleyfarms",
        },
      ],
    },
  ];
  for (const r of rows) {
    await sql`
      INSERT INTO ticket_events (slug, name, event_date, time_label, location, about, price_cents, capacity, kind, partner, ticket_links, status)
      VALUES (${r.slug}, ${r.name}, ${r.date}::date, ${r.time}, ${r.location}, ${r.about}, ${r.price}, NULL, 'dinner', ${r.partner},
        ${JSON.stringify(r.links)}::text::jsonb, 'on_sale')
      ON CONFLICT (slug) DO NOTHING
    `;
  }
}

export async function getSetting(key: string): Promise<string> {
  const sql = getSql();
  const rows = (await sql`SELECT value FROM site_settings WHERE key = ${key}`) as { value: string }[];
  return rows[0]?.value ?? "";
}

export async function setSetting(key: string, value: string) {
  const sql = getSql();
  await sql`
    INSERT INTO site_settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
}

// Inquiry emails go out through Resend from the already-verified schottky.com
// domain (Dyllan's own domain isn't set up for sending yet). Reply-To is the
// guest, so Dyllan can just hit reply.
export async function notifyInquiry(i: InquiryRow): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const to = process.env.INQUIRY_TO || "dyllan@wildfoodsbydyllan.com";
  const from = process.env.INQUIRY_FROM || "Wild Foods website <wildfoods@schottky.com>";
  const lines = [
    `New private dining inquiry from ${i.name}`,
    "",
    `Date: ${i.event_date || "—"}`,
    `Guests: ${i.guests ?? "—"}`,
    `Experience: ${i.experience || "—"}`,
    `Where: ${i.location || "—"}`,
    `Email: ${i.email}`,
    `Phone: ${i.phone || "—"}`,
    "",
    i.details ? `What they're picturing:\n${i.details}` : "",
    "",
    "Reply to this email to answer them directly. All inquiries: /admin/inquiries on the website.",
  ];
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `inquiry-${i.id}` },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: i.email,
      subject: `Private dining inquiry: ${i.name}${i.event_date ? ` — ${i.event_date}` : ""}${i.guests ? `, ${i.guests} guests` : ""}`,
      text: lines.join("\n"),
    }),
  });
  return res.ok;
}
