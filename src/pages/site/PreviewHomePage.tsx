import { useEffect, useRef, useState } from "react";
import { EVENTS, HOSTS, PARTNERS, BOOKING_URL } from "@/pages/site-shared";

/* Design preview for the home page (unlinked, noindex): calmer, brighter,
   photo-led — the "skill and professionalism" direction Dyllan asked for.
   Dates and hosts come from the same lists the live site uses. */

const STYLES = String.raw`
  .v2{
    --bg:#faf8f3;
    --white:#ffffff;
    --ink:#18211b;
    --ink-2:#555c55;
    --line:#e3ded2;
    --accent:#7a4424;
    --moss:#1f3327;
    background:var(--bg);
    color:var(--ink);
    font-family:'Hanken Grotesk', system-ui, sans-serif;
    font-size:17px;
    line-height:1.65;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }
  .v2 *{box-sizing:border-box;}
  .v2 a{color:inherit;text-decoration:none;}
  .v2 a:focus-visible{outline:2px solid var(--accent);outline-offset:3px;}
  .v2 img{display:block;max-width:100%;}
  .v2 figure{margin:0;}
  .v2 .c{max-width:1200px;margin:0 auto;padding-left:48px;padding-right:48px;}
  .v2 h1, .v2 h2, .v2 h3{
    font-family:'Cormorant Garamond', Georgia, serif;
    font-weight:400;
    margin:0;
    color:var(--ink);
    letter-spacing:-0.005em;
  }
  .v2 h2{font-size:clamp(36px,4.4vw,56px);line-height:1.04;}
  .v2 .label{
    font-size:12px;
    font-weight:500;
    letter-spacing:0.18em;
    text-transform:uppercase;
    color:var(--accent);
  }
  .v2 .btn{
    display:inline-block;
    background:var(--ink);
    color:var(--white);
    font-size:12.5px;
    font-weight:500;
    letter-spacing:0.16em;
    text-transform:uppercase;
    padding:18px 30px;
    transition:background .2s;
  }
  .v2 .btn:hover{background:var(--moss);}
  .v2 .tlink{
    display:inline-block;
    font-size:12.5px;
    font-weight:500;
    letter-spacing:0.16em;
    text-transform:uppercase;
    border-bottom:1px solid currentColor;
    padding-bottom:4px;
  }
  .v2 .tlink:hover{color:var(--accent);}

  /* preview notice */
  .v2 .mockbar{background:var(--ink);color:#cdd5cb;font-size:13px;text-align:center;padding:9px 16px;}
  .v2 .mockbar a{color:#fff;border-bottom:1px solid #fff;}

  /* header */
  .v2 .hd{background:var(--white);border-bottom:1px solid var(--line);}
  .v2 .hd-in{display:flex;align-items:center;justify-content:space-between;gap:32px;min-height:88px;}
  .v2 .brand img{height:50px;width:auto;}
  .v2 .hd nav{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px 28px;}
  .v2 .hd nav a{font-size:12px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink-2);}
  .v2 .hd nav a:hover{color:var(--ink);}

  /* hero */
  .v2 .hero-in{
    display:grid;
    grid-template-columns:minmax(0,5fr) minmax(0,6fr);
    gap:80px;
    align-items:center;
    padding-top:96px;
    padding-bottom:112px;
  }
  .v2 .hero h1{font-size:clamp(46px,6.2vw,86px);line-height:0.98;margin:24px 0 28px;}
  .v2 .hero p{font-size:18.5px;color:var(--ink-2);max-width:30em;margin:0;}
  .v2 .hero-cta{display:flex;align-items:center;flex-wrap:wrap;gap:22px 34px;margin-top:40px;}
  .v2 .hero-img img{width:100%;aspect-ratio:4/5;object-fit:cover;object-position:center 58%;}
  .v2 .hero-img figcaption{font-size:13px;color:var(--ink-2);margin-top:12px;}

  /* sections */
  .v2 .sec{padding:120px 0;}
  .v2 .sec.white{background:var(--white);}
  .v2 .sh{max-width:660px;margin-bottom:60px;}
  .v2 .sh h2{margin-top:18px;}
  .v2 .sh p{color:var(--ink-2);margin:22px 0 0;}

  /* upcoming dinners */
  .v2 .dl{list-style:none;margin:0;padding:0;border-top:1px solid var(--ink);}
  .v2 .dl li{
    display:grid;
    grid-template-columns:128px minmax(0,1fr) 170px;
    gap:32px;
    align-items:start;
    padding:34px 0;
    border-bottom:1px solid var(--line);
  }
  .v2 .dl .d{display:block;font-family:'Cormorant Garamond', Georgia, serif;font-size:60px;line-height:0.85;}
  .v2 .dl .m{display:block;margin-top:10px;font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-2);}
  .v2 .dl h3{font-size:31px;line-height:1.12;}
  .v2 .dl p{margin:10px 0 0;color:var(--ink-2);font-size:16px;max-width:36em;}
  .v2 .dl-side{text-align:right;padding-top:4px;}
  .v2 .dl-side .price{display:block;font-size:15px;color:var(--ink);margin-bottom:12px;}
  .v2 .after-list{margin-top:40px;}

  /* the work */
  .v2 .steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;}
  .v2 .steps img{width:100%;aspect-ratio:3/4;object-fit:cover;}
  .v2 .steps figcaption{padding-top:18px;font-size:15.5px;color:var(--ink-2);line-height:1.55;}
  .v2 .steps .n{display:block;font-size:12px;font-weight:500;letter-spacing:0.16em;color:var(--accent);margin-bottom:6px;}
  .v2 .steps strong{display:block;font-family:'Cormorant Garamond', Georgia, serif;font-weight:500;font-size:27px;color:var(--ink);line-height:1.1;margin-bottom:6px;}

  /* one plate */
  .v2 .dish{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:88px;align-items:start;}
  .v2 .dish-img img{width:100%;aspect-ratio:4/5;object-fit:cover;object-position:center 45%;}
  .v2 .dish h2{margin:18px 0 40px;}
  .v2 .dish dl{margin:0;border-top:1px solid var(--ink);}
  .v2 .dish dl div{display:grid;grid-template-columns:132px minmax(0,1fr);gap:24px;padding:22px 0;border-bottom:1px solid var(--line);}
  .v2 .dish dt{font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink);padding-top:4px;}
  .v2 .dish dd{margin:0;color:var(--ink-2);}
  .v2 .dish-img.slot{
    aspect-ratio:4/5;
    background:#efeae0;
    border:1px solid var(--line);
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    padding:32px;
  }
  .v2 .slot-note{font-size:15px;color:var(--ink-2);max-width:16em;}
  .v2 .slot-note .label{display:block;margin-bottom:8px;}
  .v2 .dish dd.todo{font-style:italic;}
  .v2 .dish dd.todo::before{
    content:"To come from Dyllan";
    display:block;
    font-style:normal;
    font-size:11px;
    font-weight:600;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:var(--accent);
    margin-bottom:4px;
  }
  .v2 .label-row{display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:40px;}
  .v2 .plate-count{font-size:12px;font-weight:500;letter-spacing:0.16em;color:var(--ink-2);font-variant-numeric:tabular-nums;}
  .v2 .plate-fade{animation:v2fade .45s ease both;}
  @keyframes v2fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
  .v2 .plate-ctrl{display:flex;align-items:center;gap:10px;}
  .v2 .plate-ctrl .plate-count{margin-right:8px;}
  .v2 .plate-ctrl button{
    width:40px;height:40px;
    display:flex;align-items:center;justify-content:center;
    border:1px solid var(--ink);
    border-radius:50%;
    background:transparent;
    color:var(--ink);
    cursor:pointer;
    transition:background .2s, color .2s;
  }
  .v2 .plate-ctrl button:hover{background:var(--ink);color:var(--white);}
  .v2 .plate-ctrl button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;}
  @media (prefers-reduced-motion:reduce){.v2 .plate-fade{animation:none;}}

  /* private chef */
  .v2 .tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px;}
  .v2 .tier{border-top:1px solid var(--ink);padding-top:26px;}
  .v2 .tier .price{font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--accent);}
  .v2 .tier h3{font-size:32px;line-height:1.1;margin:12px 0 14px;}
  .v2 .tier p{margin:0;color:var(--ink-2);font-size:16px;}
  .v2 .tier-foot{
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:20px 40px;
    margin-top:56px;
    padding-top:28px;
    border-top:1px solid var(--line);
    font-size:15px;
    color:var(--ink-2);
  }

  /* chef */
  .v2 .chef{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,6fr);gap:88px;align-items:center;}
  .v2 .chef-img img{width:100%;aspect-ratio:4/5;object-fit:cover;object-position:center 30%;}
  .v2 .chef h2{margin:18px 0 26px;}
  .v2 .chef p{color:var(--ink-2);margin:0 0 18px;max-width:34em;}
  .v2 .chef blockquote{
    margin:34px 0 34px;
    padding-left:26px;
    border-left:1px solid var(--accent);
    font-family:'Cormorant Garamond', Georgia, serif;
    font-style:italic;
    font-size:25px;
    line-height:1.35;
    color:var(--ink);
    max-width:28em;
  }

  /* guest words */
  .v2 .center{text-align:center;}
  .v2 .quotes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:72px;margin-top:48px;}
  .v2 .quotes blockquote{margin:0;}
  .v2 .quotes p{
    font-family:'Cormorant Garamond', Georgia, serif;
    font-style:italic;
    font-size:27px;
    line-height:1.35;
    margin:0 0 20px;
  }
  .v2 .quotes cite{font-style:normal;font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-2);}

  /* hosts */
  .v2 .roll{
    max-width:920px;
    margin:26px auto 0;
    text-align:center;
    font-family:'Cormorant Garamond', Georgia, serif;
    font-size:29px;
    line-height:1.6;
  }
  .v2 .roll .sep{color:var(--accent);padding:0 12px;}
  .v2 .roll .h{white-space:nowrap;}
  .v2 .roll-next{margin-top:64px;}

  /* also */
  .v2 .also{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;}
  .v2 .also a{display:block;background:var(--white);border:1px solid var(--line);padding:40px;transition:border-color .2s;}
  .v2 .also a:hover{border-color:var(--ink);}
  .v2 .also h3{font-size:32px;line-height:1.1;margin:14px 0 12px;}
  .v2 .also p{margin:0 0 24px;color:var(--ink-2);font-size:16px;}

  /* book */
  .v2 .book{background:var(--moss);color:#e9ece4;padding:120px 0;text-align:center;}
  .v2 .book .label{color:#c9a46a;}
  .v2 .book h2{color:#fff;margin:18px auto 40px;max-width:14em;}
  .v2 .book-lines{display:flex;justify-content:center;flex-wrap:wrap;gap:14px 48px;}
  .v2 .book-lines a{
    font-family:'Cormorant Garamond', Georgia, serif;
    font-size:clamp(24px,2.6vw,32px);
    color:#fff;
    border-bottom:1px solid rgba(255,255,255,.35);
    overflow-wrap:anywhere;
  }
  .v2 .book-lines a:hover{border-bottom-color:#fff;}
  .v2 .book p{margin:30px 0 0;font-size:14px;letter-spacing:0.06em;color:#b9c2b6;}
  .v2 .ft{background:var(--moss);border-top:1px solid rgba(255,255,255,.12);color:#9fab9c;font-size:13px;padding:26px 0;text-align:center;}

  @media (max-width:980px){
    .v2 .c{padding-left:28px;padding-right:28px;}
    .v2 .hd-in{flex-direction:column;justify-content:center;gap:14px;padding:18px 0;}
    .v2 .hd nav{justify-content:center;gap:6px 20px;}
    .v2 .hero-in, .v2 .dish, .v2 .chef{grid-template-columns:minmax(0,1fr);gap:48px;}
    .v2 .hero-in{padding-top:56px;padding-bottom:80px;}
    .v2 .steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:36px 20px;}
    .v2 .tiers{grid-template-columns:minmax(0,1fr);gap:36px;}
    .v2 .quotes{grid-template-columns:minmax(0,1fr);gap:48px;}
    .v2 .also{grid-template-columns:minmax(0,1fr);}
    .v2 .sec, .v2 .book{padding:84px 0;}
  }
  @media (max-width:640px){
    .v2 .c{padding-left:20px;padding-right:20px;}
    .v2 .brand img{height:44px;}
    .v2 .dl li{grid-template-columns:62px minmax(0,1fr);gap:18px;padding:28px 0;}
    .v2 .dl .d{font-size:44px;}
    .v2 .dl .m{font-size:11px;letter-spacing:0.12em;}
    .v2 .dl .wd{display:none;}
    .v2 .dl h3{font-size:26px;}
    .v2 .dl-side{grid-column:2;text-align:left;padding-top:0;display:flex;align-items:baseline;gap:20px;}
    .v2 .dl-side .price{margin:0;}
    .v2 .dish dl div{grid-template-columns:minmax(0,1fr);gap:6px;}
    .v2 .steps figcaption{font-size:14.5px;}
    .v2 .steps strong{font-size:23px;}
    .v2 .quotes p{font-size:24px;}
    .v2 .roll{font-size:23px;}
    .v2 .roll .sep{padding:0 8px;}
    .v2 .roll.partners .h{white-space:normal;}
    .v2 .roll-next{margin-top:48px;}
    .v2 .also a{padding:30px 24px;}
    .v2 .sec, .v2 .book{padding:68px 0;}
  }
`;

