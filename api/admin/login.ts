import type { VercelRequest, VercelResponse } from "@vercel/node";
import { makeSessionToken, sessionCookieHeader } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = req.body ?? {};
  const password = String(body.password ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    res.status(500).json({ error: "Admin password not configured" });
    return;
  }
  if (password !== expected) {
    res.status(401).json({ error: "Wrong password" });
    return;
  }
  const token = makeSessionToken();
  res.setHeader("Set-Cookie", sessionCookieHeader(token));
  res.status(200).json({ ok: true });
}
