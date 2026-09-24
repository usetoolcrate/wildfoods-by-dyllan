import { useEffect, useState } from "react";

// Scoping questionnaire for Dyllan before tickets / newsletter / shop checkout
// move off WordPress. Unlinked page; answers land in form_responses and are
// read at /admin/questions.

const FORM_ID = "phase2-scoping";
const STORAGE_KEY = "wf-questions-phase2-v1";

type Question = {
  n: number;
  group: string;
  title: string; // short label shown in the admin view
  prompt: string;
  help?: string;
  kind: "one" | "many" | "text";
  options?: string[];
  none?: string; // in a "many" question, the option that clears the others
  noteLabel?: string;
  notePlaceholder?: string;
  longNote?: boolean;
  showContact?: boolean;
};

const QUESTIONS: Question[] = [
  {
    n: 1,
    group: "Payments",
    title: "Own Stripe login?",
    prompt: "Do you have your own Stripe login?",
    help: "Card payments on your site run through WooPayments inside WordPress right now. The new site uses Stripe directly, which needs your own account. It's free to open, and Stripe takes a small cut of each sale, like WooPayments does now. You'd connect your bank yourself.",
    kind: "one",
    options: [
      "Yes, I log in to Stripe myself",
      "No, I only use WooCommerce",
      "Not sure",
    ],
  },
  {
    n: 2,
    group: "Tickets",
    title: "Events next year",
    prompt: "About how many ticketed events are you planning for next year?",
    help: "Count only the ones you sell yourself, not the ones a venue sells.",
    kind: "one",
    options: ["Under 10", "10 to 20", "20 to 40", "More than 40"],
  },
  {
    n: 3,
    group: "Tickets",
    title: "When a guest cancels",
    prompt: "When a guest cancels, what do you do?",
    kind: "one",
    options: [
      "Full refund if they cancel early enough",
      "No refunds, but they can give the ticket to someone else",
      "Case by case, I decide",
    ],
    noteLabel: "Cutoff or details",
    notePlaceholder: "e.g. full refund up to 7 days before",
  },
  {
    n: 4,
    group: "Tickets",
    title: "Info needed about guests",
    prompt: "What do you need to know about your guests?",
    help: "You always get the buyer's name and email. Pick anything else you want asked at checkout.",
    kind: "many",
    options: [
      "Phone number",
      "Name of every person in the party, not just the buyer",
      "Allergies and dietary needs",
      "How they heard about you",
    ],
  },
  {
    n: 5,
    group: "Tickets",
    title: "Ticket types",
    prompt: "Do any of your events need more than one kind of ticket?",
    help: "Pick all that apply.",
    kind: "many",
    options: [
      "Two seatings on the same night (like 5:30 and 7:00)",
      "Different prices for the same event (like with or without a wine pairing)",
      "Add-ons at checkout (like a shirt or a pairing)",
      "No, one price per event is fine",
    ],
    none: "No, one price per event is fine",
  },
  {
    n: 6,
    group: "Newsletter",
    title: "Paying subscribers",
    prompt: "How many people pay for the newsletter right now?",
    kind: "text",
    noteLabel: "Rough number",
    notePlaceholder: "e.g. 40, or not sure",
  },
  {
    n: 7,
    group: "Newsletter",
    title: "Where the newsletter lives",
    prompt: "Where should the newsletter live?",
    help: "A newsletter service like Substack or Buttondown sends the emails, takes the monthly payments, and handles cancellations for you. Keeping it on your website means building all of that. Either way, current subscribers may have to re-enter their card. I'll check whether their payments can be moved over first.",
    kind: "one",
    options: [
      "Move it to a newsletter service",
      "Keep it on my website",
      "Not sure, let's talk",
    ],
  },
  {
    n: 8,
    group: "Shop",
    title: "Shirts",
    prompt: "What should happen with the shirts?",
    kind: "one",
    options: [
      "Keep selling them on my site. I ship them myself.",
      "Move them all to MoGrown",
      "Stop selling shirts for now",
    ],
  },
  {
    n: 9,
    group: "Shop",
    title: "Gift certificates",
    prompt: "How do people use a gift certificate today?",
    kind: "one",
    options: [
      "They enter a code when buying tickets online",
      "They contact me and I take care of it",
      "Hardly anyone uses them",
    ],
  },
  {
    n: 10,
    group: "Shop",
    title: "Discount codes",
    prompt: "Do you need discount codes like BF25 on the new site?",
    kind: "one",
    options: ["Yes, I use them often", "Once in a while", "No"],
  },
  {
    n: 11,
    group: "Your details",
    title: "Phone and email on the site",
    prompt: "Is this the phone number and email you want on the site?",
    help: "They're on the new site now, but I couldn't find either one on your current site, so I want to be sure before it goes live.",
    kind: "one",
    showContact: true,
    options: [
      "Yes, show both",
      "Phone only",
      "Email only",
      "Neither, use a contact form",
    ],
    noteLabel: "Corrections",
    notePlaceholder: "the right number or email",
  },
  {
    n: 12,
    group: "Your details",
    title: "Private chef pricing",
    prompt: "Which private chef pricing is current?",
    help: "The new site and your store listing don't match.",
    kind: "one",
    options: [
      "The new site: $90 buffet, $120 family style, $150 plated, per person",
      "My store listing: $175 per person, 5-person minimum, 50% up front",
      "Neither. I'll write it below.",
    ],
    noteLabel: "Current pricing",
    notePlaceholder: "optional",
  },
  {
    n: 13,
    group: "Timing and anything else",
    title: "Ready-by date",
    prompt: "Is there a date you want new ticket sales working by?",
    help: "Events already on sale finish on your current site. New events go on the new site once it's ready.",
    kind: "text",
    noteLabel: "Date or event",
    notePlaceholder: "e.g. before the holiday dinners go on sale",
  },
  {
    n: 14,
    group: "Timing and anything else",
    title: "Anything missed",
    prompt: "Anything your current site does that isn't on this page?",
    kind: "text",
    noteLabel: "Anything else",
    notePlaceholder:
      "forms, emails it sends, things you use in the WordPress dashboard…",
    longNote: true,
  },
];