const NAV = [
  ["/farm-to-table", "Farm to Table"],
  ["/private-chef", "Private Chef"],
  ["/learn", "Learn"],
  ["/recipes", "Recipes"],
  ["/shop", "Shop"],
  ["/story", "Our Story"],
  ["/contact", "Contact"],
];

function renderDinners(): string {
  const today = new Date().toLocaleDateString("en-CA");
  const dinners = EVENTS.filter((e) => e.kind === "dinner" && e.date >= today);
  if (!dinners.length) {
    return `<li><div></div><div><h3>New dates coming soon</h3><p>The next dinners are being set with our farm hosts. Call or email to hear first.</p></div></li>`;
  }
  return dinners
    .map((e) => {
      const d = new Date(`${e.date}T12:00:00`);
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      // The shared note starts with the full date, which the date column already shows.
      const parts = e.note.split(" · ");
      const details = /\d{4}/.test(parts[0]) ? parts.slice(1).join(" · ") : e.note;
      const price = e.price.startsWith("$") ? `<span class="price">${e.price.replace(" / ", " per ")}</span>` : "";
      return `<li>
          <div><span class="d">${d.getDate()}</span><span class="m">${month}<span class="wd"> · ${weekday}</span></span></div>
          <div><h3>${e.name}</h3><p>${details}</p></div>
          <div class="dl-side">${price}<a class="tlink" href="${BOOKING_URL}" target="_blank" rel="noopener">Tickets</a></div>
        </li>`;
    })
    .join("\n        ");
}

