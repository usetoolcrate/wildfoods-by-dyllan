// The /admin/how walkthroughs: one per admin page, drawn with the admin's own style
// objects (AdminKit, AdminRecipesPage) so they look like the real screens. Each is a pure
// function of t. If an admin screen's labels or layout change, update its demo here.
// Names, dates and the new reviews are examples.

import type { CSSProperties, ReactNode } from "react";
import { Banner, Bubble, Caret, Scene, Screen, Scroll, Sheet } from "@/demos/kit";
import { enter, keyed, prog, typed, typedEnd, win } from "@/demos/motion";
import type { Demo } from "@/demos/DemoPlayer";
import { badge, card, field, muted, small } from "@/pages/site/AdminKit";
import { buttonStyle, inputStyle, labelStyle, secondaryButtonStyle, wrapStyle } from "@/pages/site/AdminRecipesPage";
import { renderDinnerList, type SiteEvent } from "@/pages/v2";
import { excerpt, sentences } from "@/lib/sentences";

const HOST = "wildfoods-by-dyllan.vercel.app";
const PAPER = "var(--paper)";
const page: CSSProperties = { ...wrapStyle, padding: "18px 24px 40px" };
const btn = (s: CSSProperties, extra?: CSSProperties): CSSProperties => ({ ...s, display: "inline-block", ...extra });

// ---------- shared pieces ----------

/** The admin's top row: back link (or nothing on /admin) and Log out. */
const Bar = ({ home }: { home?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
    {home ? <span /> : <span style={{ ...labelStyle, marginBottom: 0 }}>← All admin</span>}
    <span style={btn(secondaryButtonStyle, { padding: "4px 10px" })}>Log out</span>
  </div>
);

const Label = ({ children }: { children: ReactNode }) => <div style={labelStyle}>{children}</div>;

/** An input or textarea. Shows the value, the placeholder, or a caret while focused. */
function Box({ v, ph, focus, tap, h, base = field, style, select }: { v?: string; ph?: string; focus?: boolean; tap?: string; h?: number; base?: CSSProperties; style?: CSSProperties; select?: boolean }) {
  return (
    <div
      data-tap={tap}
      style={{
        ...base,
        minHeight: h ?? 40,
        lineHeight: 1.4,
        whiteSpace: "pre-wrap",
        overflow: "hidden",
        display: select ? "flex" : "block",
        justifyContent: "space-between",
        color: v ? "var(--ink)" : "#9a958a",
        ...(focus ? { borderColor: "#4a90e2", boxShadow: "0 0 0 1px #4a90e2" } : null),
        ...style,
      }}
    >
      <span>
        {v || (focus ? "" : ph)}
        {focus ? <Caret /> : null}
      </span>
      {select ? <span style={{ color: "var(--ink-soft)" }}>▾</span> : null}
    </div>
  );
}

/** Typing into a field: its value at t and whether it has focus. Focus starts at `tap`. */
function typing(t: number, text: string, tap: number, cps = 14) {
  const start = tap + 0.15;
  const end = typedEnd(text, start, cps);
  return { v: t < start ? "" : typed(text, t, start, cps), focus: t >= tap && t < end + 0.5 };
}

/** A pasted value: the field gets focus at `tap`, the Paste bubble shows, and the text lands at `paste`. */
const pasting = (t: number, text: string, tap: number, paste: number) => ({ v: t >= paste + 0.1 ? text : "", focus: t >= tap && t < paste + 0.9, bubble: win(t, tap + 0.2, paste + 0.15, 0.2) });

const Check = ({ on, children }: { on: boolean; children: ReactNode }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, marginBottom: 18 }}>
    <span style={{ width: 15, height: 15, border: "1.5px solid var(--ink)", background: on ? "var(--pine)" : "#fff", color: "#fff", fontSize: 11, display: "grid", placeItems: "center" }}>{on ? "✓" : ""}</span>
    {children}
  </div>
);

const Radio = ({ on, tap, children }: { on: boolean; tap?: string; children: ReactNode }) => (
  <div data-tap={tap} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 15, marginBottom: 8 }}>
    <span style={{ flex: "none", marginTop: 3, width: 15, height: 15, borderRadius: "50%", border: "1.5px solid var(--ink)", display: "grid", placeItems: "center" }}>
      {on ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--pine)" }} /> : null}
    </span>
    <span>{children}</span>
  </div>
);

/** A highlight that fades in at `a` and out again over a couple of seconds. */
const glow = (t: number, a: number, hold = 1.8): CSSProperties => ({ boxShadow: `0 0 0 ${(3 * win(t, a, a + hold, 0.4)).toFixed(2)}px var(--rust)` });

