// Runs after `vite build`. The site is a single-page app, so link previews
// (iMessage, Facebook, Slack) only ever saw index.html's tags. This writes one
// HTML shell per public page with that page's title, description, link and
// share image; vercel.json's cleanUrls serves /private-chef from
// private-chef.html before the SPA rewrite kicks in.
import { readFileSync, writeFileSync } from "node:fs";

// Switch to https://wildfoodsbydyllan.com when the domain moves over.
const SITE = "https://wildfoods-by-dyllan.vercel.app";
const IMAGE_VERSION = "2"; // bump when the share images change, so apps refetch them

const PAGES = [
  {
    file: "index.html",
    path: "/",
    title: "Wild Foods by Dyllan — Farm-to-Table Dining in the Ozarks",
    description: "Farm-to-table dinners, private chef service, and Ozarks wild foods with Chef Dyllan Dale — Springfield, MO.",
    image: "home",
  },
  {
    file: "farm-to-table.html",
    path: "/farm-to-table",
    title: "Farm-to-Table Dinners — Wild Foods by Dyllan",
    description: "Dinners set at Ozarks farms, ranches, orchards, and wineries — menus built from what the host grows, with wild foods foraged close by.",
    image: "farm-to-table",
  },
  {
    file: "private-chef.html",
    path: "/private-chef",
    title: "Private Chef — Wild Foods by Dyllan",
    description: "A restaurant-level dinner in your home: buffet, family style, or plated, from $100 per guest. Farm-to-table, wild, or a blend of both.",
    image: "private-chef",
  },
  {
    file: "learn.html",
    path: "/learn",
    title: "Foraging Walks, Consultations & Teaching — Wild Foods by Dyllan",
    description: "Foraging walks on your land, one-on-one consultations, and classes for schools, restaurants, and community groups in the Ozarks.",
    image: "learn",
  },
  {
    file: "recipes.html",
    path: "/recipes",
    title: "Recipes — Wild Foods by Dyllan",
    description: "Foraged fruits, ferments, nuts, and preserves from Chef Dyllan Dale — searchable and ready to print.",
    image: "recipes",
  },
  {
    file: "shop.html",
    path: "/shop",
    title: "Gift Certificates — Wild Foods by Dyllan",
    description: "Give someone a seat at the table: Wild Foods by Dyllan gift certificates from $15 to $150.",
    image: "shop",
  },
  {
    file: "story.html",
    path: "/story",
    title: "My Story — Chef Dyllan Dale, Wild Foods by Dyllan",
    description: "How a kid from the Ozarks countryside became the chef behind farm-to-table dinners — with a forager's eye on every plate.",
    image: "story",
  },
  {
    file: "contact.html",
    path: "/contact",
    title: "Contact — Wild Foods by Dyllan",
    description: "Call, text, or email Chef Dyllan Dale about farm dinners, private chef nights, catering, foraging walks, and classes.",
    image: "contact",
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const shell = readFileSync("dist/index.html", "utf8");
const block = /<!-- share -->[\s\S]*?<!-- \/share -->/;
if (!block.test(shell)) throw new Error("share-pages: <!-- share --> block missing from dist/index.html");

for (const p of PAGES) {
  const url = `${SITE}${p.path}`;
  const image = `${SITE}/og/${p.image}.jpg?v=${IMAGE_VERSION}`;
  const tags = `<!-- share -->
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta property="og:site_name" content="Wild Foods by Dyllan" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(p.title)}" />
    <meta property="og:description" content="${esc(p.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(p.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(p.title)}" />
    <meta name="twitter:description" content="${esc(p.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="theme-color" content="#1f3327" />
    <!-- /share -->`;
  writeFileSync(`dist/${p.file}`, shell.replace(block, tags));
}
console.log(`share-pages: wrote ${PAGES.length} page shells`);