const PAGE_TOP = `<div class="mockbar">Design preview — not live yet. <a href="/">See the current home page</a></div>

<header class="hd">
  <div class="c hd-in">
    <a class="brand" href="/preview"><img src="/images/logo-lockup.webp" alt="Wild Foods by Dyllan"></a>
    <nav>${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}</nav>
  </div>
</header>

<section class="hero">
  <div class="c hero-in">
    <div>
      <div class="label">Chef Dyllan Dale · Springfield, Missouri</div>
      <h1>The forest and field, served as fine dining.</h1>
      <p>Farm-to-table dinners and private chef service, built on small Ozarks farms and seasonal produce — and finished with wild foods Dyllan forages himself.</p>
      <div class="hero-cta">
        <a class="btn" href="#dinners">Upcoming farm dinners</a>
        <a class="tlink" href="#private-chef">Book a private chef</a>
      </div>
    </div>
    <figure class="hero-img">
      <img src="/images/duo-plating.webp" alt="Chef Dyllan Dale finishing a long table of tartlet courses by hand">
      <figcaption>Finishing a course for a farm dinner, one plate at a time.</figcaption>
    </figure>
  </div>
</section>

<section class="sec white" id="dinners">
  <div class="c">
    <div class="sh">
      <div class="label">Farm dinners</div>
      <h2>At the table this season</h2>
      <p>Ticketed dinners set at the farms, ranches, and orchards that raise the food. Each menu is crafted from farm-fresh ingredients, seasonal produce, and wild foods foraged throughout the Ozarks.</p>
    </div>
    <ol class="dl">
        ${renderDinners()}
    </ol>
    <div class="after-list"><a class="tlink" href="/farm-to-table">All dates, workshops &amp; catering</a></div>
  </div>
</section>

<section class="sec">
  <div class="c">
    <div class="sh">
      <div class="label">The work</div>
      <h2>What goes into every plate</h2>
      <p>Wild ingredients are foraged by hand. Farm ingredients come through real relationships with Ozarks growers, ranchers, and makers. Every menu is built from scratch around the season, and every plate is finished by hand before it leaves the kitchen.</p>
    </div>
    <div class="steps">
      <figure>
        <img src="/images/creek-foraging.jpg" alt="Dyllan foraging along an Ozarks creek with his dog">
        <figcaption><span class="n">01</span><strong>Gathered</strong>Wild foods foraged by hand, only in season.</figcaption>
      </figure>
      <figure>
        <img src="/images/duo-plating.webp" alt="Hands placing garnish on a row of tartlets" style="object-position:center 60%;">
        <figcaption><span class="n">02</span><strong>Finished</strong>Every plate completed by hand at the pass.</figcaption>
      </figure>
      <figure>
        <img src="/images/plated-tartare.jpg" alt="A composed tartare course on a teal plate" style="object-position:48% center;">
        <figcaption><span class="n">03</span><strong>Composed</strong>One course, built around what the season gave that week.</figcaption>
      </figure>
      <figure>
        <img src="/images/dish-short-rib.webp" alt="A braised short rib course carried out to the table" style="object-position:40% center;">
        <figcaption><span class="n">04</span><strong>Served</strong>Course by course, at the farm or in your home.</figcaption>
      </figure>
    </div>
  </div>
</section>`;

