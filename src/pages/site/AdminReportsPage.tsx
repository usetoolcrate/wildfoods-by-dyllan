import { useEffect, useMemo, useState } from "react";
import { MONTH_NAMES, centralDate, centralDay } from "@/lib/central";
import { AdminShell, badge, card, labelStyle, muted } from "@/pages/site/AdminKit";
import { buttonStyle } from "@/pages/site/AdminRecipesPage";

/* /admin/reports: every sale taken online (the old WordPress shop and this site),
   for Dyllan's CPA and his Missouri sales tax. Sales with no tax are flagged, and
   the download is a plain link to an .xlsx the server builds (api/_lib/salesReport.ts). */

// Mirrors ReportRow in api/_lib/reports.ts.
type ReportRow = {
  id: string;
  paidAt: string;
  site: "Old site" | "This site";
  via: "WooPayments" | "PayPal" | "GoDaddy Payments" | "Stripe";
  order: string;
  customer: string | null;
  items: string;
  kind: "sale" | "gift";
  total: number;
  tax: number;
  fee: number | null;
  discount: number;
  refunded: number;
  net: number | null;
  promo: string | null;
  noTax: boolean;
  note: string | null;
};

type Report = { mode: "test" | "live"; rows: ReportRow[]; feesMissing: boolean };

