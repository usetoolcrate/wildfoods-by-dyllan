// Local API for development: serves the Vercel functions in /api on :3011 so
// `vite` (which proxies /api here) can exercise tickets end to end against a
// local Postgres and Stripe test mode. Run with Bun:
//   bun scripts/dev-api.ts
// Settings come from .env.dev.local (git- and deploy-ignored).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
for (const line of readFileSync(join(root, ".env.dev.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

// /api/admin/tickets → api/admin/tickets.ts, /api/recipes → api/recipes/index.ts,
// /api/recipes/abc → api/recipes/[id].ts with id=abc
function resolve(pathname: string): { file: string; params: Record<string, string> } | null {
  const rel = pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const direct = join(root, "api", `${rel}.ts`);
  if (existsSync(direct)) return { file: direct, params: {} };
  const index = join(root, "api", rel, "index.ts");
  if (existsSync(index)) return { file: index, params: {} };
  const parts = rel.split("/");
  const last = parts.pop() ?? "";
  const dynamic = join(root, "api", ...parts, "[id].ts");
  if (existsSync(dynamic)) return { file: dynamic, params: { id: last } };
  return null;
}

Bun.serve({
  port: 3011,
  async fetch(request) {
    const url = new URL(request.url);
    const route = resolve(url.pathname);
    if (!route) return new Response("Not found", { status: 404 });
    const mod = await import(route.file);
    const headers = Object.fromEntries(request.headers);
    let body: unknown;
    if ((headers["content-type"] ?? "").includes("application/json")) body = await request.json().catch(() => ({}));
    const req = { method: request.method, url: url.pathname + url.search, headers, query: { ...Object.fromEntries(url.searchParams), ...route.params }, body };
    return await new Promise<Response>((done) => {
      let status = 200;
      const out = new Headers();
      const res = {
        status(code: number) {
          status = code;
          return res;
        },
        setHeader(key: string, value: string | string[]) {
          for (const v of Array.isArray(value) ? value : [value]) out.append(key, String(v));
          return res;
        },
        json(data: unknown) {
          out.set("content-type", "application/json");
          done(new Response(JSON.stringify(data), { status, headers: out }));
          return res;
        },
        send(data: unknown) {
          done(new Response(typeof data === "string" ? data : JSON.stringify(data), { status, headers: out }));
          return res;
        },
        end(data?: string) {
          done(new Response(data ?? null, { status, headers: out }));
          return res;
        },
      };
      Promise.resolve(mod.default(req, res)).catch((err: unknown) => done(new Response(String(err), { status: 500 })));
    });
  },
});
console.log("dev api on http://localhost:3011");
