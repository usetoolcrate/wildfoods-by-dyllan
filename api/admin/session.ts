import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthedRequest } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ authed: isAuthedRequest(req) });
}