const money = (c: number | null) => (c == null ? "—" : (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" }));

const RUST = "#a4471f";
const FLAG_BG = "#fbeee6";

const select: React.CSSProperties = { padding: "8px 10px", border: "1px solid var(--line)", background: "#fff", fontFamily: "Georgia, serif", fontSize: 15 };
// labelStyle is display:block, which would stack the header cells; keep them table cells.
const th: React.CSSProperties = { ...labelStyle, display: "table-cell", textAlign: "left", padding: "8px 10px", borderBottom: "1px solid var(--ink)", marginBottom: 0, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "10px", borderBottom: "1px solid var(--line)", verticalAlign: "top", fontSize: 14 };
const num: React.CSSProperties = { ...td, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

const GAP_NOTE =
  "The old site's records come from its backup taken Oct 8, 2026 (its first sale was Mar 1, 2024; its last, Sep 23, 2026). Any sales from Oct 9 to Oct 16, when this site replaced it, aren't in the backup. WooPayments has them.";

export function AdminReportsPage() {
  return (
    <AdminShell title="Reports" wide>
      <Reports />
    </AdminShell>
  );
}

function Reports() {
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [onlyNoTax, setOnlyNoTax] = useState(false);

  useEffect(() => {
    fetch("/api/admin/tickets?view=report")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const d = (await r.json()) as Report;
        setData(d);
        setYear(Math.max(0, ...d.rows.map((x) => centralDate(x.paidAt).y)) || new Date().getFullYear());
      })
      .catch(() => setError("Couldn't load the report. Refresh to try again."));
  }, []);

  const rows = data?.rows ?? [];
  const years = useMemo(() => [...new Set(rows.map((r) => centralDate(r.paidAt).y))].sort((a, b) => b - a), [rows]);
  const inPeriod = useMemo(
    () =>
      rows.filter((r) => {
        const p = centralDate(r.paidAt);
        return p.y === year && (!month || p.m === month);
      }),
    [rows, year, month],
  );
  const shown = useMemo(() => (onlyNoTax ? inPeriod.filter((r) => r.noTax) : inPeriod), [inPeriod, onlyNoTax]);
  const newestFirst = useMemo(() => [...shown].sort((a, b) => b.paidAt.localeCompare(a.paidAt)), [shown]);

  const t = useMemo(() => {
    const sum = (list: ReportRow[], pick: (r: ReportRow) => number | null) => list.reduce((n, r) => n + (pick(r) ?? 0), 0);
    const noTax = inPeriod.filter((r) => r.noTax);
    return {
      count: shown.length,
      total: sum(shown, (r) => r.total),
      tax: sum(shown, (r) => r.tax),
      fee: sum(shown, (r) => r.fee),
      refunded: sum(shown, (r) => r.refunded),
      net: sum(shown, (r) => r.net),
      feeGaps: shown.filter((r) => r.fee == null).length,
      noTaxCount: noTax.length,
      noTaxTotal: sum(noTax, (r) => r.total),
    };
  }, [shown, inPeriod]);

  const label = `${month ? `${MONTH_NAMES[month - 1]} ` : ""}${year}`;

  // A plain link: the server builds the file and sends it as an attachment, which every browser downloads.
  const downloadUrl = `/api/admin/tickets?view=report&format=xlsx&year=${year}${month ? `&month=${month}` : ""}${onlyNoTax ? "&noTax=1" : ""}`;

  if (error) return <p className="notice err">{error}</p>;
  if (!data) return <p style={muted}>Loading sales…</p>;

  const tiles: [string, string, string?][] = [
    ["Sales", String(t.count)],
    ["Order totals", money(t.total)],
    ["Sales tax", money(t.tax)],
    ["Fees", money(t.fee), t.feeGaps ? `${t.feeGaps} ${t.feeGaps === 1 ? "sale" : "sales"} with no fee on record` : undefined],
    ["Refunds", money(t.refunded)],
    ["Net received", money(t.net)],
  ];

  return (
    <>
      <h1 style={{ fontSize: 28, marginTop: 0, marginBottom: 6 }}>Reports</h1>
      <p style={{ ...muted, marginTop: 0, marginBottom: 22 }}>
        Every sale taken online: the old WordPress shop, and this site since Oct 16. For your CPA and your sales tax.
      </p>

      {data.mode === "test" ? (
        <p style={{ ...card, background: "#f4efe6" }}>Test mode: this site's rows here are test checkouts, not real sales.</p>
      ) : null}

      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", marginBottom: 18 }}>
        <label>
          <span style={labelStyle}>Year</span>
          <select style={select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {(years.length ? years : [year]).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span style={labelStyle}>Month</span>
          <select style={select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            <option value={0}>All months</option>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 15, padding: "8px 0" }}>
          <input type="checkbox" checked={onlyNoTax} onChange={(e) => setOnlyNoTax(e.target.checked)} />
          Only sales with no sales tax
        </label>
        {shown.length ? (
          <a href={downloadUrl} download style={{ ...buttonStyle, marginLeft: "auto", display: "inline-block", textDecoration: "none" }}>
            Download spreadsheet
          </a>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 14 }}>
        {tiles.map(([name, value, note]) => (
          <div key={name} style={{ ...card, marginBottom: 0, padding: "12px 14px" }}>
            <div style={{ ...labelStyle, marginBottom: 6 }}>{name}</div>
            <div style={{ fontSize: 20 }}>{value}</div>
            {note ? <div style={{ ...muted, fontSize: 12, marginTop: 4 }}>{note}</div> : null}
          </div>
        ))}
      </div>

      {t.noTaxCount ? (
        <p style={{ ...card, background: FLAG_BG, borderColor: "#ecc9b3", fontSize: 15 }}>
          <span style={{ ...badge(RUST), marginLeft: 0, marginRight: 8 }}>No tax</span>
          {t.noTaxCount} {t.noTaxCount === 1 ? "sale" : "sales"} in {label} had no sales tax charged ({money(t.noTaxTotal)} in all). They're flagged below and in
          the spreadsheet.
        </p>
      ) : null}

      <p style={{ ...muted, fontSize: 13, marginBottom: 6 }}>{GAP_NOTE}</p>
      {data.mode === "live" && data.feesMissing ? (
        <p style={{ ...muted, fontSize: 13, marginBottom: 6 }}>
          Stripe fees for this site's sales aren't connected yet. Until they are, Stripe's Payments page shows them.
        </p>
      ) : null}

      <div style={{ overflowX: "auto", marginTop: 16, border: "1px solid var(--line)", background: "#fff" }}>
        <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Order</th>
              <th style={th}>What</th>
              <th style={{ ...th, textAlign: "right" }}>Total</th>
              <th style={{ ...th, textAlign: "right" }}>Tax</th>
              <th style={{ ...th, textAlign: "right" }}>Fees</th>
              <th style={{ ...th, textAlign: "right" }}>Net</th>
            </tr>
          </thead>
          <tbody>
            {newestFirst.map((r) => {
              const extra = [
                r.customer,
                r.discount ? `Discount ${money(r.discount)}${r.promo ? ` (${r.promo})` : ""}` : r.promo ? `Code ${r.promo}` : null,
                r.refunded ? `Refunded ${money(r.refunded)}` : null,
                r.note,
              ].filter(Boolean);
              return (
                <tr key={r.id} style={r.noTax ? { background: FLAG_BG } : undefined}>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>{centralDay(r.paidAt)}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {r.order}
                    <div style={{ ...muted, fontSize: 12 }}>
                      {r.site} · {r.via}
                    </div>
                  </td>
                  <td style={td}>
                    {r.items}
                    {r.noTax ? <span style={badge(RUST)}>No tax</span> : null}
                    {extra.length ? <div style={{ ...muted, fontSize: 12, marginTop: 3 }}>{extra.join(" · ")}</div> : null}
                  </td>
                  <td style={num}>{money(r.total)}</td>
                  <td style={{ ...num, color: r.noTax ? RUST : undefined }}>{money(r.tax)}</td>
                  <td style={num}>{money(r.fee)}</td>
                  <td style={num}>{money(r.net)}</td>
                </tr>
              );
            })}
            {!newestFirst.length ? (
              <tr>
                <td style={{ ...td, ...muted }} colSpan={7}>
                  No sales in {label}
                  {onlyNoTax ? " without sales tax" : ""}.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
