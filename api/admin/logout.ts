import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sessionCookieHeader } from "../_lib/auth.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Set-Cookie", sessionCookieHeader(null));
  res.status(200).json({ ok: true });
}