type Entry = { picked: string[]; note: string };
type Entries = Record<number, Entry>;
type Saved = {
  submissionId: string;
  entries: Entries;
  sentSnapshot: string | null;
};
type Status = "idle" | "sending" | "sent" | "error" | "empty";

function newSubmissionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Saved>;
      if (parsed && typeof parsed.submissionId === "string") {
        return {
          submissionId: parsed.submissionId,
          entries: parsed.entries ?? {},
          sentSnapshot: parsed.sentSnapshot ?? null,
        };
      }
    }
  } catch {
    // Storage blocked or corrupt — start fresh.
  }
  return { submissionId: newSubmissionId(), entries: {}, sentSnapshot: null };
}

function isAnswered(e: Entry | undefined): boolean {
  return !!e && (e.picked.length > 0 || e.note.trim() !== "");
}

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Special+Elite&display=swap";

const UPCOMING = [
  { d: "Sep 26", n: "Stonewater Cove dinner", s: "Venue sells (FlyBook)" },
  { d: "Oct 3", n: "Wild Fermentation Workshop · $35", s: "Your site" },
  {
    d: "Oct 10",
    n: "Ozarks Farm Stop to Table Dinner",
    s: "Venue sells (LocalLine)",
  },
  {
    d: "Nov 6",
    n: "Fall Harvest Dinner, Finley Farms",
    s: "Venue sells (SevenRooms)",
  },
  {
    d: "Nov 14",
    n: "Live-Fire Fall Dinner at Bull Mills · $125",
    s: "Your site",
  },
];

const HANDLES = [
  {
    k: "Tickets you sell",
    v: "Pop-up dinners, classes, and workshops, 15 to 34 seats each, $35 to $150 a ticket.",
    small:
      "Going by the seat counts on your site, seven of this year's finished events sold about 128 seats between them.",
  },
  {
    k: "Tickets a venue sells",
    v: "Stonewater Cove, Ozarks Farm Stop, and Finley Farms sell through their own booking pages.",
    small: "The new site will just link to those.",
  },
  { k: "Paid newsletter", v: "$7 a month, billed automatically." },
  {
    k: "Shirts",
    v: "Seven designs sold and shipped from your site, plus the Forage the Ozarks shirt on MoGrown.",
  },
  { k: "Gift certificates", v: "Sold in your store, starting at $15." },
  { k: "Private chef", v: "A store listing that takes 50% up front." },
  {
    k: "Discount codes",
    v: "The BF25 20%-off banner is showing on your site right now.",
  },
];

