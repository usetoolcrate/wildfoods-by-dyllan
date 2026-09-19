import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, getSql } from "../_lib/db";
import { isAuthedRequest } from "../_lib/auth";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();
    const sql = getSql();

    if (req.method === "GET") {
      const authed = isAuthedRequest(req);
      const rows = authed
        ? await sql`SELECT * FROM recipes ORDER BY created_at DESC`
        : await sql`SELECT * FROM recipes WHERE published = true ORDER BY created_at DESC`;
      res.status(200).json({ recipes: rows });
      return;
    }

    if (req.method === "POST") {
      if (!isAuthedRequest(req)) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }
      const body = req.body ?? {};
      const title = String(body.title ?? "").trim();
      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }
      let slug = slugify(title);
      const tag = String(body.tag ?? "Uncategorized");
      const time = String(body.time ?? "");
      const teaser = String(body.teaser ?? "");
      const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
      const steps = Array.isArray(body.steps) ? body.steps : [];
      const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
      const published = body.published === undefined ? true : Boolean(body.published);

      // Ensure slug uniqueness
      const existing = await sql`SELECT id FROM recipes WHERE slug = ${slug}`;
      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const rows = await sql`
        INSERT INTO recipes (slug, title, tag, time, teaser, ingredients, steps, image_url, published)
        VALUES (${slug}, ${title}, ${tag}, ${time}, ${teaser}, ${JSON.stringify(ingredients)}::jsonb, ${JSON.stringify(steps)}::jsonb, ${imageUrl}, ${published})
        RETURNING *
      `;
      res.status(201).json({ recipe: rows[0] });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
