import { useEffect } from "react";
import "@/demos/demos.css";
import { DemoFrames, DemoPlayer } from "@/demos/DemoPlayer";
import { SITE_STYLES } from "@/pages/site-shared";
import { V2_STYLES } from "@/pages/v2";
import { labelStyle, wrapStyle } from "@/pages/site/AdminRecipesPage";
import { ADMIN_DEMOS } from "@/pages/site/adminDemos";

/* /admin/how: a short walkthrough "video" for each admin page. Open without logging in
   (it only shows example data) so a texted link plays straight away. */

const STYLES = `${SITE_STYLES}
${V2_STYLES}
.how .demo{
  --demo-ink:var(--ink); --demo-muted:var(--ink-soft); --demo-accent:var(--rust); --demo-line:var(--line);
  --demo-card:#fff; --demo-wash:var(--paper-dark); --demo-font:Georgia, serif;
  padding:44px 0; border-top:1px solid var(--line);
}
.how .demo-head h2{font-size:30px;font-weight:normal;}
.how .demo-head p{font-size:17px;}
.how .toc{display:flex;flex-wrap:wrap;gap:8px 18px;margin:18px 0 12px;padding:0;list-style:none;font-size:16px;}
.how .toc a{color:var(--rust-deep);}
.v2.demo-v2 h2{font-size:34px;}
.v2.demo-v2 .dl li{grid-template-columns:62px minmax(0,1fr);gap:18px;padding:22px 0;}
.v2.demo-v2 .dl .d{font-size:44px;}
.v2.demo-v2 .dl .m{font-size:11px;letter-spacing:.12em;}
.v2.demo-v2 .dl .wd{display:none;}
.v2.demo-v2 .dl h3{font-size:24px;}
.v2.demo-v2 .dl p{font-size:15px;margin-top:6px;}
.v2.demo-v2 .dl-side{grid-column:2;text-align:left;padding-top:0;}
.v2.demo-v2 .dl-side .price{margin:0 0 8px;}
.v2.demo-v2 .tix{flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:10px 18px;}
.v2.demo-v2 .dl li:nth-child(3){opacity:var(--new);background:rgba(168,90,34,calc(var(--new) * .1));}
.v2.demo-v2 .quotes{grid-template-columns:minmax(0,1fr);gap:30px;margin-top:22px;}
.v2.demo-v2 .quotes p{font-size:23px;margin-bottom:12px;}
.v2.demo-v2 .qmark{font-size:110px;height:46px;}
`;

export function AdminHowPage() {
  // ?frames=<id> lays one walkthrough out frame by frame, for checking it.
  const q = new URLSearchParams(window.location.search);
  const framesOf = ADMIN_DEMOS.find((d) => d.id === q.get("frames"));
  useEffect(() => {
    document.title = "How-to videos — Wild Foods admin";
    // Land on the demo an admin page linked to. The page renders after the browser's own
    // hash jump, and the stages resize once measured, so jump after they settle.
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant" as ScrollBehavior }), 120);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="how" style={{ ...wrapStyle, maxWidth: framesOf ? "none" : 1000, ...(framesOf ? { padding: 8 } : null) }}>
        {framesOf ? null : (
          <>
            <a href="/admin" style={{ ...labelStyle, display: "inline", textDecoration: "none" }}>
              ← All admin
            </a>
            <h1 style={{ fontSize: 34, margin: "14px 0 6px", fontWeight: "normal" }}>How to use your admin</h1>
            <p style={{ fontSize: 17, color: "var(--ink-soft)", marginTop: 0 }}>
              A short walkthrough for each page. They play on their own while on screen; tap a step to jump to it, or pause any time. The names,
              dates and reviews in them are examples.
            </p>
            <ul className="toc">
              {ADMIN_DEMOS.map((d) => (
                <li key={d.id}>
                  <a href={`#${d.id}`}>{d.title}</a>
                </li>
              ))}
            </ul>
          </>
        )}
        {framesOf ? (
          <DemoFrames demo={framesOf} every={Number(q.get("every")) || 1.5} scale={Number(q.get("scale")) || 0.4} at={q.get("at") ? q.get("at")!.split(",").map(Number) : undefined} />
        ) : (
          ADMIN_DEMOS.map((d) => <DemoPlayer key={d.id} demo={d} />)
        )}
      </div>
    </>
  );
}
