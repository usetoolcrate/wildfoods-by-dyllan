import { MONTHS, MONTH_NAMES, centralDate, centralDay } from "./central.js";
import type { ReportRow } from "./reports.js";
import { type Cell, type Sheet, STYLE, buildXlsx, excelDate } from "./xlsx.js";

/* The /admin/reports spreadsheet, built on the server so the download is a plain
   link that works in every browser (a blob download built in the page didn't in
   Firefox). One row per sale, a month-by-month summary built from formulas over
   that sheet, and a notes tab for the CPA. */

const dollars = (cents: number) => Math.round(cents) / 100;
const round2 = (n: number) => Math.round(n * 100) / 100;

const HEAD = ["Date", "Order #", "Sold on", "Paid via", "Customer", "Items", "Promo code", "Order total", "Sales tax", "Fees", "Discount", "Refunded", "Net received", "Flag", "Note"];
const WIDTHS = [13, 11, 10, 17, 20, 56, 13, 12, 11, 10, 10, 10, 13, 13, 44];

export const NO_TAX_FLAG = "No sales tax";
export const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const GAP_NOTE =
  "The old site's records come from its backup taken Oct 8, 2026 (its first sale was Mar 1, 2024; its last, Sep 23, 2026). Any sales from Oct 9 to Oct 16, when this site replaced it, aren't in the backup. WooPayments has them.";

function notesFor(label: string, rows: ReportRow[]): string[] {
  const stripeFeesMissing = rows.some((r) => r.via === "Stripe" && r.fee == null);
  return [
    `Every sale taken online in ${label}, one row per order. Dates are Central time; amounts are US dollars.`,
    "Old site = the WordPress shop (WooPayments; GoDaddy Payments in 2024; one PayPal order). This site = wildfoodsbydyllan.com ticket and gift certificate sales through Stripe, since Oct 16, 2026.",
    GAP_NOTE,
    "Order total is what the customer paid: after any discount, including sales tax. Net received = Order total − Fees − Refunded.",
    "Fees are the card processing fees. They're on record for WooPayments and Stripe; GoDaddy Payments and PayPal fees aren't in the old site's backup, so those rows have no fee or net.",
    ...(stripeFeesMissing ? ["Stripe fees for some of this site's sales weren't available when this file was made. Stripe's Payments page lists them."] : []),
    '"No sales tax" flags a sale with no sales tax charged. This site added 8.1% sales tax at checkout on Nov 10, 2026; sales before that had none. Gift certificates aren\'t taxed when sold.',
    "A refund is shown on the original sale's row (in the month it was sold), with the refund date in the Note column.",
    "Old-site order numbers match the orders in WooPayments.",
    'The By month tab totals the Sales tab by month. The totals row on the Sales tab follows the filter, so filtering the Flag column to "No sales tax" totals just those sales.',
    `Downloaded ${centralDay(new Date().toISOString())} from wildfoodsbydyllan.com/admin/reports.`,
  ];
}

/** The rows for a year (and optionally a month, or only untaxed sales), as an .xlsx file. */
export function reportFile(all: ReportRow[], opts: { year: number; month: number; noTax: boolean }): { bytes: Uint8Array; filename: string } {
  const rows = all.filter((r) => {
    const p = centralDate(r.paidAt);
    return p.y === opts.year && (!opts.month || p.m === opts.month) && (!opts.noTax || r.noTax);
  });
  const label = `${opts.month ? `${MONTH_NAMES[opts.month - 1]} ` : ""}${opts.year}${opts.noTax ? " (only sales with no sales tax)" : ""}`;
  const filename = `wild-foods-sales-${opts.year}${opts.month ? `-${String(opts.month).padStart(2, "0")}` : ""}${opts.noTax ? "-no-tax" : ""}.xlsx`;
  return { bytes: reportWorkbook(rows, notesFor(label, rows)), filename };
}

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
