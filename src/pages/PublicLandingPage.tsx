import { useEffect } from "react";

const PAGE_STYLES = String.raw`
  :root{
    --paper:#f2ead9;
    --paper-dark:#e8dcc2;
    --ink:#1f2e22;
    --ink-soft:#3c4a3c;
    --pine:#1f3327;
    --rust:#a85a22;
    --rust-deep:#8a4818;
    --plum:#5e1e2e;
    --line:#c9bb9a;
    --gold:#b48a3f;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    margin:0;
    overflow-x:hidden;
    background:var(--paper);
    color:var(--ink);
    font-family:'Cormorant Garamond', Georgia, serif;
    font-size:19px;
    line-height:1.55;
    background-image:
      radial-gradient(circle at 20% 10%, rgba(180,138,63,0.06), transparent 40%),
      radial-gradient(circle at 80% 60%, rgba(31,51,39,0.05), transparent 45%);
  }
  .stamp-font{font-family:'Special Elite', 'Courier New', monospace;}
  a{color:inherit;}
  .wrap{max-width:960px;margin:0 auto;padding-left:28px;padding-right:28px;}
  .wrap-narrow{max-width:700px;margin:0 auto;padding-left:28px;padding-right:28px;}

  /* torn / deckle divider */
  .deckle{
    height:14px;
    width:100%;
    background:
      linear-gradient(135deg, var(--paper) 6px, transparent 0) 0 0,
      linear-gradient(225deg, var(--paper) 6px, transparent 0) 0 0;
    background-size:14px 14px;
    background-repeat:repeat-x;
    background-color:var(--pine);
  }
  .deckle.rev{
    background-color:var(--paper);
    transform:rotate(180deg);
  }

  /* ===== MASTHEAD ===== */
  header.mast{
    background:var(--pine);
    color:var(--paper);
    padding:56px 0 46px;
    text-align:center;
    position:relative;
  }
  header.mast::after{
    content:"";
    position:absolute;left:0;right:0;bottom:0;height:14px;
    background-image:
      linear-gradient(135deg, var(--pine) 6px, transparent 0) 0 0,
      linear-gradient(225deg, var(--pine) 6px, transparent 0) 0 0;
    background-size:14px 14px;background-repeat:repeat-x;background-color:var(--paper);
  }
  .mark{
    width:54px;height:54px;margin:0 auto 18px;opacity:0.92;
  }
  .eyebrow-plate{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.32em;
    text-transform:uppercase;
    color:var(--gold);
    margin-bottom:14px;
  }
  header.mast h1{
    font-family:'Cormorant Garamond', serif;
    font-weight:600;
    font-size:clamp(40px,7vw,74px);
    margin:0 0 10px;
    letter-spacing:0.01em;
  }
  header.mast .sub{
    font-style:italic;
    font-size:20px;
    color:#d9d2bc;
    max-width:520px;
    margin:0 auto 22px;
  }
  .colophon{
    font-family:'Special Elite', monospace;
    font-size:11.5px;
    letter-spacing:0.06em;
    color:#a9b6a3;
    display:flex;
    gap:26px;
    justify-content:center;
    flex-wrap:wrap;
    margin-top:6px;
  }

  /* ===== PLATE / OPENING PHOTO ===== */
  .plate-photo{
    position:relative;
    margin:0;
  }
  .plate-photo img{
    width:100%;
    display:block;
    height:64vh;
    min-height:420px;
    object-fit:cover;
    object-position:center 20%;
    filter:saturate(0.94) contrast(1.02);
  }
  .plate-caption{
    position:absolute;
    left:0;right:0;bottom:0;
    padding:44px 28px 30px;
    background:linear-gradient(0deg, rgba(10,14,10,0.94) 0%, rgba(10,14,10,0.82) 45%, rgba(10,14,10,0.15) 90%, rgba(10,14,10,0) 100%);
    color:#f1ead8;
  }
  .plate-caption .fig{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.18em;
    text-transform:uppercase;
    color:#e0cd8f;
    margin-bottom:8px;
    text-shadow:0 1px 6px rgba(0,0,0,0.6);
  }
  .plate-caption blockquote{
    margin:0;
    font-style:italic;
    font-size:clamp(20px,3vw,30px);
    font-weight:500;
    max-width:640px;
    line-height:1.35;
    text-shadow:0 1px 8px rgba(0,0,0,0.55);
  }

  /* ===== SECTION LABEL ===== */
  section{padding:78px 0;}
  .sec-label{
    display:flex;
    align-items:center;
    gap:16px;
    margin-bottom:44px;
  }
  .sec-label .num{
    font-family:'Special Elite', monospace;
    font-size:13px;
    color:var(--rust);
    border:1px solid var(--rust);
    border-radius:50%;
    width:34px;height:34px;
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;
  }
  .sec-label h2{
    font-family:'Cormorant Garamond',serif;
    font-weight:600;
    font-size:clamp(26px,4vw,38px);
    margin:0;
    color:var(--pine);
  }
  .sec-label .rule{flex:1;height:1px;background:var(--line);}

  /* ===== FIELD NOTES (biography ledger) ===== */
  .ledger{
    border-top:1px solid var(--line);
  }
  .entry{
    display:grid;
    grid-template-columns:120px 1fr;
    gap:26px;
    padding:26px 0;
    border-bottom:1px solid var(--line);
  }
  .entry .when{
    font-family:'Special Elite', monospace;
    font-size:13px;
    color:var(--rust-deep);
    padding-top:4px;
  }
  .entry .when .age{
    display:block;
    font-family:'Cormorant Garamond',serif;
    font-size:34px;
    font-weight:600;
    color:var(--pine);
    line-height:1;
    margin-bottom:4px;
  }
  .entry h3{
    margin:0 0 6px;
    font-size:22px;
    font-weight:600;
    color:var(--ink);
  }
  .entry p{margin:0;color:var(--ink-soft);}
  .entry p + p{margin-top:10px;}

  /* pull quote in the margin style */
  .marginalia{
    font-style:italic;
    color:var(--plum);
    border-left:2px solid var(--rust);
    padding-left:16px;
    margin:36px 0 0;
    font-size:21px;
    max-width:560px;
  }

  /* ===== PHOTO PAIR (foraging / family) ===== */
  .duo{
    display:grid;
    grid-template-columns:1.2fr 1fr;
    gap:22px;
    align-items:end;
    margin-top:52px;
  }
  .duo figure{margin:0;}
  .duo img{width:100%;display:block;border-radius:2px;}
  .duo figcaption{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.04em;
    color:var(--ink-soft);
    margin-top:8px;
  }

  /* ===== MENU / TABLE section ===== */
  .menu-block{
    background:var(--paper-dark);
    border:1px solid var(--line);
    padding:44px 40px;
  }
  .menu-block h3.tier{
    display:flex;
    align-items:baseline;
    gap:10px;
    font-weight:600;
    font-size:25px;
    color:var(--pine);
    margin:0 0 4px;
  }
  .menu-block h3.tier .leader{
    flex:1;
    border-bottom:2px dotted var(--gold);
    transform:translateY(-6px);
  }
  .menu-block h3.tier .price{
    font-family:'Special Elite', monospace;
    font-size:19px;
    color:var(--rust-deep);
    white-space:nowrap;
  }
  .menu-block .tier-desc{
    color:var(--ink-soft);
    margin:0 0 30px;
    max-width:640px;
  }
  .menu-tier + .menu-tier{margin-top:2px;}

  .dish-list{
    columns:2;
    column-gap:40px;
    margin-top:36px;
    padding-top:26px;
    border-top:1px dashed var(--line);
  }
  .dish-list h4{
    font-family:'Special Elite', monospace;
    font-size:12px;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:var(--rust);
    margin:0 0 12px;
    break-after:avoid;
  }
  .dish-list ul{list-style:none;margin:0 0 26px;padding:0;break-inside:avoid;}
  .dish-list li{
    padding:6px 0;
    border-bottom:1px dotted var(--line);
    font-size:18px;
  }

  /* ===== SPECIMEN GALLERY ===== */
  .specimens{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:26px 22px;
    margin-top:10px;
  }
  .specimen{
    background:var(--paper);
  }
  .specimen:nth-child(3n+2){margin-top:34px;}
  .specimen img{
    width:100%;
    aspect-ratio:4/5;
    object-fit:cover;
    display:block;
    border:1px solid var(--ink);
    padding:6px;
    background:var(--paper);
    box-shadow:2px 3px 0 rgba(31,51,39,0.12);
  }
  .specimen .tag{
    margin-top:10px;
    text-align:center;
  }
  .specimen .tag .no{
    font-family:'Special Elite', monospace;
    font-size:10.5px;
    color:var(--rust);
    letter-spacing:0.08em;
  }
  .specimen .tag .name{
    font-style:italic;
    font-size:17px;
    color:var(--ink);
  }

  /* ===== RATE LEDGER (foraging / teaching / consulting) ===== */
  .rate-ledger{
    border:1px solid var(--ink);
    background:var(--paper);
  }
  .rate-ledger table{
    width:100%;
    border-collapse:collapse;
  }
  .rate-ledger th{
    text-align:left;
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:var(--paper);
    background:var(--pine);
    padding:12px 18px;
  }
  .rate-ledger td{
    padding:14px 18px;
    border-bottom:1px solid var(--line);
    vertical-align:top;
  }
  .rate-ledger tr:last-child td{border-bottom:none;}
  .rate-ledger td.svc{font-weight:600;color:var(--pine);width:34%;}
  .rate-ledger td.rate{
    font-family:'Special Elite', monospace;
    font-size:15px;
    color:var(--rust-deep);
    white-space:nowrap;
    width:20%;
  }
  .rate-ledger td.note{color:var(--ink-soft);font-size:17px;}

  /* ===== TESTIMONIAL MARGIN NOTES ===== */
  .margin-notes{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:40px 50px;
  }
  .margin-note{
    position:relative;
    padding-left:22px;
  }
  .margin-note::before{
    content:"\201C";
    position:absolute;left:-4px;top:-14px;
    font-family:Georgia, serif;
    font-size:56px;
    color:var(--gold);
    opacity:0.5;
  }
  .margin-note p{
    font-style:italic;
    color:var(--ink-soft);
    margin:0 0 10px;
    font-size:18px;
  }
  .margin-note cite{
    font-family:'Special Elite', monospace;
    font-style:normal;
    font-size:12px;
    letter-spacing:0.08em;
    color:var(--rust);
  }

  /* ===== BOOK / CONTACT ===== */
  .colophon-block{
    background:var(--plum);
    color:var(--paper);
    padding:70px 0 60px;
    text-align:center;
    position:relative;
  }
  .colophon-block::before{
    content:"";
    position:absolute;top:0;left:0;right:0;height:14px;
    background-image:
      linear-gradient(135deg, var(--plum) 6px, transparent 0) 0 0,
      linear-gradient(225deg, var(--plum) 6px, transparent 0) 0 0;
    background-size:14px 14px;background-repeat:repeat-x;background-color:var(--paper);
    transform:translateY(-100%);
  }
  .colophon-block h2{
    font-family:'Cormorant Garamond',serif;
    font-weight:600;
    font-size:clamp(30px,5vw,46px);
    margin:0 0 14px;
  }
  .colophon-block p.sub{
    font-style:italic;
    color:#e6c9b8;
    max-width:480px;
    margin:0 auto 34px;
    font-size:19px;
  }
  .stamp{
    display:inline-flex;
    align-items:center;
    gap:14px;
    border:2px solid var(--gold);
    border-radius:50%;
    width:168px;height:168px;
    justify-content:center;
    flex-direction:column;
    margin:0 auto 40px;
    color:var(--gold);
    transform:rotate(-6deg);
  }
  .stamp span{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.14em;
    text-align:center;
    line-height:1.5;
  }
  .contact-line{
    display:flex;
    gap:34px;
    justify-content:center;
    flex-wrap:wrap;
    font-family:'Special Elite', monospace;
    font-size:15px;
    letter-spacing:0.03em;
  }
  .contact-line a{
    color:var(--paper);
    text-decoration:none;
    border-bottom:1px solid var(--gold);
    padding-bottom:2px;
  }

  footer{
    background:var(--pine);
    color:#a9b6a3;
    text-align:center;
    padding:22px 0;
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.05em;
  }

  @media (max-width:820px){
    .entry{grid-template-columns:1fr;gap:8px;}
    .entry .when{display:flex;align-items:baseline;gap:10px;}
    .entry .when .age{margin-bottom:0;font-size:26px;}
    .duo{grid-template-columns:1fr;}
    .specimens{grid-template-columns:repeat(2,1fr);}
    .specimen:nth-child(3n+2){margin-top:0;}
    .specimen:nth-child(2n){margin-top:34px;}
    .dish-list{columns:1;}
    .margin-notes{grid-template-columns:1fr;}
    .menu-block{padding:32px 22px;}
    .menu-block h3.tier{flex-wrap:wrap;row-gap:4px;}
    .menu-block h3.tier .leader{display:none;}
    .menu-block h3.tier .price{margin-left:auto;}
    .contact-line{flex-direction:column;gap:14px;}

    /* stack the rate ledger as cards on narrow screens */
    .rate-ledger table, .rate-ledger thead, .rate-ledger tbody, .rate-ledger tr, .rate-ledger td, .rate-ledger th{
      display:block;
      width:100%;
    }
    .rate-ledger thead{display:none;}
    .rate-ledger tr{border-bottom:1px solid var(--line);padding:20px 18px;}
    .rate-ledger tr:last-child{border-bottom:none;}
    .rate-ledger td{border-bottom:none;padding:0;width:auto !important;}
    .rate-ledger td.svc{font-size:18px;line-height:1.3;margin-bottom:6px;white-space:normal;}
    .rate-ledger td.rate{font-size:16px;margin-bottom:8px;display:block;white-space:normal;}
    .rate-ledger td.note{font-size:16px;line-height:1.45;}
  }
  @media (max-width:480px){
    body{font-size:17.5px;}
    .specimens{grid-template-columns:1fr 1fr;}
    header.mast{padding:44px 0 36px;}
  }
`;

