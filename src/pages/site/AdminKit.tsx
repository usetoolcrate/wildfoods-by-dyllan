import { type ReactNode, useEffect, useState } from "react";
import { SITE_STYLES } from "@/pages/site-shared";
import { LoginForm, labelStyle, secondaryButtonStyle, wrapStyle } from "@/pages/site/AdminRecipesPage";

/* Shared bits for the admin pages: the login gate, a header that links back to
   /admin, and a photo upload that shrinks phone photos in the browser first
   (Vercel functions refuse request bodies over 4.5 MB). */

export const field: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid var(--line)",
  fontFamily: "Georgia, serif",
  fontSize: 15,
  marginBottom: 14,
  background: "#fff",
  boxSizing: "border-box",
};

export const card: React.CSSProperties = { border: "1px solid var(--line)", background: "#fff", padding: "18px 20px", marginBottom: 14 };

export function badge(bg: string): React.CSSProperties {
  return { display: "inline-block", fontFamily: "'Courier New', monospace", fontSize: 11, padding: "2px 7px", background: bg, color: "#fff", marginLeft: 8, verticalAlign: "middle" };
}

export { labelStyle };

export async function adminPost(body: unknown): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return res.ok ? { ok: true } : { ok: false, error: data.error || "Couldn't save." };
}

// Longest side 1800px, JPEG — a 12 MB phone photo comes out around 400 KB.
export function resizeImage(file: File, max = 1800): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't an image this browser can read."));
    };
    img.src = url;
  });
}

export async function uploadImage(file: File, folder: "plates" | "recipes"): Promise<string> {
  const dataUrl = await resizeImage(file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl, filename: file.name.replace(/\.[^.]+$/, ""), folder }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
  return data.url as string;
}

export function AdminShell({ title, children, wide, home }: { title: string; children: ReactNode; wide?: boolean; home?: boolean }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = home ? title : `${title} — Wild Foods admin`;
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, [title, home]);

  const styles = <style dangerouslySetInnerHTML={{ __html: `${SITE_STYLES} @media print{.no-print{display:none !important;}}` }} />;
  if (authed === null)
    return (
      <>
        {styles}
        <div style={wrapStyle}>Loading…</div>
      </>
    );
  if (!authed)
    return (
      <>
        {styles}
        <LoginForm title={title} onLoggedIn={() => setAuthed(true)} />
      </>
    );

  return (
    <>
      {styles}
      <div style={{ ...wrapStyle, maxWidth: wide ? 1000 : 880 }}>
        <div className="no-print" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 18 }}>
          {home ? (
            <span />
          ) : (
            <a href="/admin" style={{ ...labelStyle, display: "inline", textDecoration: "none" }}>
              ← All admin
            </a>
          )}
          <button
            type="button"
            style={{ ...secondaryButtonStyle, padding: "4px 10px" }}
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/admin";
            }}
          >
            Log out
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
