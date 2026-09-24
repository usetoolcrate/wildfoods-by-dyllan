import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureFormResponsesSchema, getSql } from "../_lib/db.js";
import { isAuthedRequest } from "../_lib/auth.js";

const FORMS = new Set(["phase2-scoping"]);
const MAX_ANSWERS = 40;
const MAX_TEXT = 2000;

type Answer = { n: number; title: string; picked: string[]; note: string };

function clean(value: unknown, max = MAX_TEXT): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function parseAnswers(raw: unknown): Answer[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_ANSWERS) return null;
  return raw.map(a => ({
    n: Number(a?.n) || 0,
    title: clean(a?.title, 200),
    picked: Array.isArray(a?.picked)
      ? a.picked
          .slice(0, 20)
          .map((p: unknown) => clean(p, 300))
          .filter(Boolean)
      : [],
    note: clean(a?.note),
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureFormResponsesSchema();
    const sql = getSql();

    if (req.method === "GET") {
      if (!isAuthedRequest(req)) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }
      const rows =
        await sql`SELECT * FROM form_responses ORDER BY updated_at DESC`;
      res.status(200).json({ responses: rows });
      return;
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      // Hidden field real visitors never see; bots that fill it get a quiet success.
      if (clean(body.website)) {
        res.status(200).json({ ok: true });
        return;
      }
      const form = clean(body.form, 64);
      const submissionId = clean(body.submissionId, 64);
      const answers = parseAnswers(body.answers);
      if (
        !FORMS.has(form) ||
        !/^[a-zA-Z0-9-]{8,64}$/.test(submissionId) ||
        !answers
      ) {
        res.status(400).json({ error: "Invalid submission" });
        return;
      }
      const rows = await sql`
        INSERT INTO form_responses (form, submission_id, answers)
        VALUES (${form}, ${submissionId}, ${JSON.stringify(answers)}::jsonb)
        ON CONFLICT (submission_id) DO UPDATE
          SET answers = EXCLUDED.answers, updated_at = now()
        RETURNING id, updated_at
      `;
      res
        .status(200)
        .json({ ok: true, id: rows[0].id, updatedAt: rows[0].updated_at });
      return;
    }

    if (req.method === "DELETE") {
      if (!isAuthedRequest(req)) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }
      const id = Number(req.query.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      await sql`DELETE FROM form_responses WHERE id = ${id}`;
      res.status(204).end();
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
