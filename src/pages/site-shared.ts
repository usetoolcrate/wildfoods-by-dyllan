export const SITE_STYLES = String.raw`
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
  #story, #table, #recipes-nav, #rates, #book{scroll-margin-top:24px;}
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

  /* slim utility bar: logo + quick anchors — fresh paper bar, sits outside the pine hero */
  .mast-bar-wrap{
    background:var(--paper);
    border-bottom:1px solid var(--line);
  }
  .mast-bar{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:20px;
    padding:16px 0;
  }
  .mast-bar .brand-lockup{
    height:54px;
    width:auto;
    display:block;
  }
  .mast-nav{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.14em;
    text-transform:uppercase;
    display:flex;
    gap:22px;
    flex-wrap:wrap;
  }
  .mast-nav a{
    color:var(--ink-soft);
    text-decoration:none;
    border-bottom:1px solid transparent;
    padding-bottom:2px;
  }
  .mast-nav a:hover{border-bottom-color:var(--rust);color:var(--ink);}
  .mast-nav a.active{color:var(--ink);border-bottom-color:var(--rust);}

  /* ===== HERO: copy + photo side by side ===== */
  .hero-grid{
    display:grid;
    grid-template-columns:1.15fr 0.85fr;
    gap:56px;
    align-items:center;
    padding-top:56px;
    padding-bottom:60px;
  }
  .eyebrow-plate{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.32em;
    text-transform:uppercase;
    color:var(--gold);
    margin-bottom:16px;
  }
  header.mast h1{
    font-family:'Cormorant Garamond', serif;
    font-weight:600;
    font-size:clamp(34px,3.6vw,50px);
    margin:0 0 14px;
    letter-spacing:0.01em;
    line-height:1.08;
  }
  header.mast .sub{
    font-size:18px;
    color:#d9d2bc;
    max-width:460px;
    margin:0 0 26px;
    line-height:1.5;
  }
  .hero-cta{
    display:flex;
    gap:14px;
    flex-wrap:wrap;
    margin-bottom:28px;
  }
  .hero-cta a{
    font-family:'Special Elite', monospace;
    font-size:12px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    text-decoration:none;
    padding:14px 22px;
    border-radius:2px;
    display:inline-block;
  }
  .hero-cta .btn-solid{
    background:var(--rust);
    color:#fbf5e6;
  }
  .hero-cta .btn-solid:hover{background:var(--rust-deep);}
  .hero-cta .btn-line{
    border:1px solid #6d7d68;
    color:#e8dcc2;
  }
  .hero-cta .btn-line:hover{border-color:var(--gold);color:var(--gold);}
  .hero-facts{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.06em;
    text-transform:uppercase;
    color:#a9b6a3;
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    align-items:center;
    margin-bottom:22px;
  }
  .hero-facts .dot{color:var(--gold);}
  .colophon{
    font-family:'Special Elite', monospace;
    font-size:11.5px;
    letter-spacing:0.06em;
    color:#a9b6a3;
    display:flex;
    gap:26px;
    flex-wrap:wrap;
    margin-top:0;
  }

  .hero-media{
    position:relative;
  }
  .hero-media img{
    width:100%;
    display:block;
    aspect-ratio:4/5;
    object-fit:cover;
    object-position:center 20%;
    filter:saturate(0.94) contrast(1.02);
    border-radius:3px;
  }
  .hero-media .fig{
    font-family:'Special Elite', monospace;
    font-size:10.5px;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:#8c9a86;
    margin-top:12px;
  }
  .hero-media blockquote{
    margin:6px 0 0;
    font-style:italic;
    font-size:16px;
    color:#d9d2bc;
    line-height:1.45;
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

  @media (max-width:900px){
    .hero-grid{grid-template-columns:1fr;gap:34px;padding-top:36px;padding-bottom:44px;}
    .mast-bar{flex-direction:column;gap:12px;padding:16px 0;}
    .mast-nav{justify-content:center;gap:14px 18px;font-size:10px;}
    header.mast .sub{max-width:none;}
    .hero-media img{aspect-ratio:16/11;}
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
    .hero-grid{padding-top:30px;padding-bottom:36px;}
    .mast-bar .brand-lockup{height:36px;}
  }


  /* ===== SUB-PAGE BANNER (used on every page except home) ===== */
  .page-banner{
    background:var(--pine);
    color:var(--paper);
    padding:52px 0 46px;
    position:relative;
  }
  .page-banner::after{
    content:"";
    position:absolute;left:0;right:0;bottom:0;height:14px;
    background-image:
      linear-gradient(135deg, var(--pine) 6px, transparent 0) 0 0,
      linear-gradient(225deg, var(--pine) 6px, transparent 0) 0 0;
    background-size:14px 14px;background-repeat:repeat-x;background-color:var(--paper);
  }
  .page-banner .crumb{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:var(--gold);
    text-decoration:none;
    margin-bottom:14px;
    display:inline-block;
  }
  .page-banner .crumb:hover{color:var(--paper);}
  .page-banner h1{
    font-family:'Cormorant Garamond',serif;
    font-weight:600;
    font-size:clamp(32px,4.6vw,48px);
    margin:0 0 10px;
    line-height:1.08;
  }
  .page-banner p{
    font-size:18px;
    color:#d9d2bc;
    max-width:560px;
    margin:0;
    line-height:1.5;
  }

  /* ===== SIMPLE PROSE SECTION ===== */
  .prose{max-width:700px;}
  .prose p{color:var(--ink-soft);margin:0 0 18px;}
  .prose p:last-child{margin-bottom:0;}

  /* ===== TWO-COL FEATURE (photo + text, alternating) ===== */
  .feature-pair{
    display:grid;
    grid-template-columns:0.85fr 1.15fr;
    gap:48px;
    align-items:center;
  }
  .feature-pair.rev{grid-template-columns:1.15fr 0.85fr;}
  .feature-pair.rev .feature-photo{order:2;}
  .feature-pair img{
    width:100%;
    display:block;
    aspect-ratio:4/5;
    object-fit:cover;
    border-radius:2px;
    filter:saturate(0.94) contrast(1.02);
  }
  .feature-pair h3{
    font-family:'Cormorant Garamond',serif;
    font-weight:600;
    font-size:clamp(24px,3.2vw,32px);
    color:var(--pine);
    margin:0 0 14px;
  }
  .feature-pair .price-tag{
    font-family:'Special Elite', monospace;
    font-size:15px;
    color:var(--rust-deep);
    margin:14px 0 0;
  }

  /* ===== BOOK CTA CARD (replaces fake forms — real phone/email/location) ===== */
  .book-card{
    background:var(--paper-dark);
    border:1px solid var(--line);
    padding:40px 36px;
    text-align:center;
  }
  .book-card h3{
    font-family:'Cormorant Garamond',serif;
    font-weight:600;
    font-size:26px;
    color:var(--pine);
    margin:0 0 10px;
  }
  .book-card p{color:var(--ink-soft);margin:0 0 22px;max-width:480px;margin-left:auto;margin-right:auto;}
  .book-card .contact-line a{
    color:var(--rust-deep);
    border-bottom-color:var(--rust-deep);
  }
  .book-card .contact-line{color:var(--ink);}

  /* ===== FILTER CHIPS (recipes) ===== */
  .chip-row{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:36px;
  }
  .chip{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    padding:9px 16px;
    border:1px solid var(--line);
    background:var(--paper);
    color:var(--ink-soft);
    cursor:pointer;
    border-radius:2px;
    transition:border-color 0.15s, color 0.15s;
  }
  .chip:hover{border-color:var(--rust);color:var(--ink);}
  .chip.active{
    background:var(--pine);
    border-color:var(--pine);
    color:var(--paper);
  }
  .recipe-search{
    font-family:'Cormorant Garamond', serif;
    font-size:18px;
    padding:12px 16px;
    border:1px solid var(--line);
    background:var(--paper);
    color:var(--ink);
    width:100%;
    max-width:320px;
    margin-bottom:22px;
  }
  .recipe-search:focus{outline:none;border-color:var(--rust);}
  .recipe-count{
    font-family:'Special Elite', monospace;
    font-size:11.5px;
    letter-spacing:0.06em;
    color:var(--ink-soft);
    margin-bottom:26px;
  }

  /* ===== RECIPE CARDS ===== */
  .recipe-grid{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:28px;
  }
  .recipe-card{
    background:var(--paper);
    border:1px solid var(--line);
    display:flex;
    flex-direction:column;
  }
  .recipe-card .rc-tag{
    font-family:'Special Elite', monospace;
    font-size:10px;
    letter-spacing:0.1em;
    text-transform:uppercase;
    color:var(--rust);
    padding:16px 18px 0;
  }
  .recipe-card h3{
    font-size:22px;
    font-weight:600;
    color:var(--pine);
    margin:8px 18px 6px;
    line-height:1.2;
  }
  .recipe-card .rc-meta{
    font-family:'Special Elite', monospace;
    font-size:11px;
    color:var(--ink-soft);
    margin:0 18px 16px;
    display:flex;
    gap:14px;
  }
  .recipe-card .rc-body{
    padding:0 18px 18px;
    border-top:1px dashed var(--line);
    margin-top:auto;
    padding-top:14px;
  }
  .recipe-card .rc-body p{color:var(--ink-soft);font-size:16px;margin:0 0 12px;}
  .recipe-card .rc-actions{display:flex;gap:16px;align-items:center;}
  .recipe-card button.rc-print{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    background:none;
    border:1px solid var(--ink);
    color:var(--ink);
    padding:8px 14px;
    cursor:pointer;
    border-radius:2px;
  }
  .recipe-card button.rc-print:hover{background:var(--ink);color:var(--paper);}
  .recipe-empty{
    padding:60px 0;
    text-align:center;
    color:var(--ink-soft);
    font-style:italic;
  }
  .sample-flag{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.06em;
    text-transform:uppercase;
    color:var(--rust-deep);
    background:var(--paper-dark);
    border:1px dashed var(--rust);
    padding:12px 18px;
    margin-bottom:36px;
    display:inline-block;
  }

  /* recipe detail (print target) */
  .recipe-detail{border:1px solid var(--line);background:var(--paper);padding:40px;}
  .recipe-detail h2{font-family:'Cormorant Garamond',serif;color:var(--pine);margin:0 0 6px;font-size:32px;}
  .recipe-detail .rd-meta{font-family:'Special Elite', monospace;font-size:12px;color:var(--ink-soft);margin-bottom:26px;display:flex;gap:18px;flex-wrap:wrap;}
  .recipe-detail .rd-cols{display:grid;grid-template-columns:1fr 1.4fr;gap:36px;}
  .recipe-detail h4{font-family:'Special Elite', monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--rust);margin:0 0 14px;}
  .recipe-detail ul{margin:0;padding-left:18px;color:var(--ink-soft);}
  .recipe-detail ol{margin:0;padding-left:20px;color:var(--ink-soft);}
  .recipe-detail li{margin-bottom:9px;}
  .recipe-detail .rd-close{
    font-family:'Special Elite', monospace;
    font-size:11px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    background:none;
    border:1px solid var(--ink);
    color:var(--ink);
    padding:10px 16px;
    cursor:pointer;
    margin-bottom:26px;
  }

  /* ===== PRODUCT CARDS (shop) ===== */
  .product-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:24px;
  }
  .product-card{
    background:var(--paper);
    border:1px solid var(--line);
    text-align:center;
    padding-bottom:18px;
  }
  .product-card img{width:100%;aspect-ratio:1;object-fit:cover;display:block;border-bottom:1px solid var(--line);}
  .product-card h3{font-size:18px;font-weight:600;color:var(--pine);margin:16px 16px 6px;line-height:1.25;}
  .product-card .pc-price{font-family:'Special Elite', monospace;font-size:13px;color:var(--rust-deep);margin:0 0 14px;}
  .product-card a.pc-link{
    font-family:'Special Elite', monospace;
    font-size:10.5px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    text-decoration:none;
    color:var(--ink);
    border:1px solid var(--ink);
    padding:9px 16px;
    display:inline-block;
    border-radius:2px;
  }
  .product-card a.pc-link:hover{background:var(--ink);color:var(--paper);}
  .shop-note{
    font-size:16px;
    color:var(--ink-soft);
    max-width:640px;
    margin:0 0 40px;
  }

  /* ===== PRINT ===== */
  @media print{
    .mast-bar-wrap, .page-banner, footer, .colophon-block, .chip-row, .recipe-search, .recipe-count, .rc-actions, .sample-flag{display:none !important;}
    body{background:#fff;font-size:14px;}
    .recipe-detail{border:none;padding:0;}
  }

  @media (max-width:900px){
    .feature-pair, .feature-pair.rev{grid-template-columns:1fr;gap:26px;}
    .feature-pair.rev .feature-photo{order:0;}
    .recipe-grid{grid-template-columns:1fr 1fr;}
    .product-grid{grid-template-columns:repeat(2,1fr);}
    .recipe-detail .rd-cols{grid-template-columns:1fr;gap:24px;}
    .page-banner{padding:38px 0 34px;}
  }
  @media (max-width:560px){
    .recipe-grid{grid-template-columns:1fr;}
    .product-grid{grid-template-columns:1fr;}
    .book-card{padding:32px 22px;}
  }
`;

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/story", label: "Our Story" },
  { href: "/dine-with-us", label: "Dine With Us" },
  { href: "/private-chef", label: "Private Chef" },
  { href: "/learn", label: "Learn" },
  { href: "/recipes", label: "Recipes" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
];

