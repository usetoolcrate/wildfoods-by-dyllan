import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, getSql } from "../_lib/db";
import { isAuthedRequest } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureSchema();
    const sql = getSql();
    const id = Number(req.query.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM recipes WHERE id = ${id}`;
      if (rows.length === 0) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const recipe = rows[0];
      if (!recipe.published && !isAuthedRequest(req)) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json({ recipe });
      return;
    }

    if (!isAuthedRequest(req)) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (req.method === "PUT") {
      const body = req.body ?? {};
      const title = String(body.title ?? "").trim();
      const tag = String(body.tag ?? "Uncategorized");
      const time = String(body.time ?? "");
      const teaser = String(body.teaser ?? "");
      const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
      const steps = Array.isArray(body.steps) ? body.steps : [];
      const imageUrl = body.imageUrl !== undefined ? body.imageUrl : null;
      const published = body.published === undefined ? true : Boolean(body.published);

      const rows = await sql`
        UPDATE recipes
        SET title = ${title}, tag = ${tag}, time = ${time}, teaser = ${teaser},
            ingredients = ${JSON.stringify(ingredients)}::jsonb, steps = ${JSON.stringify(steps)}::jsonb,
            image_url = ${imageUrl}, published = ${published}, updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json({ recipe: rows[0] });
      return;
    }

    if (req.method === "DELETE") {
      await sql`DELETE FROM recipes WHERE id = ${id}`;
      res.status(204).end();
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
