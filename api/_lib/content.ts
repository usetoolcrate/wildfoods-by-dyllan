import { ensureContentSchema, ensureEventExtras, ensureSchema, getSql } from "./db.js";
import { emailDyllan } from "./email.js";

/* Site content Dyllan edits in /admin. The first time it runs, it copies what
   used to be hard-coded (signature plates, testimonials, upcoming partner
   dinners) into the database, so nothing changes on the site when this ships.
   A settings flag makes each copy happen once, even if he later deletes
   everything. */

export type PlateRow = { id: number; name: string; image_url: string | null; image_alt: string; rows: { label: string; text: string }[]; position: number; published: boolean };
export type ReviewRow = {
  id: number;
  name: string;
  text: string;
  rating: number | null;
  source: string;
  review_date: string | null;
  shown: boolean;
  position: number;
  google_id: string | null;
  original_text: string | null;
  keep: number[] | null;
  is_new: boolean;
};
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
    await seedOnce("seed.plates.walleye", seedWalleyePlate);
    await seedOnce("seed.recipes.pawpaw-mustard", seedPawpawMustard);
    await seedOnce("seed.recipes.pawpaw-mustard.notes", moveMustardNotes);
    await seedOnce("seed.events.fermentation-2027", seedFermentationClass);
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

// Dyllan's walleye plate (sent 2026-10-30), added after the gallery went live.
// Goes last; he can reorder it in /admin/plates.
async function seedWalleyePlate() {
  const sql = getSql();
  const have = (await sql`SELECT COUNT(*)::int AS n FROM plates WHERE name ILIKE '%walleye%'`) as { n: number }[];
  if (have[0]?.n) return;
  const rows = [
    {
      label: "The plate",
      text: "A walleye fillet under a walleye mousseline and toasted slivered almonds, over mashed butternut squash, with sumac-glazed carrots — Dyllan's go-to accompaniment.",
    },
    {
      label: "The fish",
      text: "Walleye, also called yellow pickerel, live in lakes across the Ozarks and much of North America. They keep to the deep, cold pockets where the water is freshest and cleanest.",
    },
    { label: "Why walleye", text: "One of Dyllan's favorite fish to work with: “the flavors go so well with a variety of fresh produce.”" },
  ];
  await sql`
    INSERT INTO plates (name, image_url, image_alt, rows, position) VALUES
      ('Walleye almondine, butternut squash & sumac carrots', '/images/dish-walleye.webp',
        'Plates of walleye almondine from above: walleye topped with mousseline and toasted almonds over butternut squash and glazed carrots',
        ${JSON.stringify(rows)}::text::jsonb, (SELECT COALESCE(MAX(position), -1) + 1 FROM plates))
  `;
}

// Dyllan's pawpaw mustard (emailed 2026-10-30), with his steps and chef's notes as written.
const MUSTARD = {
  teaser:
    "Native pawpaw — mango, banana, and a hint of pineapple — whisked with tangy mustard and local honey into a bright, sweet condiment for grilled meats, sandwiches, and charcuterie boards.",
  steps: [
    "Add the pawpaw pulp, mustard, honey, and apple cider vinegar to a mixing bowl.",
    "Whisk everything together until thoroughly combined and smooth.",
    "Add a dash of paprika, salt, and freshly ground black pepper.",
    "Taste and adjust the seasoning to your preference.",
    "Transfer to a clean jar and refrigerate for at least one hour before serving to allow the flavors to come together.",
  ],
  notes: [
    "Feel free to add a little more honey for sweetness, mustard for a sharper bite, or apple cider vinegar for extra acidity.",
    "Whole-grain mustard gives this recipe a rustic texture, while Dijon creates a smoother, more refined condiment.",
    "Storage: Keep refrigerated in a sealed container and use within 3–4 days. This is a fresh mustard, not a shelf-stable canned product.",
  ],
};