const FileInput = ({ tap, name }: { tap: string; name?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
    <span data-tap={tap} style={{ border: "1px solid #8a8a8a", borderRadius: 4, background: "#efefef", padding: "3px 8px", fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
      Choose File
    </span>
    <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 13 }}>{name ?? "No file chosen"}</span>
  </div>
);

const PHOTOS = ["/images/g-raspberry-tart.jpg", "/images/dish-short-rib.webp", "/images/g-teal-course.jpg", "/images/g-local-produce.jpg", "/images/g-melon-course.jpg", "/images/plated-venison.jpg"];

/** The phone's photo picker; the photo at `pick` is the one that gets tapped. */
const PhotoSheet = ({ p, pick }: { p: number; pick: number }) => (
  <Sheet p={p} title="Photos">
    <div className="demo-photos">
      {PHOTOS.map((src, i) => (
        <img key={src} src={src} alt="" data-tap={i === pick ? "pick" : undefined} />
      ))}
    </div>
  </Sheet>
);

// ---------- 1. Getting in ----------

const ADMIN_URL = `${HOST}/admin`;
const HOME_TILES: [string, string][] = [
  ["Inquiries", "1 new"],
  ["Dinners & tickets", "2 upcoming"],
  ["Signature plates", "2 on the site"],
  ["Reviews", "2 on the site"],
  ["Recipes", "Add and edit recipes"],
  ["Questionnaire", "Answers from setup"],
  ["How-to videos", "Short walkthroughs of each page"],
];

function AdminHome({ t, from, tapFirst }: { t: number; from: number; tapFirst?: boolean }) {
  return (
    <div style={page}>
      <Bar home />
      <h1 style={{ fontSize: 28, marginTop: 0, marginBottom: 0 }}>Wild Foods admin</h1>
      <p style={{ ...muted, marginTop: 4, marginBottom: 24 }}>Everything on the site you can change yourself.</p>
      <div style={{ display: "grid", gap: 14 }}>
        {HOME_TILES.map(([name, note], i) => (
          <div key={name} data-tap={i === 0 && tapFirst ? "inq" : undefined} style={{ ...card, marginBottom: 0, ...enter(prog(t, from + 0.2 + i * 0.07)) }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{name}</div>
            <div style={muted}>{note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const GETTING_IN: Demo = {
  id: "getting-in",
  title: "Getting in",
  text: "Your admin lives at /admin on your website. Bookmark it or add it to your home screen, log in once, and every page you can change is one tap away.",
  duration: 13.5,
  chapters: [
    { at: 0, label: "Go to /admin" },
    { at: 3.8, label: "Log in with your password" },
    { at: 7.8, label: "Everything in one place" },
  ],
  taps: [
    [0.8, "url"],
    [4.8, "pw"],
    [6.7, "login"],
  ],
  render: (t) => {
    const url = t < 0.95 ? "" : typed(ADMIN_URL, t, 1.0);
    const pw = typing(t, "••••••••••", 4.8);
    return (
      <Screen url={t < 3.6 ? url : ADMIN_URL} focused={t >= 0.8 && t < 3.6} background={PAPER}>
        <Scene t={t} from={3.6} to={7.8}>
          <div style={{ ...page, maxWidth: 380, paddingTop: 48 }}>
            <h1 style={{ fontSize: 24, marginBottom: 20 }}>Wild Foods admin</h1>
            <Label>Password</Label>
            <Box tap="pw" base={inputStyle} {...pw} />
            <span data-tap="login" style={btn(buttonStyle)}>
              {t >= 6.75 ? "Checking…" : "Log in"}
            </span>
          </div>
        </Scene>
        <Scene t={t} from={7.8} to={99}>
          <Scroll y={keyed(t, [[0, 0], [10.2, 330]], 1.6)}>
            <AdminHome t={t} from={7.8} />
          </Scroll>
        </Scene>
      </Screen>
    );
  },
};

// ---------- 2. Inquiries ----------

const INQ = {
  name: "Sarah M.",
  when: "Oct 13, 9:41 AM",
  line: "Sat, Dec 19 · 12 guests · Chef's Table Plated · Ozark, MO",
  details: "Our parents' 40th anniversary. Dad doesn't eat shellfish.",
  email: "sarah@example.com",
  phone: "(417) 555-0142",
};

function InquiryCard({ status, style, tapStatus }: { status: "new" | "booked"; style?: CSSProperties; tapStatus?: boolean }) {
  return (
    <div style={{ ...card, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 18 }}>
          {INQ.name}
          <span style={badge(status === "new" ? "#a85a22" : "#1f3327")}>{status === "new" ? "New" : "Booked"}</span>
        </strong>
        <span style={muted}>{INQ.when}</span>
      </div>
      <div style={{ margin: "8px 0", fontSize: 15 }}>{INQ.line}</div>
      <p style={{ margin: "0 0 10px", fontSize: 15 }}>{INQ.details}</p>
      <div style={{ fontSize: 14, marginBottom: 12 }}>
        <u>{INQ.email}</u> · <u>{INQ.phone}</u>
      </div>
      <span style={{ ...labelStyle, display: "inline", marginRight: 8 }}>Status</span>
      <Box tap={tapStatus ? "status" : undefined} v={status === "new" ? "New" : "Booked"} select style={{ width: 120, display: "inline-flex", marginBottom: 0, padding: "4px 8px", minHeight: 0 }} />
    </div>
  );
}

function InquiriesPage({ children, filter = "open" }: { children: ReactNode; filter?: string }) {
  return (
    <div style={page}>
      <Bar />
      <h1 style={{ fontSize: 28, margin: 0 }}>Private dining inquiries</h1>
      <p style={{ ...muted, marginBottom: 18 }}>From the form on the Private Chef page. Each one is also emailed to you; reply to that email to answer the guest.</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {[
          ["open", "Open"],
          ["booked", "Booked"],
          ["closed", "Closed"],
          ["all", "All"],
        ].map(([k, v]) => (
          <span key={k} data-tap={`f-${k}`} style={btn(small, { background: filter === k ? "var(--ink)" : "transparent", color: filter === k ? "#fff" : "var(--ink)" })}>
            {v}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

const MAIL_BODY = `New private dining inquiry from ${INQ.name}

Date: Sat, Dec 19
Guests: 12
Experience: Chef's Table Plated
Where: Ozark, MO
Email: ${INQ.email}
Phone: ${INQ.phone}

What they're picturing:
${INQ.details}

Reply to this email to answer them directly.`;

export const INQUIRIES: Demo = {
  id: "inquiries",
  title: "Answering an inquiry",
  text: "When someone fills out “Check your date” on the Private Chef page, it shows up here and in your email. Hit reply in the email and it goes straight to the guest.",
  duration: 18.5,
  chapters: [
    { at: 0, label: "A new inquiry comes in" },
    { at: 3.6, label: "Every detail in one card" },
    { at: 8.0, label: "Hit reply in your email" },
    { at: 12.6, label: "Mark it booked" },
  ],
  taps: [
    [2.8, "inq"],
    [9.4, "reply"],
    [13.4, "status"],
    [14.3, "opt-booked"],
    [16.2, "f-booked"],
  ],
  render: (t) => {
    const booked = t >= 14.5;
    const onBookedTab = t >= 16.35;
    const cardGone = booked && !onBookedTab ? prog(t, 15.0, 0.3) : 0;
    const reply = typed("Hi Sarah, I'd love to cook for your parents' anniversary!", t, 10.6, 18);
    return (
      <>
        <Screen app={t >= 8.0 && t < 12.6 ? "Mail" : undefined} url={t < 3.6 ? ADMIN_URL : `${ADMIN_URL}/inquiries`} background={PAPER}>
          <Scene t={t} from={0} to={3.6}>
            <AdminHome t={t} from={-1} tapFirst />
          </Scene>
          <Scene t={t} from={3.6} to={8.0}>
            <InquiriesPage>
              <InquiryCard status="new" style={enter(prog(t, 4.0))} />
            </InquiriesPage>
          </Scene>
          <Scene t={t} from={8.0} to={12.6} style={{ background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif", color: "#1c1c1e" }}>
            <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.45 }}>
              <div style={{ color: "#6e6e73" }}>From: Wild Foods website</div>
              <div style={{ color: "#6e6e73", marginBottom: 10 }}>To: dyllan@wildfoodsbydyllan.com</div>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 12 }}>Private dining inquiry: {INQ.name} — Sat, Dec 19, 12 guests</div>
              <div style={{ whiteSpace: "pre-line" }}>{MAIL_BODY}</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 18px 18px", borderTop: "1px solid #e5e5ea", background: "#f9f9f9", display: "flex", justifyContent: "flex-end" }}>
              <span data-tap="reply" style={{ color: "#2f6fdd", fontWeight: 600, fontSize: 16 }}>
                ↩ Reply
              </span>
            </div>
            {t >= 9.7 ? (
              <div style={{ position: "absolute", inset: "40px 0 0", background: "#fff", borderRadius: "14px 14px 0 0", boxShadow: "0 -6px 24px rgba(0,0,0,.18)", padding: "14px 18px", fontSize: 15, ...enter(prog(t, 9.7), 60) }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 15 }}>
                  <span style={{ color: "#2f6fdd" }}>Cancel</span>
                  <strong>Re: Private dining inquiry</strong>
                  <span style={{ color: "#2f6fdd" }}>Send</span>
                </div>
                <div style={{ padding: "8px 0", borderBottom: "1px solid #e5e5ea", ...glow(t, 10.0, 2.2), borderRadius: 4 }}>
                  <span style={{ color: "#6e6e73" }}>To: </span>
                  {INQ.name} &lt;{INQ.email}&gt;
                </div>
                <div style={{ padding: "8px 0", borderBottom: "1px solid #e5e5ea", color: "#6e6e73" }}>Subject: Re: Private dining inquiry: {INQ.name}</div>
                <div style={{ paddingTop: 12, minHeight: 80 }}>
                  {reply}
                  <Caret />
                </div>
              </div>
            ) : null}
          </Scene>
          <Scene t={t} from={12.6} to={99}>
            <InquiriesPage filter={onBookedTab ? "booked" : "open"}>
              {cardGone < 1 ? <InquiryCard status={booked ? "booked" : "new"} tapStatus style={{ opacity: 1 - cardGone, ...(onBookedTab ? enter(prog(t, 16.4)) : null) }} /> : <p style={enter(prog(t, 15.3))}>Nothing here.</p>}
            </InquiriesPage>
          </Scene>
        </Screen>
        <Banner p={win(t, 0.4, 2.3)} app="Mail" title={`Private dining inquiry: ${INQ.name}`} text="Sat, Dec 19, 12 guests · Chef's Table Plated" />
        <Sheet p={win(t, 13.55, 14.55, 0.25)} title="Status">
          <div className="demo-options">
            {["New", "Replied", "Booked", "Closed"].map((s) => (
              <div key={s} data-tap={s === "Booked" ? "opt-booked" : undefined} className={(s === "Booked") === t >= 14.3 ? "on" : undefined}>
                {s}
              </div>
            ))}
          </div>
        </Sheet>
      </>
    );
  },
};

// ---------- 3. Partner dinners ----------

const EVENTS: SiteEvent[] = [
  {
    slug: "a",
    name: "Open Fire Dinner at the Ranch",
    date: "2026-10-23",
    time: "6–8pm",
    location: "Walnut Shade, MO",
    about: "",
    priceCents: 17500,
    status: "on_sale",
    seatsLeft: null,
    kind: "dinner",
    partner: "Parmele Ranch Co.",
    ticketLinks: [{ label: "Tickets", url: "#" }],
  },
  {
    slug: "b",
    name: "Fall Harvest Dinner",
    date: "2026-11-06",
    time: "6–8pm",
    location: "Ozark, MO",
    about: "",
    priceCents: null,
    status: "on_sale",
    seatsLeft: null,
    kind: "dinner",
    partner: "Finley Farms",
    ticketLinks: [{ label: "Tickets", url: "#" }],
  },
  {
    slug: "c",
    name: "Winter Solstice Supper",
    date: "2026-12-18",
    time: "6–8pm",
    location: "Ozark, MO",
    about: "",
    priceCents: null,
    status: "on_sale",
    seatsLeft: null,
    kind: "dinner",
    partner: "Finley Farms",
    ticketLinks: [{ label: "Tickets", url: "#" }],
  },
];
const DINNERS_BEFORE = renderDinnerList({ dinnersOnly: true, events: EVENTS.slice(0, 2) });
const DINNERS_AFTER = renderDinnerList({ dinnersOnly: true, events: EVENTS });

const TicketsHeader = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "baseline" }}>
    <h1 style={{ fontSize: 28, margin: 0 }}>
      <span style={{ ...labelStyle, display: "block", marginBottom: 10 }}>← All admin</span>
      Dinners &amp; tickets
    </h1>
    <div style={{ display: "flex", gap: 10 }}>
      <span style={btn(secondaryButtonStyle)}>Refresh</span>
      <span data-tap="new" style={btn(buttonStyle)}>
        New event
      </span>
    </div>
  </div>
);

export const DINNERS: Demo = {
  id: "dinners",
  title: "Adding a partner dinner",
  text: "For a dinner a farm or venue sells, add the date and paste their ticket link. It shows on your site right away and drops off by itself after the date.",
  duration: 21,
  chapters: [
    { at: 0, label: "Tap New event" },
    { at: 3.2, label: "A partner sells the tickets" },
    { at: 6.4, label: "Name it, paste their link" },
    { at: 11.4, label: "Add the date and save" },
    { at: 16.2, label: "It's on your site" },
  ],
  taps: [
    [2.0, "new"],
    [4.4, "partner"],
    [6.7, "name"],
    [8.9, "partner-name"],
    [10.3, "link"],
    [10.9, "paste"],
    [12.4, "date"],
    [13.2, "time"],
    [14.0, "where"],
    [15.7, "save"],
  ],
  render: (t) => {
    const partner = t >= 4.5;
    const name = typing(t, "Winter Solstice Supper", 6.7);
    const pName = typing(t, "Finley Farms", 8.9);
    const link = pasting(t, "https://www.sevenrooms.com/experiences/finleyfarms", 10.3, 10.9);
    const time = typing(t, "6–8pm", 13.2);
    const where = typing(t, "Ozark, MO", 14.0);
    return (
      <Screen url={t < 16.2 ? `${ADMIN_URL}/tickets` : `${HOST}/farm-to-table`} background={t < 16.2 ? PAPER : "#faf8f3"}>
        <Scene t={t} from={0} to={3.2}>
          <div style={page}>
            <TicketsHeader />
            <h2 style={{ fontSize: 22, marginTop: 28 }}>Your events</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: -8 }}>Your own events sell tickets here; partner dinners link to the partner's tickets. Past dates drop off the site on their own.</p>
            {EVENTS.slice(0, 2).map((e) => (
              <div key={e.slug} style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "10px 12px", fontSize: 14 }}>
                <div style={muted}>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                <strong>{e.name}</strong>
                <div style={muted}>Sold by {e.partner}</div>
              </div>
            ))}
          </div>
        </Scene>
        <Scene t={t} from={3.2} to={16.2}>
          <Scroll y={keyed(t, [[0, 96], [11.5, 470], [14.9, 760]], 0.9)}>
            <div style={page}>
              <TicketsHeader />
              <div style={{ border: "1px solid var(--line)", background: "#fff", padding: 20, margin: "20px 0 36px" }}>
                <h2 style={{ fontSize: 22, marginTop: 0 }}>New event</h2>
                <Label>Who sells the tickets?</Label>
                <div style={{ marginBottom: 12 }}>
                  <Radio on={!partner}>I do — tickets on this site</Radio>
                  <Radio on={partner} tap="partner">
                    A partner (farm, venue) — link to their tickets
                  </Radio>
                </div>
                <Label>Name</Label>
                <Box tap="name" ph="Fall Harvest Dinner" {...name} />
                {partner ? (
                  <div style={enter(prog(t, 4.5))}>
                    <Label>Partner</Label>
                    <Box tap="partner-name" ph="Finley Farms" {...pName} />
                    <Label>Their ticket link</Label>
                    <div style={{ position: "relative" }}>
                      <Bubble p={link.bubble} label="Paste" tap="paste" style={{ left: 10, top: -38 }} />
                      <Box tap="link" ph="https://…" v={link.v} focus={link.focus} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }} />
                    </div>
                    <span style={btn(secondaryButtonStyle, { marginBottom: 18 })}>+ Another ticket link</span>
                  </div>
                ) : null}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <div>
                    <Label>Type</Label>
                    <Box v="Dinner" select />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Box tap="date" v={t >= 12.6 ? "12/18/2026" : ""} ph="mm/dd/yyyy" focus={t >= 12.4 && t < 13.1} />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Box tap="time" ph="6–9pm" {...time} />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Box tap="where" ph="Seymour, MO" {...where} />
                  </div>
                  <div>
                    <Label>{partner ? "Price to show ($, optional)" : "Price per guest ($)"}</Label>
                    <Box />
                  </div>
                </div>
                <Label>About this dinner</Label>
                <Box h={90} />
                <Label>Status</Label>
                <Box v="On sale" select style={{ width: 150 }} />
                <span data-tap="save" style={btn(buttonStyle)}>
                  {t >= 15.75 ? "Saving…" : "Save event"}
                </span>{" "}
                <span style={btn(secondaryButtonStyle)}>Cancel</span>
              </div>
            </div>
          </Scroll>
        </Scene>
        <Scene t={t} from={16.2} to={99}>
          <Scroll y={keyed(t, [[0, 0], [16.5, 250]], 0.9)}>
            <div className="v2 demo-v2" style={{ background: "transparent", "--new": prog(t, 17.3, 0.6) } as CSSProperties}>
              <div style={{ padding: "26px 20px" }}>
                <div className="label">Farm dinners</div>
                <h2 style={{ margin: "8px 0 18px" }}>Upcoming dinners</h2>
                <div dangerouslySetInnerHTML={{ __html: t >= 17.3 ? DINNERS_AFTER : DINNERS_BEFORE }} />
              </div>
            </div>
          </Scroll>
        </Scene>
      </Screen>
    );
  },
};

// ---------- 4. Signature plates ----------

type PlateItem = { name: string; img: string; rows: string };
const DUCK: PlateItem = { name: "Seared duck, wild rice & mugolio apple chutney", img: "/images/g-duck.jpg", rows: "The farms · The chutney · The plate" };
const ROULADE: PlateItem = { name: "Chicken roulade, chanterelle & pawpaw", img: "/images/dish-chanterelle-pawpaw.webp", rows: "The wild" };
const RIB: PlateItem = { name: "Braised short rib, garlic mash", img: "/images/dish-short-rib.webp", rows: "The farms · The wild · The plate" };
const PLATE_H = 166;

function PlateCard({ p, upTap, style }: { p: PlateItem; upTap?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ ...card, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", height: PLATE_H - 14, boxSizing: "border-box", ...style }}>
      <img src={p.img} alt="" style={{ width: 64, height: 80, objectFit: "cover" }} />
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 17, lineHeight: 1.3 }}>{p.name}</div>
        <div style={muted}>{p.rows}</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <span data-tap={upTap ? "up" : undefined} style={btn(small)}>
          ↑
        </span>
        <span style={btn(small)}>↓</span>
        <span style={btn(small)}>Edit</span>
        <span style={btn(small)}>Delete</span>
      </div>
    </div>
  );
}

