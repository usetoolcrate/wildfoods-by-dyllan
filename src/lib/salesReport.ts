import { MONTHS, centralDate } from "@/lib/central";
import { type Cell, type Sheet, STYLE, buildXlsx, excelDate } from "@/lib/xlsx";

/* The /admin/reports data and its spreadsheet: one row per sale, a month-by-month
   summary built from formulas over that sheet, and a notes tab for the CPA. */

export type ReportRow = {
  id: string;
  paidAt: string;
  site: "Old site" | "This site";
  via: "WooPayments" | "PayPal" | "Stripe";
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

const dollars = (cents: number) => Math.round(cents) / 100;
const round2 = (n: number) => Math.round(n * 100) / 100;

const HEAD = ["Date", "Order #", "Sold on", "Paid via", "Customer", "Items", "Promo code", "Order total", "Sales tax", "Fees", "Discount", "Refunded", "Net received", "Flag", "Note"];
const WIDTHS = [13, 11, 10, 13, 20, 56, 13, 12, 11, 10, 10, 10, 13, 13, 44];

export const NO_TAX_FLAG = "No sales tax";

export function reportWorkbook(rows: ReportRow[], notes: string[]): Uint8Array {
  const sorted = [...rows].sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  const first = 2;
  const last = sorted.length + 1;

  const sales: Cell[][] = [HEAD.map((h) => ({ v: h, s: STYLE.header }))];
  sorted.forEach((r, i) => {
    const n = i + 2;
    const flag = r.noTax;
    const t = flag ? STYLE.flag : STYLE.plain;
    const $ = flag ? STYLE.flagMoney : STYLE.money;
    const { y, m, d } = centralDate(r.paidAt);
    sales.push([
      { v: excelDate(y, m, d), s: flag ? STYLE.flagDate : STYLE.date },
      { v: r.order, s: t },
      { v: r.site, s: t },
      { v: r.via, s: t },
      { v: r.customer ?? "", s: t },
      { v: r.items, s: flag ? STYLE.flagWrapLine : STYLE.wrapLine },
      { v: r.promo ?? "", s: t },
      { v: dollars(r.total), s: $ },
      { v: dollars(r.tax), s: $ },
      { v: r.fee == null ? null : dollars(r.fee), s: $ },
      { v: dollars(r.discount), s: $ },
      { v: dollars(r.refunded), s: $ },
      r.fee == null ? { v: null, s: $ } : { f: `H${n}-J${n}-L${n}`, v: round2(dollars(r.total) - dollars(r.fee) - dollars(r.refunded)), s: $ },
      { v: flag ? NO_TAX_FLAG : "", s: t },
      { v: r.note ?? "", s: flag ? STYLE.flagWrapLine : STYLE.wrapLine },
    ]);
  });
  const sum = (col: string, pick: (r: ReportRow) => number | null): Cell => ({
    // SUBTOTAL(109) skips rows hidden by the filter, so filtering to "No sales tax" totals just those.
    f: `SUBTOTAL(109,${col}${first}:${col}${Math.max(last, first)})`,
    v: round2(sorted.reduce((n, r) => n + dollars(pick(r) ?? 0), 0)),
    s: STYLE.boldMoney,
  });
  sales.push([
    { v: "Total", s: STYLE.bold },
    { v: `${sorted.length} sales`, s: STYLE.bold },
    ...Array.from({ length: 5 }, () => ({ v: "", s: STYLE.bold })),
    sum("H", (r) => r.total),
    sum("I", (r) => r.tax),
    sum("J", (r) => r.fee),
    sum("K", (r) => r.discount),
    sum("L", (r) => r.refunded),
    sum("M", (r) => (r.fee == null ? null : r.total - r.fee - r.refunded)),
    { v: "", s: STYLE.bold },
    { v: "", s: STYLE.bold },
  ]);

  // By month: every figure is a SUMIFS/COUNTIFS over the Sales tab, so edits there flow through.
  const months: { y: number; m: number }[] = [];
  for (const r of sorted) {
    const { y, m } = centralDate(r.paidAt);
    if (!months.some((x) => x.y === y && x.m === m)) months.push({ y, m });
  }
  const A = `Sales!$A$${first}:$A$${Math.max(last, first)}`;
  const col = (c: string) => `Sales!$${c}$${first}:$${c}$${Math.max(last, first)}`;
  const byMonth: Cell[][] = [
    ["Month", "Sales", "Order totals", "Sales tax", "Fees", "Discounts", "Refunds", "Net received", "Sales with no tax", "Totals with no tax"].map((h) => ({ v: h, s: STYLE.header })),
  ];
  for (const { y, m } of months) {
    const ny = m === 12 ? y + 1 : y;
    const nm = m === 12 ? 1 : m + 1;
    const inMonth = sorted.filter((r) => {
      const p = centralDate(r.paidAt);
      return p.y === y && p.m === m;
    });
    const range = `${A},">="&DATE(${y},${m},1),${A},"<"&DATE(${ny},${nm},1)`;
    const total = (pick: (r: ReportRow) => number | null, list = inMonth) => round2(list.reduce((n, r) => n + dollars(pick(r) ?? 0), 0));
    const noTax = inMonth.filter((r) => r.noTax);
    byMonth.push([
      { v: `${MONTHS[m - 1]} ${y}` },
      { f: `COUNTIFS(${range})`, v: inMonth.length, s: STYLE.count },
      { f: `SUMIFS(${col("H")},${range})`, v: total((r) => r.total), s: STYLE.money },
      { f: `SUMIFS(${col("I")},${range})`, v: total((r) => r.tax), s: STYLE.money },
      { f: `SUMIFS(${col("J")},${range})`, v: total((r) => r.fee), s: STYLE.money },
      { f: `SUMIFS(${col("K")},${range})`, v: total((r) => r.discount), s: STYLE.money },
      { f: `SUMIFS(${col("L")},${range})`, v: total((r) => r.refunded), s: STYLE.money },
      { f: `SUMIFS(${col("M")},${range})`, v: total((r) => (r.fee == null ? null : r.total - r.fee - r.refunded)), s: STYLE.money },
      { f: `COUNTIFS(${range},${col("N")},"${NO_TAX_FLAG}")`, v: noTax.length, s: STYLE.count },
      { f: `SUMIFS(${col("H")},${range},${col("N")},"${NO_TAX_FLAG}")`, v: total((r) => r.total, noTax), s: STYLE.money },
    ]);
  }
  const mLast = months.length + 1;
  const mSum = (c: string, i: number, count = false): Cell => ({
    f: `SUM(${c}2:${c}${Math.max(mLast, 2)})`,
    v: round2(byMonth.slice(1).reduce((n, row) => n + Number(row[i]?.v ?? 0), 0)),
    s: count ? STYLE.boldCount : STYLE.boldMoney,
  });
  byMonth.push([
    { v: "Total", s: STYLE.bold },
    mSum("B", 1, true),
    mSum("C", 2),
    mSum("D", 3),
    mSum("E", 4),
    mSum("F", 5),
    mSum("G", 6),
    mSum("H", 7),
    mSum("I", 8, true),
    mSum("J", 9),
  ]);

  const notesSheet: Cell[][] = [[{ v: "Wild Foods by Dyllan: online sales", s: STYLE.title }], [null], ...notes.map((t) => [{ v: t, s: STYLE.wrap }])];

  const sheets: Sheet[] = [
    { name: "Sales", widths: WIDTHS, rows: sales, freezeHeader: true, filterTo: Math.max(last, first) },
    { name: "By month", widths: [12, 8, 13, 12, 11, 11, 11, 13, 16, 17], rows: byMonth, freezeHeader: true },
    { name: "Notes", widths: [110], rows: notesSheet },
  ];
  return buildXlsx(sheets);
}