const PAGE_BOTTOM = `<section class="sec" id="private-chef">
  <div class="c">
    <div class="sh">
      <div class="label">Private chef</div>
      <h2>A restaurant-level dinner, in your home</h2>
      <p>Every menu starts with a conversation about your tastes, your guests, and the season, then is built from scratch. Farm-to-table, wild, or a blend of both.</p>
    </div>
    <div class="tiers">
      <div class="tier">
        <div class="price">$90 per guest</div>
        <h3>Harvest Buffet</h3>
        <p>A curated spread of seasonal, hyper-local dishes — relaxed and abundant, for celebrations and larger groups.</p>
      </div>
      <div class="tier">
        <div class="price">$120 per guest</div>
        <h3>Gathered Family Style</h3>
        <p>A dedicated server presents and serves each dish at the table, built for connection over the meal.</p>
      </div>
      <div class="tier">
        <div class="price">$150 per guest</div>
        <h3>Chef's Table Plated</h3>
        <p>The full restaurant experience at home: every course individually plated and presented at its highest level.</p>
      </div>
    </div>
    <div class="tier-foot">
      <span>Five-guest minimum · 50% deposit reserves your date · Menu, sourcing, cooking, service &amp; cleanup included</span>
      <a class="tlink" href="/private-chef">Plan a private dinner</a>
    </div>
  </div>
</section>

<section class="sec white">
  <div class="c chef">
    <figure class="chef-img">
      <img src="/images/chef-portrait.jpg" alt="Chef Dyllan Dale in a black chef coat, holding a finished bite">
    </figure>
    <div>
      <div class="label">The chef</div>
      <h2>Dyllan Dale</h2>
      <p>Dyllan grew up in the Ozarks countryside and started in restaurant kitchens at sixteen, washing dishes and bussing tables. He worked his way up the line and was managing a kitchen by twenty-eight.</p>
      <p>He learned under his mentor, Rob Connoley of Bulrush in St. Louis, finished his culinary degree, and brings more than a decade in professional kitchens to every menu. He lives in Seymour, Missouri, with his wife and five kids.</p>
      <blockquote>“I don't think I will ever leave the Ozarks — I hope to bring the flavors of the forest and field to people through fine dining and education.”</blockquote>
      <a class="tlink" href="/story">Read his story</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="c">
    <div class="label center">From the table</div>
    <div class="quotes">
      <blockquote>
        <p>“I was skeptical at first — I couldn't pronounce any of the dishes on the menu. I couldn't believe how incredibly good the food tasted. A 10 out of 10 night.”</p>
        <cite>Noah H.</cite>
      </blockquote>
      <blockquote>
        <p>“A wonderful, quiet evening of meeting new friends and enjoying an artfully prepared, wild foraged, six-course dinner. I will be returning as often as possible.”</p>
        <cite>Jobeth S.</cite>
      </blockquote>
    </div>
  </div>
</section>

<section class="sec white">
  <div class="c">
    <div class="label center">Dinners hosted at</div>
    <p class="roll">${HOSTS.map((h) => `<span class="h">${h.name}</span>`).join('<span class="sep">·</span> ')}</p>
    <div class="label center roll-next">In partnership with</div>
    <p class="roll partners">${PARTNERS.map((p) => `<span class="h">${p}</span>`).join('<span class="sep">·</span> ')}</p>
  </div>
</section>

<section class="sec">
  <div class="c also">
    <a href="/learn">
      <div class="label">Learn</div>
      <h3>Foraging walks &amp; classes</h3>
      <p>Two- and four-hour walks on your land, one-on-one consultations, and teaching for schools, conferences, and community groups.</p>
      <span class="tlink">Rates &amp; booking</span>
    </a>
    <a href="/recipes">
      <div class="label">Recipes</div>
      <h3>From Dyllan's kitchen</h3>
      <p>Foraged fruits, ferments, nuts, and preserves — searchable and ready to print for the kitchen counter.</p>
      <span class="tlink">Browse recipes</span>
    </a>
  </div>
</section>

<section class="book">
  <div class="c">
    <div class="label">Book</div>
    <h2>Every date starts with a conversation.</h2>
    <div class="book-lines">
      <a href="tel:14174039265">417-403-9265</a>
      <a href="mailto:dyllan@wildfoodsbydyllan.com">dyllan@wildfoodsbydyllan.com</a>
    </div>
    <p>Springfield, Missouri · serving the Ozarks</p>
  </div>
</section>
<footer class="ft"><div class="c">Wild Foods by Dyllan · Springfield, Missouri</div></footer>`;