export function QuestionsPage() {
  const [saved, setSaved] = useState<Saved>(loadSaved);
  const [status, setStatus] = useState<Status>("idle");
  const [website, setWebsite] = useState(""); // honeypot
  const { entries, submissionId, sentSnapshot } = saved;

  useEffect(() => {
    document.title = "Questions for Dyllan — Wild Foods by Dyllan";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    let font = document.querySelector<HTMLLinkElement>(
      `link[href="${FONT_HREF}"]`,
    );
    if (!font) {
      font = document.createElement("link");
      font.rel = "stylesheet";
      font.href = FONT_HREF;
      document.head.appendChild(font);
    }
    return () => {
      robots.remove();
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch {
        // Storage blocked — answers still send, they just won't survive a reload.
      }
    }, 250);
    return () => clearTimeout(t);
  }, [saved]);

  const answeredCount = QUESTIONS.filter(q => isAnswered(entries[q.n])).length;
  const snapshot = JSON.stringify(entries);
  const hasSent = sentSnapshot !== null;
  const changedSinceSent = hasSent && sentSnapshot !== snapshot;

  function updateEntry(n: number, next: Partial<Entry>) {
    setSaved(prev => {
      const cur = prev.entries[n] ?? { picked: [], note: "" };
      return {
        ...prev,
        entries: { ...prev.entries, [n]: { ...cur, ...next } },
      };
    });
    if (status === "sent" || status === "error" || status === "empty")
      setStatus("idle");
  }

  function pick(q: Question, option: string, checked: boolean) {
    const cur = entries[q.n]?.picked ?? [];
    if (q.kind === "one") {
      updateEntry(q.n, { picked: [option] });
      return;
    }
    let picked = checked
      ? [...cur.filter(p => p !== option), option]
      : cur.filter(p => p !== option);
    if (checked && q.none)
      picked = option === q.none ? [q.none] : picked.filter(p => p !== q.none);
    // Keep the order the options are listed in.
    picked = (q.options ?? []).filter(o => picked.includes(o));
    updateEntry(q.n, { picked });
  }

  async function send() {
    if (status === "sending") return;
    if (answeredCount === 0) {
      setStatus("empty");
      return;
    }
    setStatus("sending");
    const answers = QUESTIONS.map(q => ({
      n: q.n,
      title: q.title,
      picked: entries[q.n]?.picked ?? [],
      note: (entries[q.n]?.note ?? "").trim(),
    }));
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: FORM_ID, submissionId, answers, website }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaved(prev => ({ ...prev, sentSnapshot: snapshot }));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const buttonLabel =
    status === "sending"
      ? "Sending…"
      : hasSent && !changedSinceSent
        ? "Sent"
        : hasSent
          ? "Send my changes"
          : "Send my answers";

  const statusText: Record<Status, string> = {
    idle: changedSinceSent
      ? "You've changed some answers since you sent them. Send again to update them."
      : "",
    sending: "Sending…",
    sent: "Sent. I have your answers. If you change anything, send again and I'll get the update.",
    error:
      "That didn't go through. Check your connection and try again. Your answers are still saved on this device.",
    empty: "Answer at least one question first.",
  };
  const statusMessage =
    status === "idle" && hasSent && !changedSinceSent
      ? "Already sent. If you change anything, send again and I'll get the update."
      : statusText[status];

  let lastGroup = "";

  return (
    <div className="wfq">
      <style dangerouslySetInnerHTML={{ __html: QUESTIONS_STYLES }} />

      <div className="wfq-page">
        <header className="wfq-masthead">
          <img
            className="wfq-logo"
            src="/images/logo-lockup.webp"
            alt="Wild Foods by Dyllan"
            width={900}
            height={501}
          />
          <div className="wfq-eyebrow">Website rebuild · Part two</div>
          <h1>Before I build your ticket sales</h1>
          <div className="wfq-lede">
            <p>
              Your recipe section is done. Next is moving the money side off
              WordPress: dinner and class tickets, the newsletter, shirts, and
              gift certificates. Before I build any of it, I need some answers
              from you. It takes about ten minutes, and most of it is tapping an
              option.
            </p>
            <p>
              This page keeps your answers on this device as you go, so you can
              stop and come back. When you're finished, hit{" "}
              <strong>Send my answers</strong> at the bottom and they come
              straight to me.
            </p>
          </div>
        </header>

        <section className="wfq-sec" aria-labelledby="wfq-done">
          <div className="wfq-sec-head">
            <div className="wfq-eyebrow">Already done</div>
            <h2 id="wfq-done">Your recipes are moved over</h2>
          </div>
          <p>
            All 21 recipes from your current site, with their photos, are on the
            new site. You can add and edit recipes yourself, no code needed,
            from the recipe editor:
          </p>
          <p className="wfq-url">
            <a href="/admin/recipes">
              wildfoods-by-dyllan.vercel.app/admin/recipes
            </a>
          </p>
          <p>
            That's a preview address. Your real domain keeps pointing at the
            WordPress site until we're ready to switch, and we can't switch
            until tickets and payments work on the new site.
          </p>
        </section>

        <section className="wfq-sec" aria-labelledby="wfq-today">
          <div className="wfq-sec-head">
            <div className="wfq-eyebrow">What I found</div>
            <h2 id="wfq-today">What your current site handles</h2>
            <p>
              I went through your WordPress site to list everything it does for
              you. If I missed something, the last question is for that.
            </p>
          </div>
          <div className="wfq-ledger">
            {HANDLES.map(h => (
              <div className="wfq-row" key={h.k}>
                <div className="wfq-k">{h.k}</div>
                <div className="wfq-v">
                  {h.v}
                  {h.small ? <small>{h.small}</small> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wfq-sec" aria-labelledby="wfq-onsale">
          <div className="wfq-sec-head">
            <div className="wfq-eyebrow">Nothing changes for these</div>
            <h2 id="wfq-onsale">Events already on sale stay where they are</h2>
            <p>
              These finish on your current site, so nobody's ticket gets lost in
              the move.
            </p>
          </div>
          <div className="wfq-onsale">
            {UPCOMING.map(e => (
              <div className="wfq-ev" key={e.d}>
                <span className="wfq-d">{e.d}</span>
                <span className="wfq-n">{e.n}</span>
                <span className="wfq-s">{e.s}</span>
              </div>
            ))}
          </div>
          <div className="wfq-fixnow">
            <h3>Worth fixing on your current site now</h3>
            <p>
              Some dinners that already happened still show as in stock in your
              store, so someone could still pay for them:
            </p>
            <ul>
              <li>Wild Thanksgiving Pop-Up, Juniper Gardens — Nov 8, 2025</li>
              <li>Wild Holiday Supper, Juniper Gardens — Dec 6, 2025</li>
              <li>Dinner Experience, Bull Mills — June 13 and Sept 6, 2026</li>
              <li>Regalo Orchard — the May through September 2026 dates</li>
            </ul>
            <p>Marking them out of stock in WooCommerce takes care of it.</p>
          </div>
        </section>

        <form
          className="wfq-sec"
          aria-labelledby="wfq-qs"
          noValidate
          onSubmit={e => {
            e.preventDefault();
            send();
          }}
        >
          <div className="wfq-sec-head">
            <div className="wfq-eyebrow">Your answers</div>
            <h2 id="wfq-qs">The questions</h2>
            <p>
              Skip anything you're unsure about. A short note is just as useful
              as a tapped option.
            </p>
          </div>

          <div className="wfq-hp" aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <div className="wfq-questions">
            {QUESTIONS.map(q => {
              const entry = entries[q.n] ?? { picked: [], note: "" };
              const groupHead =
                q.group !== lastGroup ? (
                  <div className="wfq-eyebrow wfq-group">{q.group}</div>
                ) : null;
              lastGroup = q.group;
              const noteId = `q${q.n}-note`;
              return (
                <div key={q.n} className="wfq-qwrap">
                  {groupHead}
                  <fieldset>
                    <legend>
                      <span className="wfq-num">
                        {String(q.n).padStart(2, "0")}
                      </span>
                      <span className="wfq-qt">{q.prompt}</span>
                    </legend>
                    {q.help ? <p className="wfq-help">{q.help}</p> : null}
                    <div className="wfq-body">
                      {q.showContact ? (
                        <div className="wfq-contact">
                          <span>417-403-9265</span>
                          <span>dyllan@wildfoodsbydyllan.com</span>
                        </div>
                      ) : null}
                      {(q.options ?? []).map((opt, i) => {
                        const id = `q${q.n}-${i}`;
                        const checked = entry.picked.includes(opt);
                        return (
                          <label
                            className={`wfq-opt${checked ? " is-on" : ""}`}
                            htmlFor={id}
                            key={opt}
                          >
                            <input
                              id={id}
                              type={q.kind === "one" ? "radio" : "checkbox"}
                              name={`q${q.n}`}
                              checked={checked}
                              onChange={e => pick(q, opt, e.target.checked)}
                            />
                            <span
                              className={`wfq-mark${q.kind === "one" ? " is-radio" : ""}`}
                              aria-hidden="true"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                      {q.noteLabel ? (
                        <div className="wfq-field">
                          <label htmlFor={noteId}>{q.noteLabel}</label>
                          {q.longNote ? (
                            <textarea
                              id={noteId}
                              value={entry.note}
                              placeholder={q.notePlaceholder}
                              onChange={e =>
                                updateEntry(q.n, { note: e.target.value })
                              }
                            />
                          ) : (
                            <input
                              id={noteId}
                              type="text"
                              value={entry.note}
                              placeholder={q.notePlaceholder}
                              inputMode={q.n === 6 ? "numeric" : undefined}
                              onChange={e =>
                                updateEntry(q.n, { note: e.target.value })
                              }
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </fieldset>
                </div>
              );
            })}
          </div>

          <div className="wfq-send">
            <div className="wfq-sec-head">
              <div className="wfq-eyebrow">Last step</div>
              <h2>Send your answers</h2>
              <p>
                {answeredCount} of {QUESTIONS.length} answered. Skipped
                questions are fine. Send what you have and we can talk through
                the rest.
              </p>
            </div>
            <div>
              <button
                type="submit"
                className="wfq-btn"
                disabled={status === "sending"}
              >
                {buttonLabel}
              </button>
            </div>
            <p
              className={`wfq-status${status === "sent" ? " is-ok" : ""}${status === "error" ? " is-err" : ""}`}
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </p>
          </div>
        </form>
      </div>

      <div className="wfq-bar" role="region" aria-label="Progress">
        <div className="wfq-bar-in">
          <div className="wfq-prog">
            <span className="wfq-prog-t">
              {answeredCount} of {QUESTIONS.length} answered
            </span>
            <div className="wfq-track">
              <div
                className="wfq-fill"
                style={{
                  width: `${Math.round((answeredCount / QUESTIONS.length) * 100)}%`,
                }}
              />
            </div>
          </div>
          <button
            type="button"
            className="wfq-btn"
            onClick={send}
            disabled={status === "sending"}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const QUESTIONS_STYLES = `
  html, body{background:#f2ead9;}
  .wfq{
    --paper:#f2ead9;
    --paper-2:#e8dcc2;
    --card:#f8f3e8;
    --ink:#1f2e22;
    --ink-soft:#4b584b;
    --pine:#1f3327;
    --rust:#8a4818;
    --rust-hi:#a85a22;
    --line:#c9bb9a;
    --tint:rgba(168,90,34,.10);
    --serif:'Cormorant Garamond', 'Iowan Old Style', Georgia, serif;
    --type:'Special Elite', 'Courier New', Courier, monospace;
    --indent:46px;
    min-height:100vh;
    background:var(--paper);
    color:var(--ink);
    font-family:var(--serif);
    font-weight:500;
    font-size:20px;
    line-height:1.5;
    -webkit-font-smoothing:antialiased;
  }
  .wfq *{box-sizing:border-box;}
  .wfq p{margin:0;}
  .wfq h1,.wfq h2,.wfq h3{font-family:var(--serif);color:var(--pine);text-wrap:balance;margin:0;line-height:1.12;}
  .wfq a{color:var(--rust);text-underline-offset:3px;}
  .wfq a:focus-visible,.wfq button:focus-visible,.wfq textarea:focus-visible,.wfq input:focus-visible{outline:2px solid var(--rust-hi);outline-offset:3px;}

  .wfq-page{
    max-width:720px;
    margin:0 auto;
    padding-inline:20px;
    padding-block:40px 150px;
    display:flex;
    flex-direction:column;
    gap:56px;
  }
  .wfq-eyebrow{font-family:var(--type);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--rust);}

  .wfq-masthead{display:flex;flex-direction:column;gap:22px;}
  .wfq-logo{width:168px;max-width:100%;height:auto;display:block;border:1px solid var(--line);}
  .wfq-masthead h1{font-size:clamp(38px,7vw,54px);font-weight:600;letter-spacing:-.01em;}
  .wfq-lede{display:flex;flex-direction:column;gap:14px;max-width:62ch;}

  .wfq-sec{display:flex;flex-direction:column;gap:18px;}
  .wfq-sec-head{display:flex;flex-direction:column;gap:6px;padding-bottom:10px;border-bottom:1px solid var(--line);}
  .wfq-sec-head h2{font-size:32px;font-weight:600;}
  .wfq-sec-head p{color:var(--ink-soft);font-size:18.5px;}
  .wfq-url{font-family:var(--type);font-size:15px;word-break:break-all;}

  .wfq-ledger{display:flex;flex-direction:column;}
  .wfq-row{display:grid;grid-template-columns:11.5rem minmax(0,1fr);gap:4px 22px;padding-block:14px;border-bottom:1px dashed var(--line);}
  .wfq-row:last-child{border-bottom:0;}
  .wfq-k{font-family:var(--type);font-size:14px;color:var(--rust);padding-top:4px;}
  .wfq-v{font-size:19px;}
  .wfq-v small{display:block;color:var(--ink-soft);font-size:17px;margin-top:2px;}

  .wfq-onsale{display:flex;flex-direction:column;border:1px solid var(--line);background:var(--card);}
  .wfq-ev{display:grid;grid-template-columns:6.5rem minmax(0,1fr) auto;gap:4px 18px;align-items:baseline;padding:12px 18px;border-bottom:1px solid var(--line);}
  .wfq-ev:last-child{border-bottom:0;}
  .wfq-d{font-family:var(--type);font-size:14px;color:var(--rust);font-variant-numeric:tabular-nums;}
  .wfq-n{font-size:19px;}
  .wfq-s{font-family:var(--type);font-size:12.5px;color:var(--ink-soft);text-align:right;}

  .wfq-fixnow{background:var(--paper-2);border:1px solid var(--line);padding:22px 22px 20px;display:flex;flex-direction:column;gap:12px;}
  .wfq-fixnow h3{font-size:25px;font-weight:600;}
  .wfq-fixnow ul{margin:0;padding-left:1.1em;display:flex;flex-direction:column;gap:4px;}
  .wfq-fixnow li::marker{color:var(--rust);}

  .wfq-hp{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;}

  .wfq-questions{display:flex;flex-direction:column;gap:30px;}
  .wfq-qwrap{display:flex;flex-direction:column;gap:18px;}
  .wfq-group{padding-top:10px;}
  .wfq fieldset{border:0;margin:0;padding:0;min-width:0;display:flex;flex-direction:column;gap:12px;}
  .wfq legend{padding:0;margin-bottom:12px;width:100%;display:flex;gap:14px;align-items:baseline;}
  .wfq-num{font-family:var(--type);font-size:15px;color:var(--rust);flex:0 0 32px;font-variant-numeric:tabular-nums;}
  .wfq-qt{font-size:24px;font-weight:600;color:var(--pine);line-height:1.2;text-wrap:balance;}
  .wfq-help{color:var(--ink-soft);font-size:18px;padding-left:var(--indent);max-width:calc(64ch + var(--indent));}
  .wfq-body{display:flex;flex-direction:column;gap:8px;padding-left:var(--indent);}

  .wfq-opt{
    position:relative;
    display:grid;
    grid-template-columns:auto minmax(0,1fr);
    gap:12px;
    align-items:center;
    padding:11px 14px;
    border:1px solid var(--line);
    background:var(--card);
    cursor:pointer;
    font-size:19px;
    line-height:1.3;
    transition:border-color .15s, background-color .15s;
  }
  .wfq-opt:hover{border-color:var(--rust-hi);}
  .wfq-opt input{position:absolute;opacity:0;width:1px;height:1px;margin:0;}
  .wfq-mark{width:18px;height:18px;border:1.5px solid var(--ink-soft);display:grid;place-items:center;}
  .wfq-mark.is-radio{border-radius:50%;}
  .wfq-mark::after{content:"";width:8px;height:8px;background:var(--rust-hi);transform:scale(0);transition:transform .12s;}
  .wfq-mark.is-radio::after{border-radius:50%;}
  .wfq-opt.is-on{border-color:var(--rust-hi);background:var(--tint);}
  .wfq-opt.is-on .wfq-mark{border-color:var(--rust-hi);}
  .wfq-opt.is-on .wfq-mark::after{transform:scale(1);}
  .wfq-opt:has(input:focus-visible){outline:2px solid var(--rust-hi);outline-offset:2px;}

  .wfq-contact{display:flex;flex-wrap:wrap;gap:6px 22px;font-family:var(--type);font-size:16px;padding:12px 14px;border:1px dashed var(--line);}

  .wfq-field{display:flex;flex-direction:column;gap:6px;margin-top:4px;}
  .wfq-field label{font-family:var(--type);font-size:12.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft);}
  .wfq-field input,.wfq-field textarea{
    font:inherit;font-size:19px;color:var(--ink);
    background:var(--card);border:1px solid var(--line);
    padding:10px 12px;width:100%;border-radius:0;
  }
  .wfq-field textarea{min-height:92px;resize:vertical;line-height:1.4;}
  .wfq-field input::placeholder,.wfq-field textarea::placeholder{color:var(--ink-soft);opacity:.7;}

  .wfq-send{display:flex;flex-direction:column;gap:16px;margin-top:26px;}
  .wfq-btn{
    font-family:var(--type);font-size:15px;letter-spacing:.04em;
    background:var(--rust);color:#fbf6ec;
    border:0;padding:13px 20px;cursor:pointer;border-radius:0;
    white-space:nowrap;
  }
  .wfq-btn:hover{background:var(--rust-hi);}
  .wfq-btn:disabled{opacity:.7;cursor:default;}
  .wfq-status{font-size:18px;color:var(--ink-soft);min-height:1.5em;}
  .wfq-status.is-ok{color:var(--pine);font-weight:600;}
  .wfq-status.is-err{color:var(--rust);}

  .wfq-bar{
    position:fixed;left:0;right:0;bottom:0;z-index:20;
    background:rgba(242,234,217,.96);
    border-top:1px solid var(--line);
    padding:12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
    backdrop-filter:blur(6px);
  }
  .wfq-bar-in{max-width:720px;margin:0 auto;display:flex;gap:16px;align-items:center;}
  .wfq-prog{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;}
  .wfq-prog-t{font-family:var(--type);font-size:13px;color:var(--ink-soft);}
  .wfq-track{height:4px;background:var(--paper-2);overflow:hidden;}
  .wfq-fill{height:100%;background:var(--rust-hi);transition:width .25s;}

  @media (max-width:560px){
    .wfq{font-size:19px;}
    .wfq-page{gap:48px;padding-block:28px 140px;}
    .wfq-row{grid-template-columns:minmax(0,1fr);gap:2px;}
    .wfq-ev{grid-template-columns:minmax(0,1fr);gap:2px;padding:12px 14px;}
    .wfq-s{text-align:left;}
    .wfq-help,.wfq-body{padding-left:0;}
    .wfq-qt{font-size:22px;}
    .wfq-btn{padding:12px 14px;font-size:14px;}
  }
  @media (prefers-reduced-motion: reduce){
    .wfq *{transition:none !important;}
  }
`;