const PAGE_BODY = String.raw`<header class="mast">
  <div class="wrap">
    <svg class="mark" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6C20 6 12 16 12 26c0 6 3 9 6 9s5-3 6-7c1 5 4 9 8 9s7-4 8-9c1 4 3 7 6 7s6-3 6-9C52 16 44 6 32 6Z" stroke="#e8dcc2" stroke-width="1.4"/>
      <path d="M32 34V58" stroke="#e8dcc2" stroke-width="1.4"/>
      <path d="M32 44l-8 6M32 40l9 7" stroke="#e8dcc2" stroke-width="1.2"/>
    </svg>
    <div class="eyebrow-plate">Springfield &amp; the Ozarks · Est. field practice</div>
    <h1>Wild Foods by Dyllan</h1>
    <p class="sub">Field notes from a chef who never left the woods — hyper-local dinners, foraging walks, and Ozarks wild foods, gathered and plated by hand.</p>
    <div class="colophon">
      <span>Chef Dyllan Dale</span>
      <span>417&#8209;403&#8209;9265</span>
      <span>dyllan@wildfoodsbydyllan.com</span>
    </div>
  </div>
</header>

<div class="plate-photo">
  <img src="/images/hero-creek-forage.webp" alt="Chef Dyllan Dale foraging along a creek in the Ozarks with his dog">
  <div class="plate-caption">
    <div class="wrap" style="padding:0;">
      <div class="fig">Fig. 1 — Wet-weather foraging, a creek crossing near Springfield</div>
      <blockquote>"I don't think I will ever leave the Ozarks. I hope to bring the flavors of the forest and field to people through fine dining and education."</blockquote>
    </div>
  </div>
</div>

<main>

  <!-- FIELD NOTES / STORY -->
  <section class="wrap-narrow">
    <div class="sec-label">
      <div class="num stamp-font">I</div>
      <h2>Field Notes</h2>
      <div class="rule"></div>
    </div>

    <div class="ledger">
      <div class="entry">
        <div class="when"><span class="age">10</span>Branson, MO</div>
        <div>
          <h3>The copperhead</h3>
          <p>Caught and skinned his first copperhead to bring to a friend the snake had bitten days before. He's never feared nature since — only respected what it can do.</p>
        </div>
      </div>
      <div class="entry">
        <div class="when"><span class="age">11</span>An empty house</div>
        <div>
          <h3>Good Eats, on a 14-inch TV</h3>
          <p>Home alone after school, he found Alton Brown breaking down the science of cooking. That was the moment he decided he wanted to be a chef.</p>
        </div>
      </div>
      <div class="entry">
        <div class="when"><span class="age">15</span>His own backyard</div>
        <div>
          <h3>A piece of candy on the ground</h3>
          <p>A bright red-and-white mushroom in the yard turned out to be <em>Amanita muscaria</em> — a species most sources at the time insisted didn't grow in Missouri. He's since documented multiple Ozarks occurrences on the national mycological database. Mushrooms have held his attention ever since.</p>
        </div>
      </div>
      <div class="entry">
        <div class="when"><span class="age">16</span>Thai Thai Cuisine, Branson</div>
        <div>
          <h3>A box of mangos</h3>
          <p>His first restaurant job, dishwasher and busboy. Told to peel a box of mangos, he called it done — until the chef pulled the peels from the trash. "Look at all this meat wasted." He re-fileted every peel. Don't waste; every detail matters.</p>
        </div>
      </div>
      <div class="entry">
        <div class="when"><span class="age">27</span>A turning point</div>
        <div>
          <p>Ten hard years followed — addiction, depression, divorce, the sweaty grind of line cook life. At 27, he decided he was made for more. Within a year he was asked to manage a kitchen — "me, a good dishwasher?" — and pushed himself toward obsession with the food he made.</p>
        </div>
      </div>
      <div class="entry">
        <div class="when">Today</div>
        <div>
          <h3>Two loves, combined</h3>
          <p>He took his lifelong fascination with the woods and paired it with the kitchen — learning to cook with what the Ozarks actually provides. He studied under mentor <strong>Rob Connoley</strong> of Bulrush in St. Louis, finished the culinary degree he'd started ten years earlier, and now lives in Springfield with his wife and three sons — still, and always, in the Ozarks.</p>
        </div>
      </div>
    </div>

    <div class="duo">
      <figure>
        <img src="/images/duo-plating.webp" alt="Dyllan plating garnish across a long table of dishes">
        <figcaption>Fig. 2 — Plating a full pop-up service by hand, one bowl at a time</figcaption>
      </figure>
      <figure>
        <img src="/images/duo-family.webp" alt="Dyllan, his wife, and their newborn son">
        <figcaption>Fig. 3 — Dyllan and family, Springfield, MO</figcaption>
      </figure>
    </div>
  </section>

  <div class="deckle"></div>

  <!-- THE TABLE / PRIVATE CHEF MENU -->
  <section style="background:var(--paper-dark);">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">II</div>
        <h2>The Table</h2>
        <div class="rule"></div>
      </div>
      <p style="max-width:640px;color:var(--ink-soft);margin-top:-24px;margin-bottom:40px;">Hyper-local, seasonal, crafted with intention. Every private chef menu is built from scratch around a conversation — no templates, no pre-set options. Wild-foraged or entirely non-wild, the choice is yours.</p>

      <div class="menu-block">
        <div class="menu-tier">
          <h3 class="tier"><span>Harvest Buffet</span><span class="leader"></span><span class="price">$90 / guest</span></h3>
          <p class="tier-desc">A thoughtfully curated buffet of seasonal, hyper-local dishes — a relaxed, abundant spread for casual celebrations and larger groups.</p>
        </div>
        <div class="menu-tier">
          <h3 class="tier"><span>Gathered Family Style</span><span class="leader"></span><span class="price">$120 / guest</span></h3>
          <p class="tier-desc">A dedicated server presents and serves each dish at the table — warmth and elegance together, built for connection over the meal.</p>
        </div>
        <div class="menu-tier">
          <h3 class="tier"><span>Chef's Table Plated</span><span class="leader"></span><span class="price">$150 / guest</span></h3>
          <p class="tier-desc">The full restaurant experience, brought home: every course individually plated by the chef, presented at its highest level.</p>
        </div>

        <div class="dish-list">
          <div>
            <h4>Wild-Inspired</h4>
            <ul>
              <li>Chanterelle velouté with herb oil</li>
              <li>Citrus-smoked trout, seasonal produce</li>
              <li>Wild herb–marinated beef or bison</li>
              <li>Rabbit ravioli, brown-butter sage</li>
              <li>Pawpaw or seasonal fruit crème brûlée</li>
            </ul>
          </div>
          <div>
            <h4>Hyper-Local, Non-Wild</h4>
            <ul>
              <li>Herb-roasted chicken, pan jus</li>
              <li>Braised short ribs, garlic mashed potatoes</li>
              <li>Seared salmon, lemon-herb cream</li>
              <li>Whipped sweet potatoes, browned butter</li>
              <li>Elegant tartlets, local fruit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SPECIMEN GALLERY -->
  <section class="wrap">
    <div class="sec-label">
      <div class="num stamp-font">III</div>
      <h2>From the Pass</h2>
      <div class="rule"></div>
    </div>
    <div class="specimens specimens-5">
      <div class="specimen">
        <img src="/images/dish-beet-carpaccio.webp" alt="Beet carpaccio plate">
        <div class="tag"><div class="no">No. 01</div><div class="name">Beet Carpaccio</div></div>
      </div>
      <div class="specimen">
        <img src="/images/dish-chanterelle-pawpaw.webp" alt="Chicken roulade with chanterelle mushrooms and pawpaw glaze">
        <div class="tag"><div class="no">No. 02</div><div class="name">Chicken Roulade, Chanterelle &amp; Pawpaw</div></div>
      </div>
      <div class="specimen">
        <img src="/images/dish-short-rib.webp" alt="Wild plum braised beef short rib">
        <div class="tag"><div class="no">No. 03</div><div class="name">Wild Plum Braised Short Rib</div></div>
      </div>
      <div class="specimen">
        <img src="/images/dish-carrot-gravlax.webp" alt="Cured carrot gravlax crostini, donor dinner">
        <div class="tag"><div class="no">No. 04</div><div class="name">Cured Carrot &ldquo;Gravlax&rdquo; Crostini</div></div>
      </div>
      <div class="specimen">
        <img src="/images/dish-seared-course.webp" alt="A finished seared course with pan sauce and a crisp potato cake">
        <div class="tag"><div class="no">No. 05</div><div class="name">A Course From the Pass</div></div>
      </div>
    </div>
  </section>

  <div class="deckle"></div>

  <!-- FORAGING / TEACHING / CONSULTING LEDGER -->
  <section>
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">IV</div>
        <h2>Rates &amp; Services</h2>
        <div class="rule"></div>
      </div>
      <div class="rate-ledger">
        <table>
          <thead>
            <tr><th>Offering</th><th>Rate</th><th>Notes</th></tr>
          </thead>
          <tbody>
          <tr>
            <td class="svc">Foraging Walk — 2 hr</td>
            <td class="rate">$100 / session</td>
            <td class="note">On your land, identifying and using wild edibles. $5 per 10 miles beyond 30 miles of Springfield.</td>
          </tr>
          <tr>
            <td class="svc">Foraging Walk — 4 hr</td>
            <td class="rate">$200 / session</td>
            <td class="note">Add a 3-course foraged meal for $30/person. 50% deposit to reserve.</td>
          </tr>
          <tr>
            <td class="svc">Catering</td>
            <td class="rate">from $25 / head</td>
            <td class="note">15-person minimum. Wild or "non-wild" menus, 10+ years of professional kitchen experience.</td>
          </tr>
          <tr>
            <td class="svc">Consultation — 30 min</td>
            <td class="rate">$30</td>
            <td class="note">Phone or Zoom. Restaurants moving toward zero-waste/farm-to-table, or home foragers wanting 1:1 coaching.</td>
          </tr>
          <tr>
            <td class="svc">Consultation — 1 hr</td>
            <td class="rate">$50</td>
            <td class="note">In-person available at the same rate + $1/mile round trip.</td>
          </tr>
          <tr>
            <td class="svc">Teaching &amp; Talks</td>
            <td class="rate">$100 / hr</td>
            <td class="note">Half-day $300, full-day $500. Cooking fundamentals, wild foods, fermentation, foraging ethics — for schools, conferences, and community groups.</td>
          </tr>
          <tr>
            <td class="svc">Pop-Up Dinner Partnership</td>
            <td class="rate">$50–$90 / guest</td>
            <td class="note">3 to 6 courses, 20-guest minimum, $250 planning fee. Full staffing and service included — venue keeps ticket revenue.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section style="background:var(--paper-dark);">
    <div class="wrap-narrow">
      <div class="sec-label">
        <div class="num stamp-font">V</div>
        <h2>Notes From the Table</h2>
        <div class="rule"></div>
      </div>
      <div class="margin-notes">
        <div class="margin-note">
          <p>The Wild Foods dinner was a delightful exploration of foraged ingredients. Dyllan's dedication to crafting a meal that honored nature's offerings was evident in every meticulously plated course.</p>
          <cite>— Amy H.</cite>
        </div>
        <div class="margin-note">
          <p>I never liked venison before I had it at one of the pop-ups. Now the flavors are seared in my memory and one I hope to repeat at one of his next pop-up events.</p>
          <cite>— Julie S.</cite>
        </div>
        <div class="margin-note">
          <p>I was skeptical at first — I couldn't pronounce any of the dishes on the menu. I couldn't believe how incredibly good the food tasted. A 10 out of 10 night.</p>
          <cite>— Noah H.</cite>
        </div>
        <div class="margin-note">
          <p>A wonderful, quiet evening of meeting new friends and enjoying an artfully prepared, wild foraged, six-course dinner. I will be returning as often as possible.</p>
          <cite>— Jobeth S.</cite>
        </div>
      </div>
    </div>
  </section>

</main>

<div class="colophon-block">
  <div class="wrap-narrow">
    <div class="stamp"><span>VERIFIED<br>OZARKS<br>FORAGER</span></div>
    <h2>Book Chef Dyllan</h2>
    <p class="sub">Private dinners, pop-ups, foraging walks, teaching &amp; consulting — every date starts with a conversation, not a form.</p>
    <div class="contact-line">
      <a href="tel:14174039265">417-403-9265</a>
      <a href="mailto:dyllan@wildfoodsbydyllan.com">dyllan@wildfoodsbydyllan.com</a>
      <span>Springfield, MO — serving the Ozarks</span>
    </div>
  </div>
</div>

<footer>
  Wild Foods by Dyllan — Springfield, Missouri
</footer>`;

export function PublicLandingPage() {
  useEffect(() => {
    document.title = "Wild Foods by Dyllan — Field Notes of an Ozarks Forager";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