/* "One plate" gallery. Each entry is one dish Dyllan has told us about; the
   arrows only appear once there are two or more. Drop the draft entry as soon
   as a second real plate arrives. */
type Plate = {
  name: string;
  image?: { src: string; alt: string; position?: string };
  slot?: string; // shown until the photo arrives
  rows: { label: string; text: string }[];
  draft?: boolean;
};

const PLATES: Plate[] = [
  {
    name: "Seared duck, wild rice & mugolio apple chutney",
    slot: "The seared duck, from Dyllan's original file",
    rows: [
      {
        label: "The farms",
        text: "Duck breast from Redbud Duck Co. in Ava. Wild rice with oyster mushrooms from Mo' Mushrooms and onions from Ozarks Farm Stop. Seared daikon radish with a coconut cream reduction, and baby chard.",
      },
      { label: "The chutney", text: "Apple chutney made with mugolio, a syrup of young pine cones — two years in the making." },
      {
        label: "The plate",
        text: "Dyllan worked on this dish for a year before the plating finally came together. “Duck is a delicate protein to work with, because every cut has to be done just right.”",
      },
    ],
  },
  {
    name: "The next signature plate",
    slot: "The finished plate, shot from above and at table height",
    draft: true,
    rows: [
      { label: "The farms", text: "Which farms the ingredients come from." },
      { label: "The wild", text: "What's foraged for it, and where and when." },
      { label: "The plate", text: "How long it took to get right, and what makes it hard to do well." },
    ],
  },
];