export function renderTopBar(activeHref: string): string {
  const links = NAV_LINKS.map(
    (l) =>
      `<a href="${l.href}"${l.href === activeHref ? ' class="active"' : ""}>${l.label}</a>`
  ).join("\n      ");
  return `<div class="mast-bar-wrap">
  <div class="wrap mast-bar">
    <a href="/" style="display:block;"><img class="brand-lockup" src="/images/logo-lockup.webp" alt="Wild Foods by Dyllan"></a>
    <nav class="mast-nav">
      ${links}
    </nav>
  </div>
</div>`;
}

export function renderPageBanner(opts: { eyebrow: string; title: string; sub: string }): string {
  return `<div class="page-banner">
  <div class="wrap">
    <a class="crumb" href="/">&larr; Wild Foods by Dyllan</a>
    <h1>${opts.title}</h1>
    <p>${opts.sub}</p>
  </div>
</div>`;
}

export function renderBookCard(opts?: { title?: string; sub?: string }): string {
  const title = opts?.title ?? "Ready to Book?";
  const sub =
    opts?.sub ??
    "Every date starts with a conversation, not a form. Reach out directly and Chef Dyllan will get back to you.";
  return `<div class="book-card">
  <h3>${title}</h3>
  <p>${sub}</p>
  <div class="contact-line">
    <a href="tel:14174039265">417-403-9265</a>
    <a href="mailto:dyllan@wildfoodsbydyllan.com">dyllan@wildfoodsbydyllan.com</a>
    <span>Springfield, MO — serving the Ozarks</span>
  </div>
</div>`;
}

export const FOOTER_HTML = `<footer>
  Wild Foods by Dyllan — Springfield, Missouri
</footer>`;