const PlatesHead = () => (
  <>
    <Bar />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>Signature plates</h1>
      <span data-tap="new" style={btn(buttonStyle)}>
        New plate
      </span>
    </div>
    <p style={{ ...muted, marginBottom: 22 }}>The "One plate" gallery on the home page, in this order. Visitors click through them with the arrows.</p>
  </>
);

const STORY: [string, string][] = [
  ["The farms", "Beef from a family ranch down the road."],
  ["The wild", "Wild mushrooms gathered that morning."],
  ["The plate", "Braised eight hours, finished in its own jus."],
];

export const PLATES: Demo = {
  id: "plates",
  title: "Signature plates",
  text: "The “One plate” gallery on your home page. Add a dish with a photo and a few lines of its story, then set the order. Photos taller than wide look best.",
  duration: 20,
  chapters: [
    { at: 0, label: "Tap New plate" },
    { at: 3.0, label: "Name it, add a photo" },
    { at: 8.6, label: "Tell its story" },
    { at: 13.2, label: "Save and set the order" },
  ],
  taps: [
    [1.9, "new"],
    [3.5, "dish"],
    [6.3, "file"],
    [7.4, "pick"],
    [9.5, "farms"],
    [13.8, "save"],
    [15.6, "up"],
    [17.0, "up"],
  ],
  render: (t) => {
    const dish = typing(t, RIB.name, 3.5);
    const farms = typing(t, STORY[0][1], 9.5, 16);
    const uploaded = t >= 8.3;
    const ribPos = keyed(t, [[0, 2], [15.7, 1], [17.1, 0]], 0.45);
    const duckPos = keyed(t, [[0, 0], [17.1, 1]], 0.45);
    const roulPos = keyed(t, [[0, 1], [15.7, 2]], 0.45);
    return (
      <>
        <Screen url={`${ADMIN_URL}/plates`} background={PAPER}>
          <Scene t={t} from={0} to={3.0}>
            <div style={page}>
              <PlatesHead />
              <PlateCard p={DUCK} />
              <PlateCard p={ROULADE} />
            </div>
          </Scene>
          <Scene t={t} from={3.0} to={14.3}>
            <Scroll y={keyed(t, [[0, 150], [8.7, 470], [12.9, 760]], 0.9)}>
              <div style={page}>
                <PlatesHead />
                <div style={{ ...card, padding: 20, marginBottom: 28 }}>
                  <h2 style={{ fontSize: 22, marginTop: 0 }}>New plate</h2>
                  <Label>Dish name</Label>
                  <Box tap="dish" ph="Seared duck, wild rice & apple chutney" {...dish} />
                  <Label>Photo</Label>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap" }}>
                    {uploaded ? <img src={RIB.img} alt="" style={{ width: 120, height: 150, objectFit: "cover", border: "1px solid var(--line)", ...enter(prog(t, 8.3)) }} /> : null}
                    <div>
                      <FileInput tap="file" name={uploaded ? "IMG_4021.jpg" : undefined} />
                      <div style={{ ...muted, marginTop: 6 }}>{t >= 7.6 && !uploaded ? "Uploading…" : "Portrait photos look best (taller than wide)."}</div>
                    </div>
                  </div>
                  <Label>Describe the photo (for screen readers and Google)</Label>
                  <Box ph="Sliced duck breast over wild rice with chutney and sage" />
                  <Label>The story — a short heading and a few sentences each (empty ones are hidden)</Label>
                  {STORY.map(([label, text], i) => (
                    <div key={label} style={{ borderLeft: "3px solid var(--line)", paddingLeft: 12, marginBottom: 6 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                        <Box v={label} style={{ maxWidth: 220, marginBottom: 8 }} />
                        <span style={btn(small, { marginTop: 6 })}>Remove</span>
                      </div>
                      {i === 0 ? (
                        <Box tap="farms" h={64} {...farms} />
                      ) : (
                        <Box h={64} v={t >= 12.3 + i * 0.25 ? text : ""} style={t >= 12.3 + i * 0.25 ? { opacity: prog(t, 12.3 + i * 0.25, 0.3) } : undefined} />
                      )}
                    </div>
                  ))}
                  <span style={btn(small, { marginBottom: 18 })}>+ Add a line</span>
                  <Check on>Show on the site</Check>
                  <span data-tap="save" style={btn(buttonStyle)}>
                    {t >= 13.85 ? "Saving…" : "Save plate"}
                  </span>{" "}
                  <span style={btn(secondaryButtonStyle)}>Cancel</span>
                </div>
              </div>
            </Scroll>
          </Scene>
          <Scene t={t} from={14.3} to={99}>
            <div style={page}>
              <PlatesHead />
              <div style={{ position: "relative", height: PLATE_H * 3 }}>
                {(
                  [
                    [DUCK, duckPos],
                    [ROULADE, roulPos],
                    [RIB, ribPos],
                  ] as [PlateItem, number][]
                ).map(([p, pos]) => (
                  <PlateCard key={p.name} p={p} upTap={p === RIB} style={{ position: "absolute", left: 0, right: 0, top: pos * PLATE_H, ...(p === RIB ? glow(t, 14.6, 1.4) : null) }} />
                ))}
              </div>
            </div>
          </Scene>
        </Screen>
        <PhotoSheet p={win(t, 6.45, 7.65, 0.3)} pick={1} />
      </>
    );
  },
};

// ---------- 5. Reviews ----------

type Rev = { name: string; text: string; stars?: number; date: string; shown: boolean; isNew?: boolean; short?: boolean };
const SARAH = "We found Dyllan through a friend of a friend. He cooked for our parents' anniversary and every course was a surprise. He made the whole night feel easy.";
const SARAH_PARTS = sentences(SARAH);
const SARAH_SHORT = excerpt(SARAH_PARTS, [1, 2]);
const MIKE = "Best meal we've had in the Ozarks. The venison was unreal.";
const SHOWING: Rev[] = [
  { name: "Noah H.", text: "I was skeptical at first — I couldn't pronounce any of the dishes on the menu. I couldn't believe how incredibly good the food tasted…", date: "Old website", shown: true },
  { name: "Jobeth S.", text: "A wonderful, quiet evening of meeting new friends and enjoying an artfully prepared, wild foraged, six-course dinner…", date: "Old website", shown: true },
];

function ReviewCard({ r, tapShow, tapShorten, style, children }: { r: Rev; tapShow?: string; tapShorten?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div style={{ ...card, opacity: r.shown || children ? 1 : 0.75, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <strong>
          {r.stars ? `${"★".repeat(r.stars)} ` : ""}
          {r.name}
          {r.isNew ? <span style={badge("#a85a22")}>new</span> : null}
          <span style={badge(r.shown ? "#3a5a40" : "#7a7a7a")}>{r.shown ? "showing" : "hidden"}</span>
        </strong>
        <span style={muted}>{r.date}</span>
      </div>
      <p style={{ margin: "8px 0 4px", fontSize: 15 }}>{r.text}</p>
      {r.short ? <div style={{ ...muted, fontSize: 13, marginBottom: 8 }}>Shortened from the full review</div> : <div style={{ height: 8 }} />}
      {children ?? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={btn(small)}>↑</span>
          <span style={btn(small)}>↓</span>
          <span data-tap={tapShow} style={btn(small, r.shown ? undefined : { background: "var(--pine)", color: "#fff", borderColor: "var(--pine)" })}>
            {r.shown ? "Hide" : "Show on site"}
          </span>
          <span data-tap={tapShorten} style={btn(small)}>
            Shorten
          </span>
        </div>
      )}
    </div>
  );
}

/** The sentence picker, with sentence 0 struck once `dropped`. */
const Picker = ({ dropped, saving }: { dropped: boolean; saving: boolean }) => (
  <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 12 }}>
    <Label>Tap a sentence to leave it out</Label>
    <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      {SARAH_PARTS.map((s, i) => {
        const on = !(dropped && i === 0);
        return (
          <div
            key={s}
            data-tap={i === 0 ? "s0" : undefined}
            style={{ font: "15px/1.45 Georgia, serif", padding: "8px 10px", border: on ? "1px solid var(--ink)" : "1px dashed var(--line)", background: on ? "#fff" : "transparent", color: on ? "var(--ink)" : "#9a958a", textDecoration: on ? "none" : "line-through" }}
          >
            {s}
          </div>
        );
      })}
    </div>
    <Label>On the site</Label>
    <p style={{ margin: "0 0 12px", fontSize: 15, fontStyle: "italic" }}>“{dropped ? SARAH_SHORT : SARAH}”</p>
    <span data-tap="save" style={btn(buttonStyle)}>
      {saving ? "Saving…" : "Save"}
    </span>{" "}
    <span style={btn(secondaryButtonStyle)}>Use the whole review</span>
  </div>
);

const ReviewsHead = () => (
  <>
    <Bar />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>Reviews</h1>
      <span style={btn(secondaryButtonStyle)}>Add one by hand</span>
    </div>
    <p style={{ ...muted, marginBottom: 22 }}>"From the table" on the home page shows the first 4 reviews marked Showing. Showing a review puts it first; use the arrows to fine-tune the order.</p>
    <div style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>Google reviews</div>
      <div style={{ fontSize: 15 }}>
        From <strong>Wild Foods by Dyllan</strong> · 23 reviews
      </div>
      <div style={{ ...muted, margin: "4px 0 10px" }}>Checked this morning. New reviews arrive by themselves every morning.</div>
      <span style={btn(small)}>Check now</span>
    </div>
  </>
);

function Filters({ on, counts }: { on: string; counts: [number, number] }) {
  const items: [string, string][] = [
    ["new", `New from Google (${counts[0]})`],
    ["showing", `Showing (${counts[1]})`],
    ["hidden", "Hidden (17)"],
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 18px" }}>
      {items
        .filter(([k]) => k !== "new" || counts[0] > 0)
        .map(([k, v]) => (
          <span key={k} data-tap={`f-${k}`} style={btn(small, { background: on === k ? "var(--ink)" : "transparent", color: on === k ? "#fff" : "var(--ink)" })}>
            {v}
          </span>
        ))}
    </div>
  );
}

export const REVIEWS_DEMO: Demo = {
  id: "reviews",
  title: "Choosing reviews",
  text: "Your Google reviews come in by themselves every morning and wait, hidden, until you show them. Show the ones you love, and shorten a long one to its best sentences. The words always stay the reviewer's own.",
  duration: 19.5,
  chapters: [
    { at: 0, label: "New reviews arrive from Google" },
    { at: 4.2, label: "Show the ones you love" },
    { at: 8.6, label: "Shorten to its best lines" },
    { at: 14.6, label: "It's on your home page" },
  ],
  taps: [
    [5.0, "show1"],
    [6.6, "f-showing"],
    [9.2, "shorten"],
    [10.6, "s0"],
    [12.2, "save"],
  ],
  render: (t) => {
    const shown = t >= 5.1;
    const onShowing = t >= 6.7;
    const picking = t >= 9.3 && t < 12.4;
    const short = t >= 12.4;
    const sarah: Rev = { name: "Sarah M.", stars: 5, date: "Google · Oct 2", text: short ? SARAH_SHORT : SARAH, shown, isNew: !shown, short };
    const mike: Rev = { name: "Mike R.", stars: 5, date: "Google · Oct 9", text: MIKE, shown: false, isNew: true };
    const leaving = shown && !onShowing ? prog(t, 5.3, 0.4) : 0;
    return (
      <Screen url={t < 14.6 ? `${ADMIN_URL}/reviews` : `${HOST}/`} background={t < 14.6 ? PAPER : "#e5e9df"}>
        <Scene t={t} from={0} to={14.6}>
          <Scroll y={keyed(t, [[0, 0], [1.2, 300], [9.3, 330], [11.2, 520], [12.6, 330]], 0.8)}>
            <div style={page}>
              <ReviewsHead />
              {onShowing ? (
                <>
                  <Filters on="showing" counts={[1, 5]} />
                  <ReviewCard r={sarah} tapShorten="shorten" style={{ ...enter(prog(t, 6.75)), ...glow(t, 6.9, 1.4) }}>
                    {picking ? <Picker dropped={t >= 10.65} saving={t >= 12.25} /> : undefined}
                  </ReviewCard>
                  {SHOWING.map((r) => (
                    <ReviewCard key={r.name} r={r} style={enter(prog(t, 6.85))} />
                  ))}
                </>
              ) : (
                <>
                  <Filters on="new" counts={[shown ? 1 : 2, shown ? 5 : 4]} />
                  {leaving < 1 ? <ReviewCard r={sarah} tapShow="show1" style={{ ...enter(prog(t, 1.6)), opacity: 1 - leaving }} /> : null}
                  <ReviewCard r={mike} style={enter(prog(t, 1.75))} />
                </>
              )}
            </div>
          </Scroll>
        </Scene>
        <Scene t={t} from={14.6} to={99}>
          <div className="v2 demo-v2" style={{ background: "transparent" }}>
            <div style={{ padding: "30px 24px" }}>
              <div className="qmark" aria-hidden="true">
                “
              </div>
              <div className="label center">From the table</div>
              <div className="quotes">
                <blockquote style={{ ...enter(prog(t, 15.1)), ...glow(t, 15.4, 2.2), padding: 10, margin: -10 }}>
                  <div className="stars">★★★★★</div>
                  <p>“{SARAH_SHORT}”</p>
                  <cite>Sarah M. · Google review</cite>
                </blockquote>
                <blockquote style={enter(prog(t, 15.3))}>
                  <p>“I was skeptical at first — I couldn't pronounce any of the dishes on the menu…”</p>
                  <cite>Noah H.</cite>
                </blockquote>
              </div>
            </div>
          </div>
        </Scene>
      </Screen>
    );
  },
};

// ---------- 6. Recipes ----------

const RECIPES: [string, string][] = [
  ["Watercress Kimchi", "Fermentation & Pickling"],
  ["Spruce-Tip Custard Tart", "Foraged Fruit"],
  ["Wild Garlic Capers", "Preserves"],
  ["Mulberry Horchata", "Foraged Fruit"],
];
const INGREDIENTS = ["1 cup black walnuts, toasted", "2 cups fresh basil", "1 clove garlic", "½ cup olive oil", "Salt to taste"];
const STEPS = ["Toast the walnuts in a dry pan.", "Blend everything but the oil.", "Stream in the oil until smooth."];
const cellS: CSSProperties = { padding: "8px 6px", fontSize: 14, verticalAlign: "top" };

function RecipeTable({ t, withNew }: { t: number; withNew?: boolean }) {
  const rows: [string, string][] = withNew ? [["Black Walnut Pesto", "Nuts & Seeds"], ...RECIPES] : RECIPES;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--ink)" }}>
          {["Title", "Category", "Status"].map((h) => (
            <th key={h} style={{ ...labelStyle, display: "table-cell", textAlign: "left", padding: "8px 6px" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([title, tag], i) => (
          <tr key={title} style={{ borderBottom: "1px solid var(--paper-dark)", ...(withNew && i === 0 ? { ...enter(prog(t, 17.2)), background: "rgba(168,90,34,.12)" } : null) }}>
            <td style={cellS}>{title}</td>
            <td style={cellS}>{tag}</td>
            <td style={cellS}>Published</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const RecipesHead = () => (
  <>
    <span style={{ ...labelStyle, display: "inline" }}>← All admin</span>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h1 style={{ fontSize: 28, margin: "12px 0" }}>Recipe Admin</h1>
      <span style={btn(secondaryButtonStyle)}>Log out</span>
    </div>
  </>
);

/** Lines that appear one at a time, starting at `from`, `gap` seconds apart. */
const lines = (t: number, items: string[], from: number, gap: number) => items.filter((_, i) => t >= from + i * gap).join("\n");

export const RECIPES_DEMO: Demo = {
  id: "recipes",
  title: "Adding a recipe",
  text: "Recipes go on your Recipes page, searchable and printable. Put one ingredient or step on each line and the site lays them out for you.",
  duration: 20.5,
  chapters: [
    { at: 0, label: "Tap Add a recipe" },
    { at: 2.8, label: "Title, category and time" },
    { at: 7.6, label: "One ingredient per line" },
    { at: 12.8, label: "Add a photo and save" },
  ],
  taps: [
    [1.8, "add"],
    [3.2, "title"],
    [5.0, "tag"],
    [6.4, "time"],
    [8.4, "ingredients"],
    [10.8, "steps"],
    [13.6, "file"],
    [14.7, "pick"],
    [16.4, "save"],
  ],
  render: (t) => {
    const title = typing(t, "Black Walnut Pesto", 3.2);
    const tag = typing(t, "Nuts & Seeds", 5.0);
    const time = typing(t, "20 min", 6.4);
    const uploaded = t >= 15.5;
    const mono: CSSProperties = { fontFamily: "monospace", fontSize: 13 };
    return (
      <>
        <Screen url={`${ADMIN_URL}/recipes`} background={PAPER}>
          <Scene t={t} from={0} to={2.8}>
            <div style={page}>
              <RecipesHead />
              <div style={{ marginBottom: 24 }}>
                <span data-tap="add" style={btn(buttonStyle)}>
                  + Add a recipe
                </span>
              </div>
              <RecipeTable t={t} />
            </div>
          </Scene>
          <Scene t={t} from={2.8} to={16.9}>
            <Scroll y={keyed(t, [[0, 0], [7.7, 290], [12.9, 640]], 0.9)}>
              <div style={page}>
                <RecipesHead />
                <div style={{ border: "1px solid var(--paper-dark)", padding: 20, marginBottom: 32 }}>
                  <h2 style={{ fontSize: 20, marginBottom: 16, marginTop: 0 }}>Add a new recipe</h2>
                  <Label>Title</Label>
                  <Box base={inputStyle} tap="title" {...title} />
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <Label>Category</Label>
                      <Box base={inputStyle} tap="tag" ph="e.g. Foraged Fruit" {...tag} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Label>Time</Label>
                      <Box base={inputStyle} tap="time" ph="e.g. 45 min" {...time} />
                    </div>
                  </div>
                  <Label>Short description</Label>
                  <Box base={inputStyle} h={60} v={t >= 7.6 ? "A bright, earthy pesto from Ozarks black walnuts." : ""} />
                  <Label>Ingredients (one per line)</Label>
                  <Box base={inputStyle} tap="ingredients" h={120} style={mono} v={lines(t, INGREDIENTS, 8.6, 0.4)} focus={t >= 8.4 && t < 10.7} />
                  <Label>Steps (one per line)</Label>
                  <Box base={inputStyle} tap="steps" h={120} style={mono} v={lines(t, STEPS, 11.0, 0.5)} focus={t >= 10.8 && t < 12.6} />
                  <Label>Photo</Label>
                  <div style={{ marginBottom: 14 }}>
                    {uploaded ? <img src="/images/g-local-produce.jpg" alt="" style={{ maxWidth: 200, display: "block", marginBottom: 8, ...enter(prog(t, 15.5)) }} /> : null}
                    <FileInput tap="file" name={uploaded ? "IMG_4188.jpg" : undefined} />
                    {t >= 14.9 && !uploaded ? <span style={{ fontSize: 12 }}>Uploading…</span> : null}
                  </div>
                  <div style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
                    <Check on>Published (visible on the live site)</Check>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <span data-tap="save" style={btn(buttonStyle)}>
                      {t >= 16.45 ? "Saving…" : "Save recipe"}
                    </span>
                    <span style={btn(secondaryButtonStyle)}>Cancel</span>
                  </div>
                </div>
              </div>
            </Scroll>
          </Scene>
          <Scene t={t} from={16.9} to={99}>
            <div style={page}>
              <RecipesHead />
              <div style={{ marginBottom: 24 }}>
                <span style={btn(buttonStyle)}>+ Add a recipe</span>
              </div>
              <RecipeTable t={t} withNew />
            </div>
          </Scene>
        </Screen>
        <PhotoSheet p={win(t, 13.75, 14.95, 0.3)} pick={3} />
      </>
    );
  },
};

export const ADMIN_DEMOS: Demo[] = [GETTING_IN, INQUIRIES, DINNERS, PLATES, REVIEWS_DEMO, RECIPES_DEMO];