function PlateGallery() {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const plate = PLATES[index];
  const many = PLATES.length > 1;
  const go = (step: number) => setIndex((i) => (i + step + PLATES.length) % PLATES.length);

  useEffect(() => {
    PLATES.forEach((p) => {
      if (p.image) new Image().src = p.image.src;
    });
  }, []);

  return (
    <section
      className="sec white"
      aria-roledescription={many ? "carousel" : undefined}
      aria-label="Signature plates"
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (!many || touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="c dish">
        <figure className={`dish-img plate-fade${plate.image ? "" : " slot"}`} key={`img-${index}`}>
          {plate.image ? (
            <img
              src={plate.image.src}
              alt={plate.image.alt}
              style={plate.image.position ? { objectPosition: plate.image.position } : undefined}
            />
          ) : (
            <div className="slot-note">
              <span className="label">Photo coming</span>
              {plate.slot}
            </div>
          )}
        </figure>
        <div>
          <div className="label-row">
            <div className="label">{many ? "Signature plates" : "One plate"}</div>
            {many && (
              <div className="plate-ctrl">
                <span className="plate-count" aria-live="polite">
                  {String(index + 1).padStart(2, "0")} / {String(PLATES.length).padStart(2, "0")}
                </span>
                <button type="button" onClick={() => go(-1)} aria-label="Previous plate">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next plate">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="plate-fade" key={`body-${index}`}>
            <h2>{plate.name}</h2>
            <dl>
              {plate.rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd className={plate.draft ? "todo" : undefined}>{r.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PreviewHomePage() {
  useEffect(() => {
    document.title = "Design Preview — Wild Foods by Dyllan";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&display=swap";
    document.head.append(robots, font);
    return () => {
      robots.remove();
      font.remove();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="v2">
        <div dangerouslySetInnerHTML={{ __html: PAGE_TOP }} />
        <PlateGallery />
        <div dangerouslySetInnerHTML={{ __html: PAGE_BOTTOM }} />
      </div>
    </>
  );
}
