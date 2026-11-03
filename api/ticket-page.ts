import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureContent } from "./_lib/content.js";
import { getEvent } from "./_lib/tickets.js";
import { SITE, shareVersion, ticketWhen } from "./_lib/share.js";

/* /tickets/:slug is rewritten here (vercel.json) so a shared ticket link
   unfurls with the event's own title, details and picture instead of the home
   page's. Browsers get the same single-page app shell; only the tags differ. */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const BLOCK = /<!-- share -->[\s\S]*?<!-- \/share -->/;

let shell: string | null = null;

async function loadShell(host: string): Promise<string> {
  if (shell) return shell;
  try {
    shell = readFileSync(join(process.cwd(), "dist/index.html"), "utf8");
  } catch {
    // Not bundled with the function: the home page is the same shell.
    shell = await (await fetch(`https://${host}/`)).text();
  }
  return shell;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "wildfoodsbydyllan.com");
  let html = await loadShell(host);
  try {
    await ensureContent();
    const e = await getEvent(String(req.query.slug ?? ""));
    if (e && (e.status === "on_sale" || e.status === "closed")) {
      const url = `${SITE}/tickets/${e.slug}`;
      const title = `${e.name} — Wild Foods by Dyllan`;
      const price = e.price_cents ? ` · $${(e.price_cents / 100).toLocaleString("en-US")} per person` : "";
      const intro = e.about.split(/\n\s*\n/)[0];
      const lead = `${ticketWhen(e)}${e.location ? ` · ${e.location}` : ""}${price}.`;
      const description = `${lead} ${intro.length > 170 ? `${intro.slice(0, intro.lastIndexOf(" ", 167))}…` : intro}`;
      const image = `${SITE}/api/ticket-image?slug=${encodeURIComponent(e.slug)}&v=${shareVersion(e)}`;
      html = html.replace(
        BLOCK,
        `<!-- share -->
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta property="og:site_name" content="Wild Foods by Dyllan" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(e.name)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(e.name)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(e.name)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="theme-color" content="#1f3327" />${e.test ? '\n    <meta name="robots" content="noindex" />' : ""}
    <!-- /share -->`,
      );
    }
  } catch (err) {
    // The page still works with the default tags.
    console.error(err);
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  res.status(200).send(html);
}
