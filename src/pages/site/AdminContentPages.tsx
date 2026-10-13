import { useCallback, useEffect, useState } from "react";
import { buttonStyle, secondaryButtonStyle } from "@/pages/site/AdminRecipesPage";
import { AdminShell, adminPost, badge, card, field, labelStyle, muted, small, uploadImage } from "@/pages/site/AdminKit";
import { excerpt } from "@/lib/sentences";

/* /admin and the content pages Dyllan edits himself:
   signature plates, reviews, and private dining inquiries. */

function useArea<T>(area: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    const res = await fetch(`/api/admin/content?area=${area}`);
    if (!res.ok) return setError("Couldn't load. Refresh to try again.");
    setData(await res.json());
  }, [area]);
  useEffect(() => {
    load();
  }, [load]);
  return { data, error, load, setError };
}

/* ---------------- /admin ---------------- */

type Summary = { new_inquiries: number; plates: number; reviews: number; new_reviews: number; upcoming: number };

function SummaryCards() {
  const { data } = useArea<Summary>("summary");
  const tiles: [string, string, string][] = [
    ["/admin/inquiries", "Inquiries", data ? (data.new_inquiries ? `${data.new_inquiries} new` : "None new") : "…"],
    ["/admin/tickets", "Dinners & tickets", data ? `${data.upcoming} upcoming` : "…"],
    ["/admin/plates", "Signature plates", data ? `${data.plates} on the site` : "…"],
    ["/admin/reviews", "Reviews", data ? `${data.reviews} on the site${data.new_reviews ? ` · ${data.new_reviews} new from Google` : ""}` : "…"],
    ["/admin/recipes", "Recipes", "Add and edit recipes"],
    ["/admin/questions", "Questionnaire", "Answers from setup"],
    ["/admin/how", "How-to videos", "Short walkthroughs of each page"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
      {tiles.map(([href, name, note]) => (
        <a key={href} href={href} style={{ ...card, display: "block", textDecoration: "none", color: "var(--ink)", marginBottom: 0 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{name}</div>
          <div style={muted}>{note}</div>
        </a>
      ))}
    </div>
  );
}

export function AdminHomePage() {
  return (
    <AdminShell title="Wild Foods admin" home help="getting-in">
      <h1 style={{ fontSize: 28, marginTop: 0 }}>Wild Foods admin</h1>
      <p style={{ ...muted, marginTop: -6, marginBottom: 24 }}>Everything on the site you can change yourself.</p>
      <SummaryCards />
    </AdminShell>
  );
}

/* ---------------- /admin/plates ---------------- */

type Plate = { id: number; name: string; image_url: string | null; image_alt: string; rows: { label: string; text: string }[]; published: boolean };
type PlateDraft = { id?: number; name: string; image: string; alt: string; rows: { label: string; text: string }[]; published: boolean };

const NEW_PLATE: PlateDraft = {
  name: "",
  image: "",
  alt: "",
  rows: [
    { label: "The farms", text: "" },
    { label: "The wild", text: "" },
    { label: "The plate", text: "" },
  ],
  published: true,
};

function PlateForm({ initial, onDone }: { initial: PlateDraft; onDone: () => void }) {
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await adminPost({ action: "savePlate", id: d.id, plate: d });
    setBusy(false);
    if (!r.ok) return setError(r.error ?? "Couldn't save.");
    onDone();
  }

  return (
    <form onSubmit={save} style={{ ...card, padding: 22, marginBottom: 28 }}>
      <h2 style={{ fontSize: 22, marginTop: 0 }}>{d.id ? "Edit plate" : "New plate"}</h2>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      <label style={labelStyle}>Dish name</label>
      <input style={field} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} required placeholder="Seared duck, wild rice & apple chutney" />
      <label style={labelStyle}>Photo</label>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap" }}>
        {d.image ? <img src={d.image} alt="" style={{ width: 120, height: 150, objectFit: "cover", border: "1px solid var(--line)" }} /> : null}
        <div>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError("");
              try {
                setD({ ...d, image: await uploadImage(file, "plates") });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setUploading(false);
              }
            }}
          />
          <div style={{ ...muted, marginTop: 6 }}>{uploading ? "Uploading…" : "Portrait photos look best (taller than wide)."}</div>
        </div>
      </div>
      <label style={labelStyle}>Describe the photo (for screen readers and Google)</label>
      <input style={field} value={d.alt} onChange={(e) => setD({ ...d, alt: e.target.value })} placeholder="Sliced duck breast over wild rice with chutney and sage" />
      <label style={labelStyle}>The story — a short heading and a few sentences each (empty ones are hidden)</label>
      {d.rows.map((r, i) => (
        <div key={`row-${i}`} style={{ borderLeft: "3px solid var(--line)", paddingLeft: 12, marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
            <input
              style={{ ...field, maxWidth: 220, marginBottom: 8 }}
              value={r.label}
              aria-label={`Heading ${i + 1}`}
              onChange={(e) => setD({ ...d, rows: d.rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
            />
            <button type="button" style={{ ...small, marginTop: 6 }} onClick={() => setD({ ...d, rows: d.rows.filter((_, j) => j !== i) })}>
              Remove
            </button>
          </div>
          <textarea
            style={{ ...field, minHeight: 64 }}
            value={r.text}
            aria-label={`${r.label || `Line ${i + 1}`} text`}
            onChange={(e) => setD({ ...d, rows: d.rows.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
          />
        </div>
      ))}
      {d.rows.length < 5 ? (
        <button type="button" style={{ ...small, marginBottom: 18 }} onClick={() => setD({ ...d, rows: [...d.rows, { label: "", text: "" }] })}>
          + Add a line
        </button>
      ) : null}
      <label style={{ display: "block", fontSize: 14, marginBottom: 18 }}>
        <input type="checkbox" checked={d.published} onChange={(e) => setD({ ...d, published: e.target.checked })} /> Show on the site
      </label>
      <button type="submit" style={buttonStyle} disabled={busy || uploading}>
        {busy ? "Saving…" : "Save plate"}
      </button>{" "}
      <button type="button" style={secondaryButtonStyle} onClick={onDone}>
        Cancel
      </button>
    </form>
  );
}

export function AdminPlatesPage() {
  const { data, error, load, setError } = useArea<{ plates: Plate[] }>("plates");
  const [editing, setEditing] = useState<PlateDraft | null>(null);

  async function act(body: object, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const r = await adminPost(body);
    if (!r.ok) setError(r.error ?? "Couldn't save.");
    load();
  }

  return (
    <AdminShell title="Signature plates" help="plates">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Signature plates</h1>
        <button type="button" style={buttonStyle} onClick={() => setEditing({ ...NEW_PLATE, rows: NEW_PLATE.rows.map((r) => ({ ...r })) })}>
          New plate
        </button>
      </div>
      <p style={{ ...muted, marginBottom: 22 }}>The "One plate" gallery on the home page, in this order. Visitors click through them with the arrows.</p>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      {editing ? (
        <PlateForm
          initial={editing}
          onDone={() => {
            setEditing(null);
            load();
          }}
        />
      ) : null}
      {!data ? <p>Loading…</p> : data.plates.length === 0 ? <p>No plates yet.</p> : null}
      {data?.plates.map((p, i) => (
        <div key={p.id} style={{ ...card, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {p.image_url ? <img src={p.image_url} alt="" style={{ width: 64, height: 80, objectFit: "cover" }} /> : <div style={{ width: 64, height: 80, background: "#eee" }} />}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 18 }}>
              {p.name}
              {!p.published ? <span style={badge("#7a7a7a")}>hidden</span> : null}
            </div>
            <div style={muted}>{p.rows.filter((r) => r.text).map((r) => r.label).join(" · ") || "No story yet"}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button type="button" style={small} disabled={i === 0} onClick={() => act({ action: "movePlate", id: p.id, dir: -1 })} aria-label="Move up">
              ↑
            </button>
            <button type="button" style={small} disabled={i === (data?.plates.length ?? 0) - 1} onClick={() => act({ action: "movePlate", id: p.id, dir: 1 })} aria-label="Move down">
              ↓
            </button>
            <button
              type="button"
              style={small}
              onClick={() =>
                setEditing({ id: p.id, name: p.name, image: p.image_url ?? "", alt: p.image_alt, rows: p.rows.map((r) => ({ ...r })), published: p.published })
              }
            >
              Edit
            </button>
            <button type="button" style={small} onClick={() => act({ action: "deletePlate", id: p.id }, `Delete "${p.name}"? This can't be undone.`)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </AdminShell>
  );
}

/* ---------------- /admin/reviews ---------------- */

type Review = {
  id: number;
  name: string;
  text: string;
  rating: number | null;
  source: string;
  review_date: string | null;
  shown: boolean;
  keep: number[] | null;
  is_new: boolean;
  fromGoogle: boolean;
  sentences: string[];
};
type ReviewDraft = { id?: number; name: string; text: string; rating: string; source: string; date: string; shown: boolean };
type GoogleLoc = { account: string; location: string; title: string; address: string };
type GoogleStatus = {
  configured: boolean;
  connected: boolean;
  email: string;
  location: GoogleLoc | null;
  lastSync: { at: string; total: number; added: number; updated: number; removed: number; average: number | null; error: string } | null;
};

const NEW_REVIEW: ReviewDraft = { name: "", text: "", rating: "5", source: "site", date: "", shown: true };
const SOURCE_LABEL: Record<string, string> = { google: "Google", site: "Old website", email: "Email / message" };
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** Where the reviews come from: the Google connection, its last check, and "Check now". */
function GoogleCard({ google, reload, setError }: { google: GoogleStatus; reload: () => void; setError: (e: string) => void }) {
  const [busy, setBusy] = useState("");
  const [locations, setLocations] = useState<GoogleLoc[] | null>(null);
  const q = new URLSearchParams(window.location.search);
  const sync = google.lastSync;

  async function run(label: string, body: object, after?: (data: Record<string, unknown>) => void) {
    setBusy(label);
    setError("");
    const r = await adminPost(body);
    setBusy("");
    if (!r.ok) setError(r.error ?? "Couldn't reach Google.");
    else after?.(r.data ?? {});
    reload();
  }

  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>Google reviews</div>
      {q.get("google") === "error" ? <p style={{ color: "var(--rust-deep)", margin: "0 0 8px" }}>{q.get("message")}</p> : null}
      {!google.configured ? (
        <p style={{ ...muted, margin: 0 }}>Coming soon: your Google reviews will arrive here by themselves, ready for you to pick from.</p>
      ) : !google.connected ? (
        <>
          <p style={{ ...muted, marginTop: 0 }}>Once connected, your Google reviews arrive here by themselves every day. New ones wait, hidden, until you choose to show them.</p>
          <button type="button" style={buttonStyle} disabled={Boolean(busy)} onClick={() => run("connect", { action: "googleConnect" }, (d) => (window.location.href = String(d.url)))}>
            {busy ? "Opening Google…" : "Connect Google"}
          </button>
          <div style={{ ...muted, marginTop: 6 }}>One-time setup, signed in as a manager of the Business Profile.</div>
        </>
      ) : !google.location ? (
        <>
          <p style={{ ...muted, marginTop: 0 }}>Connected as {google.email || "your Google account"}. Which Business Profile is yours?</p>
          {locations === null ? (
            <button
              type="button"
              style={small}
              disabled={Boolean(busy)}
              onClick={async () => {
                setBusy("find");
                const res = await fetch("/api/admin/content?area=google-locations");
                const d = await res.json().catch(() => ({}));
                setBusy("");
                if (!res.ok) return setError(d.error ?? "Couldn't reach Google.");
                setLocations(d.locations ?? []);
              }}
            >
              {busy === "find" ? "Looking…" : "Find my profiles"}
            </button>
          ) : locations.length === 0 ? (
            <p style={muted}>This Google account doesn't manage any Business Profiles yet.</p>
          ) : (
            locations.map((l) => (
              <div key={l.location} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--line)" }}>
                <span>
                  {l.title}
                  {l.address ? <span style={muted}> · {l.address}</span> : null}
                </span>
                <button type="button" style={small} disabled={Boolean(busy)} onClick={() => run("pick", { action: "googleSetLocation", account: l.account, location: l.location })}>
                  {busy === "pick" ? "Bringing them in…" : "Use this one"}
                </button>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize: 15 }}>
            From <strong>{google.location.title}</strong>
            {sync && !sync.error ? ` · ${sync.total} reviews${sync.average ? ` · ${sync.average.toFixed(1)}★` : ""}` : ""}
          </div>
          <div style={{ ...muted, margin: "4px 0 10px" }}>
            {sync ? `Checked ${when(sync.at)}. ` : ""}New reviews arrive by themselves every morning.
          </div>
          {sync?.error ? <p style={{ color: "var(--rust-deep)", fontSize: 14, margin: "0 0 10px" }}>Last check didn't work: {sync.error}</p> : null}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={small} disabled={Boolean(busy)} onClick={() => run("sync", { action: "googleSync" })}>
              {busy === "sync" ? "Checking…" : "Check now"}
            </button>
            <button
              type="button"
              style={{ ...small, borderColor: "transparent", color: "var(--ink-soft)" }}
              disabled={Boolean(busy)}
              onClick={() => window.confirm("Disconnect Google? Reviews already here stay, but new ones stop coming in.") && run("disconnect", { action: "googleDisconnect" })}
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Shorten a review: tap sentences to leave them out. The words stay the reviewer's. */
function SentencePicker({ review, onDone, setError }: { review: Review; onDone: () => void; setError: (e: string) => void }) {
  const all = review.sentences;
  const [keep, setKeep] = useState<Set<number>>(() => new Set(review.keep ?? all.map((_, i) => i)));
  const [busy, setBusy] = useState(false);
  const list = [...keep].sort((a, b) => a - b);

  async function save(next: number[] | null) {
    setBusy(true);
    const r = await adminPost({ action: "keepSentences", id: review.id, keep: next });
    setBusy(false);
    if (!r.ok) return setError(r.error ?? "Couldn't save.");
    onDone();
  }

  return (
    <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 12 }}>
      <div style={labelStyle}>Tap a sentence to leave it out</div>
      <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        {all.map((s, i) => {
          const on = keep.has(i);
          return (
            <button
              key={i}
              type="button"
              aria-pressed={on}
              onClick={() => {
                const next = new Set(keep);
                if (on) next.delete(i);
                else next.add(i);
                if (next.size) setKeep(next);
              }}
              style={{
                textAlign: "left",
                font: "15px/1.45 Georgia, serif",
                padding: "8px 10px",
                cursor: "pointer",
                border: on ? "1px solid var(--ink)" : "1px dashed var(--line)",
                background: on ? "#fff" : "transparent",
                color: on ? "var(--ink)" : "#9a958a",
                textDecoration: on ? "none" : "line-through",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
      <div style={labelStyle}>On the site</div>
      <p style={{ margin: "0 0 12px", fontSize: 15, fontStyle: "italic" }}>“{excerpt(all, list)}”</p>
      <button type="button" style={buttonStyle} disabled={busy} onClick={() => save(list.length === all.length ? null : list)}>
        {busy ? "Saving…" : "Save"}
      </button>{" "}
      <button type="button" style={secondaryButtonStyle} disabled={busy} onClick={() => save(null)}>
        Use the whole review
      </button>{" "}
      <button type="button" style={{ ...secondaryButtonStyle, borderColor: "transparent" }} onClick={onDone}>
        Cancel
      </button>
    </div>
  );
}

export function AdminReviewsPage() {
  const { data, error, load, setError } = useArea<{ reviews: Review[]; googleUrl: string; google: GoogleStatus }>("reviews");
  const [editing, setEditing] = useState<ReviewDraft | null>(null);
  const [shortening, setShortening] = useState<number | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState(false);

  async function act(body: object, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const r = await adminPost(body);
    if (!r.ok) setError(r.error ?? "Couldn't save.");
    load();
  }

  const reviews = data?.reviews ?? [];
  const counts = { new: reviews.filter((r) => r.is_new).length, showing: reviews.filter((r) => r.shown).length, hidden: reviews.filter((r) => !r.shown).length };
  // Open on the new arrivals when there are some, otherwise on what's showing.
  const current = filter ?? (counts.new ? "new" : "showing");
  const list = reviews.filter((r) => (current === "new" ? r.is_new : current === "showing" ? r.shown : current === "hidden" ? !r.shown : true));

  return (
    <AdminShell title="Reviews" help="reviews">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Reviews</h1>
        <button type="button" style={secondaryButtonStyle} onClick={() => setEditing({ ...NEW_REVIEW })}>
          Add one by hand
        </button>
      </div>
      <p style={{ ...muted, marginBottom: 22 }}>
        "From the table" on the home page shows the first 4 reviews marked Showing. Showing a review puts it first; use the arrows to fine-tune the order.
        You can shorten a review to its best sentences, but the words stay the reviewer's own.
      </p>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}

      {data ? <GoogleCard google={data.google} reload={load} setError={setError} /> : null}

      <div style={{ ...card, padding: 18 }}>
        <label style={labelStyle}>Link to your Google reviews (filled in for you once Google is connected)</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={{ ...field, marginBottom: 0 }}
            value={googleUrl ?? data?.googleUrl ?? ""}
            onChange={(e) => {
              setGoogleUrl(e.target.value);
              setSavedUrl(false);
            }}
            placeholder="https://g.page/r/…"
          />
          <button
            type="button"
            style={small}
            onClick={async () => {
              const r = await adminPost({ action: "saveSetting", key: "google_reviews_url", value: googleUrl ?? data?.googleUrl ?? "" });
              if (!r.ok) return setError(r.error ?? "Couldn't save.");
              setSavedUrl(true);
            }}
          >
            {savedUrl ? "Saved" : "Save"}
          </button>
        </div>
        <div style={{ ...muted, marginTop: 6 }}>Adds a "Read all reviews on Google" link under the reviews.</div>
      </div>

      {editing ? (
        <form
          style={{ ...card, padding: 22, marginBottom: 28 }}
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await adminPost({ action: "saveReview", id: editing.id, review: editing });
            if (!r.ok) return setError(r.error ?? "Couldn't save.");
            setEditing(null);
            load();
          }}
        >
          <h2 style={{ fontSize: 22, marginTop: 0 }}>{editing.id ? "Edit review" : "Add a review by hand"}</h2>
          <p style={{ ...muted, marginTop: -6 }}>For reviews from your old website, emails or messages. Google reviews come in by themselves.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0 14px" }}>
            <div>
              <label style={labelStyle}>Name (as shown)</label>
              <input style={field} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required placeholder="Sarah M." />
            </div>
            <div>
              <label style={labelStyle}>Stars</label>
              <select style={field} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: e.target.value })}>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="">Don't show stars</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>From</label>
              <select style={field} value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })}>
                {Object.entries(SOURCE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date (optional)</label>
              <input type="date" style={field} value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            </div>
          </div>
          <label style={labelStyle}>Review, exactly as written</label>
          <textarea style={{ ...field, minHeight: 110 }} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} required />
          <label style={{ display: "block", fontSize: 14, marginBottom: 18 }}>
            <input type="checkbox" checked={editing.shown} onChange={(e) => setEditing({ ...editing, shown: e.target.checked })} /> Show on the site
          </label>
          <button type="submit" style={buttonStyle}>
            Save review
          </button>{" "}
          <button type="button" style={secondaryButtonStyle} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </form>
      ) : null}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 18px" }}>
        {(
          [
            ...(counts.new ? [["new", `New from Google (${counts.new})`]] : []),
            ["showing", `Showing (${counts.showing})`],
            ["hidden", `Hidden (${counts.hidden})`],
            ["all", `All (${reviews.length})`],
          ] as [string, string][]
        ).map(([k, v]) => (
          <button key={k} type="button" style={{ ...small, background: current === k ? "var(--ink)" : "transparent", color: current === k ? "#fff" : "var(--ink)" }} onClick={() => setFilter(k)}>
            {v}
          </button>
        ))}
      </div>

      {!data ? <p>Loading…</p> : list.length === 0 ? <p>Nothing here.</p> : null}
      {list.map((r, i) => (
        <div key={r.id} style={{ ...card, opacity: r.shown || shortening === r.id ? 1 : 0.75 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <strong>
              {r.rating ? `${"★".repeat(r.rating)} ` : ""}
              {r.name}
              {r.is_new ? <span style={badge("#a85a22")}>new</span> : null}
              <span style={badge(r.shown ? "#3a5a40" : "#7a7a7a")}>{r.shown ? "showing" : "hidden"}</span>
            </strong>
            <span style={muted}>
              {SOURCE_LABEL[r.source] ?? r.source}
              {r.review_date ? ` · ${r.review_date}` : ""}
            </span>
          </div>
          <p style={{ margin: "8px 0 4px", fontSize: 15 }}>{r.text}</p>
          {r.keep ? <div style={{ ...muted, fontSize: 13, marginBottom: 8 }}>Shortened from the full review</div> : <div style={{ height: 8 }} />}
          {shortening === r.id ? (
            <SentencePicker
              review={r}
              setError={setError}
              onDone={() => {
                setShortening(null);
                load();
              }}
            />
          ) : (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button type="button" style={small} disabled={i === 0} onClick={() => act({ action: "moveReview", id: r.id, dir: -1 })} aria-label="Move up">
                ↑
              </button>
              <button type="button" style={small} disabled={i === list.length - 1} onClick={() => act({ action: "moveReview", id: r.id, dir: 1 })} aria-label="Move down">
                ↓
              </button>
              <button type="button" style={r.shown ? small : { ...small, background: "var(--pine)", color: "#fff", borderColor: "var(--pine)" }} onClick={() => act({ action: "setReviewShown", id: r.id, shown: !r.shown })}>
                {r.shown ? "Hide" : "Show on site"}
              </button>
              {r.sentences.length > 1 ? (
                <button type="button" style={small} onClick={() => setShortening(r.id)}>
                  Shorten
                </button>
              ) : null}
              {r.fromGoogle ? null : (
                <>
                  <button
                    type="button"
                    style={small}
                    onClick={() => setEditing({ id: r.id, name: r.name, text: r.sentences.join(" "), rating: r.rating ? String(r.rating) : "", source: r.source, date: r.review_date ?? "", shown: r.shown })}
                  >
                    Edit
                  </button>
                  <button type="button" style={small} onClick={() => act({ action: "deleteReview", id: r.id }, `Delete the review from ${r.name}?`)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </AdminShell>
  );
}

/* ---------------- /admin/inquiries ---------------- */

type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  guests: number | null;
  experience: string | null;
  location: string | null;
  details: string | null;
  status: string;
  notified: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = { new: "New", replied: "Replied", booked: "Booked", closed: "Closed" };
const STATUS_COLOR: Record<string, string> = { new: "#a85a22", replied: "#5b6b4a", booked: "#1f3327", closed: "#7a7a7a" };

export function AdminInquiriesPage() {
  const { data, error, load, setError } = useArea<{ inquiries: Inquiry[] }>("inquiries");
  const [filter, setFilter] = useState("open");

  const list = (data?.inquiries ?? []).filter((q) => (filter === "open" ? q.status === "new" || q.status === "replied" : filter === "all" ? true : q.status === filter));

  return (
    <AdminShell title="Inquiries" help="inquiries">
      <h1 style={{ fontSize: 28, margin: 0 }}>Private dining inquiries</h1>
      <p style={{ ...muted, marginBottom: 18 }}>From the form on the Private Chef page. Each one is also emailed to you; reply to that email to answer the guest.</p>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {[
          ["open", "Open"],
          ["booked", "Booked"],
          ["closed", "Closed"],
          ["all", "All"],
        ].map(([k, v]) => (
          <button key={k} type="button" style={{ ...small, background: filter === k ? "var(--ink)" : "transparent", color: filter === k ? "#fff" : "var(--ink)" }} onClick={() => setFilter(k)}>
            {v}
          </button>
        ))}
      </div>
      {!data ? <p>Loading…</p> : list.length === 0 ? <p>Nothing here.</p> : null}
      {list.map((q) => (
        <article key={q.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 18 }}>
              {q.name}
              <span style={badge(STATUS_COLOR[q.status] ?? "#7a7a7a")}>{STATUS_LABEL[q.status] ?? q.status}</span>
            </strong>
            <span style={muted}>
              {new Date(q.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              {q.notified ? "" : " · not emailed"}
            </span>
          </div>
          <div style={{ margin: "8px 0", fontSize: 15 }}>
            {[q.event_date, q.guests ? `${q.guests} guests` : null, q.experience, q.location].filter(Boolean).join(" · ") || "No date or details given"}
          </div>
          {q.details ? <p style={{ margin: "0 0 10px", fontSize: 15, whiteSpace: "pre-line" }}>{q.details}</p> : null}
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            <a href={`mailto:${q.email}`}>{q.email}</a>
            {q.phone ? (
              <>
                {" · "}
                <a href={`tel:${q.phone.replace(/[^0-9+]/g, "")}`}>{q.phone}</a>
              </>
            ) : null}
          </div>
          <label style={{ ...labelStyle, display: "inline", marginRight: 8 }}>Status</label>
          <select
            value={q.status}
            style={{ ...field, width: "auto", marginBottom: 0, padding: "4px 8px" }}
            onChange={async (e) => {
              const r = await adminPost({ action: "setInquiryStatus", id: q.id, status: e.target.value });
              if (!r.ok) setError(r.error ?? "Couldn't save.");
              load();
            }}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </article>
      ))}
    </AdminShell>
  );
}