async function seedPawpawMustard() {
  await ensureSchema();
  const sql = getSql();
  const have = (await sql`SELECT COUNT(*)::int AS n FROM recipes WHERE slug = 'ozarks-pawpaw-mustard' OR title ILIKE '%pawpaw mustard%'`) as { n: number }[];
  if (have[0]?.n) return;
  const ingredients = [
    "1 cup ripe pawpaw pulp, seeds and skin removed",
    "½ cup whole-grain or Dijon mustard",
    "¼ cup honey",
    "2 tablespoons apple cider vinegar",
    "A dash of paprika",
    "Salt and freshly ground black pepper, to taste",
  ];
  await sql`
    INSERT INTO recipes (slug, title, tag, time, teaser, ingredients, steps, notes, image_url)
    VALUES ('ozarks-pawpaw-mustard', 'Ozarks Pawpaw Mustard', 'Foraged Fruit', '10 min + 1 hr chill', ${MUSTARD.teaser},
      ${JSON.stringify(ingredients)}::text::jsonb, ${JSON.stringify(MUSTARD.steps)}::text::jsonb,
      ${JSON.stringify(MUSTARD.notes)}::text::jsonb, '/images/recipe-pawpaw-mustard.jpg')
  `;
}

// The first version went out before recipes had chef's notes, with the notes
// folded into the steps. Move them over unless the recipe was edited since.
async function moveMustardNotes() {
  await ensureSchema();
  const sql = getSql();
  await sql`
    UPDATE recipes SET teaser = ${MUSTARD.teaser}, steps = ${JSON.stringify(MUSTARD.steps)}::text::jsonb,
      notes = ${JSON.stringify(MUSTARD.notes)}::text::jsonb, updated_at = now()
    WHERE slug = 'ozarks-pawpaw-mustard' AND jsonb_array_length(steps) = 7 AND notes = '[]'::jsonb AND updated_at = created_at
  `;
}

// Dyllan's own class, from his 11/3 email, word for word apart from the class
// details block (date, time, place and price show above the text already).
const FERMENTATION_ABOUT = `Discover the ancient art of fermentation with Chef Dyllan Dale of Wild Foods by Dyllan! Fermentation has been used for thousands of years to preserve food, develop complex flavors, and transform simple ingredients into something extraordinary. In this hands-on class, we’ll explore the fascinating world of beneficial microorganisms and learn how to harness their power in our own kitchens.

With years of experience working with fermented foods, Chef Dyllan will guide participants through the science, techniques, and traditions behind fermentation, with an emphasis on seasonal, locally sourced ingredients.

What you’ll learn:
• The science behind fermentation and how it works
• The difference between fermentation and pickling
• Proper sanitation, equipment, and fermentation safety
• Techniques for fermenting vegetables and other ingredients
• How to develop unique flavors through fermentation
• Tips for maintaining and troubleshooting ferments at home

Participants will gain hands-on experience and the knowledge needed to confidently begin fermenting in their own kitchens. Whether you’re a complete beginner or looking to expand your culinary skills, this class offers an approachable introduction to one of the oldest and most fascinating methods of food preservation.

With only 15 spots available, this intimate class allows for personalized instruction, hands-on learning, and plenty of opportunities to ask questions. The exact class location in Nixa, Missouri, will be provided upon ticket purchase.`;

async function seedFermentationClass() {
  const sql = getSql();
  const found = (await sql`
    SELECT 1 FROM ticket_events WHERE event_date = '2027-01-09'::date AND name ILIKE '%ferment%'
  `) as unknown[];
  if (found.length) return;
  await sql`
    INSERT INTO ticket_events (slug, name, event_date, time_label, location, about, price_cents, capacity, max_per_order, status, kind, photo)
    VALUES ('the-art-of-fermentation-2027-01-09', 'The Art of Fermentation', '2027-01-09'::date, '2:00–4:00 PM', 'Nixa, MO',
      ${FERMENTATION_ABOUT}, 3500, 15, 8, 'on_sale', 'workshop', '/images/events/fermentation-jars.jpg')
    ON CONFLICT (slug) DO NOTHING
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

export async function notifyInquiry(i: InquiryRow): Promise<boolean> {
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
  return emailDyllan({
    subject: `Private dining inquiry: ${i.name}${i.event_date ? ` — ${i.event_date}` : ""}${i.guests ? `, ${i.guests} guests` : ""}`,
    text: lines.join("\n"),
    replyTo: i.email,
    idempotencyKey: `inquiry-${i.id}`,
  });
}
