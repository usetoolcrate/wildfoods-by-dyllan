import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";
import { isAuthedRequest } from "../_lib/auth.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isAuthedRequest(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const body = req.body ?? {};
  const dataUrl = String(body.dataUrl ?? "");
  const filename = String(body.filename ?? "recipe-photo");
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: "Expected a base64 image data URL" });
    return;
  }
  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > 8 * 1024 * 1024) {
    res.status(400).json({ error: "Image too large (max 8MB)" });
    return;
  }

  const ext = mime.split("/")[1] || "jpg";
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `recipes/${Date.now()}-${safeName}.${ext}`;

  try {
    const blob = await put(key, buffer, {
      access: "public",
      contentType: mime,
      addRandomSuffix: true,
    });
    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
}
