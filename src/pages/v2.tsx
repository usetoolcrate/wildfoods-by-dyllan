import { useEffect, type ReactNode } from "react";
import { EVENTS, HOSTS, PARTNERS, BOOKING_URL } from "@/pages/site-shared";

/* The site's design system: calm, bright, photo-led, with each section on
   its own surface (paper, white, sand, sage, pine, earth) so the page reads
   as distinct rooms rather than one long scroll. Pages are HTML strings
   dropped into <V2Page>, same pattern as before. */

export const V2_STYLES = String.raw`
  .v2{
    --bg:#faf8f3;
    --white:#ffffff;
    --sand:#efe7da;
    --sage:#e5e9df;
    --pine:#1f3327;
    --earth:#2a1c14;
    --earth-2:#20150f;
    --ink:#18211b;
    --ink-2:#555c55;
    --line:#e3ded2;
    --accent:#7a4424;
    --gold:#c9a46a;
    background:var(--bg);
    color:var(--ink);
    font-family:'Hanken Grotesk', system-ui, sans-serif;
    font-size:17px;
    line-height:1.65;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }
  .v2 .v2-frag{display:contents;}
  .v2 *{box-sizing:border-box;}
  .v2 a{color:inherit;text-decoration:none;}
  .v2 a:focus-visible, .v2 button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;}
  .v2 img{display:block;max-width:100%;}
  .v2 figure{margin:0;}
  .v2 .c{max-width:1200px;margin:0 auto;padding-left:48px;padding-right:48px;}
  .v2 .narrow{max-width:900px;}
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
  .v2 .center{text-align:center;}
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
  .v2 .btn:hover{background:var(--pine);}
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

  /* ---------- surfaces ---------- */
  .v2 .sec{padding:120px 0;}
  .v2 .s-paper{background:var(--bg);}
  .v2 .s-white{background:var(--white);}
  .v2 .s-sand{background:var(--sand);}
  .v2 .s-sage{background:var(--sage);}
  .v2 .s-pine{background:var(--pine);}
  .v2 .s-earth{background:var(--earth);}

  /* section headings: stacked, centered, or split across the width */
  .v2 .sh{max-width:660px;margin-bottom:60px;}
  .v2 .sh h2{margin-top:18px;}
  .v2 .sh p{color:var(--ink-2);margin:22px 0 0;}
  .v2 .sh.center{margin-left:auto;margin-right:auto;text-align:center;}
  .v2 .sh.split{
    max-width:none;
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(0,1fr);
    gap:64px;
    align-items:end;
  }
  .v2 .sh.split p{margin:0;}

  /* ---------- header ---------- */
  .v2 .hd{background:var(--white);border-bottom:1px solid var(--line);}
  .v2 .hd-in{display:flex;align-items:center;justify-content:space-between;gap:32px;min-height:88px;}
  .v2 .brand img{height:50px;width:auto;}
  .v2 .hd nav{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px 28px;}
  .v2 .hd nav a{
    font-size:12px;
    font-weight:500;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:var(--ink-2);
    padding:5px 0;
    border-bottom:1px solid transparent;
  }
  .v2 .hd nav a:hover{color:var(--ink);}
  .v2 .hd nav a.on{color:var(--ink);border-bottom-color:var(--accent);}

  /* ---------- home hero ---------- */
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

  /* ---------- sub-page hero ---------- */
  .v2 .ph{padding:88px 0 100px;}
  .v2 .ph-in{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:72px;align-items:center;}
  .v2 .ph.noimg .ph-in{grid-template-columns:minmax(0,1fr);max-width:860px;}
  .v2 .ph h1{font-size:clamp(42px,5.4vw,74px);line-height:1.0;margin:22px 0 24px;}
  .v2 .ph p{font-size:18.5px;color:var(--ink-2);max-width:32em;margin:0;}
  .v2 .ph-img img{width:100%;aspect-ratio:4/3;object-fit:cover;}

  /* ---------- dinner list (reads on light or dark) ---------- */
  .v2 .dl{list-style:none;margin:0;padding:0;border-top:1px solid currentColor;}
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
  .v2 .dl .kind{display:block;font-size:11.5px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;}
  .v2 .dl h3{font-size:31px;line-height:1.12;}
  .v2 .dl p{margin:10px 0 0;color:var(--ink-2);font-size:16px;max-width:36em;}
  .v2 .dl-side{text-align:right;padding-top:4px;}
  .v2 .dl-side .price{display:block;font-size:15px;margin-bottom:12px;}
  .v2 :is(.s-pine,.s-earth) .dl{border-top-color:rgba(255,255,255,.55);}
  .v2 :is(.s-pine,.s-earth) .dl li{border-bottom-color:rgba(255,255,255,.14);}
  .v2 :is(.s-pine,.s-earth) .dl .m, .v2 :is(.s-pine,.s-earth) .dl p{color:#b3bdb0;}
  .v2 :is(.s-pine,.s-earth) .dl .d{color:var(--gold);}
  .v2 :is(.s-pine,.s-earth) .dl .kind{color:var(--gold);}
  .v2 .after-list{margin-top:40px;}
  .v2 .band{margin:0 0 56px;}
  .v2 .band img{width:100%;aspect-ratio:21/9;object-fit:cover;}

  /* ---------- photo mosaic ---------- */
  .v2 .mosaic{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;}
  .v2 .mosaic img{width:100%;aspect-ratio:1/1;object-fit:cover;}
  .v2 .mosaic figcaption{font-size:13px;color:var(--ink-2);margin-top:10px;}

  /* ---------- the work: staggered steps with big numerals ---------- */
  .v2 .steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;align-items:start;}
  .v2 .steps figure:nth-child(even){margin-top:64px;}
  .v2 .steps img{width:100%;aspect-ratio:3/4;object-fit:cover;}
  .v2 .steps figcaption{padding-top:18px;font-size:15.5px;color:var(--ink-2);line-height:1.55;}
  .v2 .steps .n{
    display:block;
    font-family:'Cormorant Garamond', Georgia, serif;
    font-style:italic;
    font-size:46px;
    line-height:1;
    color:var(--accent);
    margin-bottom:8px;
  }
  .v2 .steps strong{display:block;font-family:'Cormorant Garamond', Georgia, serif;font-weight:500;font-size:27px;color:var(--ink);line-height:1.1;margin-bottom:6px;}

  /* ---------- signature plates ---------- */
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
  .v2 .plate-ctrl{display:flex;align-items:center;gap:10px;}
  .v2 .plate-count{font-size:12px;font-weight:500;letter-spacing:0.16em;color:var(--ink-2);font-variant-numeric:tabular-nums;margin-right:8px;}
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
  .v2 .plate-fade{animation:v2fade .45s ease both;}
  @keyframes v2fade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}

  /* ---------- private chef: a printed menu card over a dark photo ---------- */
  .v2 .menu-sec{position:relative;padding:120px 0;background:#141612;overflow:hidden;}
  .v2 .menu-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5;}
  .v2 .menu-card{
    position:relative;
    max-width:760px;
    margin:0 auto;
    background:var(--white);
    padding:72px 64px 60px;
    text-align:center;
    outline:1px solid var(--line);
    outline-offset:-16px;
  }
  .v2 .menu-card h2{margin:16px 0 18px;}
  .v2 .menu-card .intro{color:var(--ink-2);max-width:30em;margin:0 auto;}
  .v2 .course{padding:30px 0;}
  .v2 .course + .course{border-top:1px solid var(--line);}
  .v2 .menu-list{margin-top:36px;border-top:1px solid var(--ink);border-bottom:1px solid var(--ink);}
  .v2 .course .price{font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--accent);}
  .v2 .course h3{font-size:34px;line-height:1.1;margin:8px 0 10px;}
  .v2 .course p{margin:0 auto;color:var(--ink-2);font-size:16px;max-width:28em;}
  .v2 .menu-foot{margin-top:30px;font-size:14px;color:var(--ink-2);}
  .v2 .menu-foot .tlink{margin-top:22px;color:var(--ink);}

  /* ---------- generic split feature ---------- */
  .v2 .split{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:88px;align-items:center;}
  .v2 .split.rev{grid-template-columns:minmax(0,6fr) minmax(0,5fr);}
  .v2 .split.rev > figure{order:2;}
  .v2 .split figure img{width:100%;aspect-ratio:4/5;object-fit:cover;}
  .v2 .split figure.wide img{aspect-ratio:4/3;}
  .v2 .split figcaption{font-size:13px;color:var(--ink-2);margin-top:12px;}
  .v2 .split h2{margin:18px 0 24px;}
  .v2 .split p{color:var(--ink-2);margin:0 0 18px;max-width:34em;}
  .v2 .split blockquote{
    margin:32px 0;
    padding-left:26px;
    border-left:1px solid var(--accent);
    font-family:'Cormorant Garamond', Georgia, serif;
    font-style:italic;
    font-size:25px;
    line-height:1.35;
    color:var(--ink);
    max-width:28em;
  }

  /* ---------- guest words ---------- */
  .v2 .qmark{
    font-family:'Cormorant Garamond', Georgia, serif;
    font-size:150px;
    line-height:0.6;
    height:64px;
    color:var(--accent);
    text-align:center;
  }
  .v2 .quotes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:72px;margin-top:36px;}
  .v2 .quotes blockquote{margin:0;}
  .v2 .quotes p{
    font-family:'Cormorant Garamond', Georgia, serif;
    font-style:italic;
    font-size:28px;
    line-height:1.35;
    margin:0 0 20px;
  }
  .v2 .quotes cite{font-style:normal;font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-2);}

  /* ---------- hosts & partners ---------- */
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

  /* ---------- link cards ---------- */
  .v2 .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;}
  .v2 .cards.three{grid-template-columns:repeat(3,minmax(0,1fr));}
  .v2 .cards a, .v2 .cards .card{display:block;background:var(--white);border:1px solid var(--line);padding:40px;transition:border-color .2s;}
  .v2 .cards a:hover{border-color:var(--ink);}
  .v2 .cards h3{font-size:32px;line-height:1.1;margin:14px 0 12px;}
  .v2 .cards p{margin:0 0 24px;color:var(--ink-2);font-size:16px;}

  /* ---------- rates ---------- */
  .v2 .rates{border-top:1px solid var(--ink);}
  .v2 .rate{
    display:grid;
    grid-template-columns:minmax(0,4fr) minmax(0,3fr) minmax(0,5fr);
    gap:32px;
    align-items:baseline;
    padding:24px 0;
    border-bottom:1px solid var(--line);
  }
  .v2 .rate-name{font-family:'Cormorant Garamond', Georgia, serif;font-size:27px;line-height:1.15;}
  .v2 .rate-price{font-size:13px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:var(--accent);}
  .v2 .rate p{margin:0;color:var(--ink-2);font-size:16px;}

  /* ---------- lists: sample menus, what's included, teaching topics ---------- */
  .v2 .menus{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:56px;}
  .v2 .menus h3{font-size:30px;}
  .v2 .menus ul{list-style:none;padding:0;margin:18px 0 0;border-top:1px solid var(--ink);}
  .v2 .menus li{padding:14px 0;border-bottom:1px solid var(--line);font-family:'Cormorant Garamond', Georgia, serif;font-size:22px;line-height:1.3;}
  .v2 .ticks{list-style:none;padding:0;margin:28px 0 0;border-top:1px solid var(--ink);}
  .v2 .ticks li{display:flex;gap:18px;padding:14px 0;border-bottom:1px solid var(--line);}
  .v2 .ticks li span{font-size:12px;font-weight:500;letter-spacing:0.14em;color:var(--accent);min-width:26px;padding-top:4px;}
  .v2 .topics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;margin-bottom:64px;}
  .v2 .topic{border-top:1px solid var(--ink);padding-top:20px;}
  .v2 .topic h3{font-size:25px;line-height:1.15;margin:0 0 10px;}
  .v2 .topic p{font-size:15.5px;color:var(--ink-2);margin:0;}
  .v2 .note-box{border:1px solid var(--line);background:var(--white);padding:18px 22px;font-size:15px;color:var(--ink-2);margin-bottom:48px;}

  /* ---------- story timeline ---------- */
  .v2 .tl{border-top:1px solid var(--ink);}
  .v2 .tl-e{display:grid;grid-template-columns:210px minmax(0,1fr);gap:48px;padding:48px 0;border-bottom:1px solid var(--line);}
  .v2 .tl-age{font-family:'Cormorant Garamond', Georgia, serif;font-size:68px;line-height:0.85;}
  .v2 .tl-place{display:block;margin-top:14px;font-size:12px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);}
  .v2 .tl h3{font-size:33px;line-height:1.1;margin:0 0 16px;}
  .v2 .tl p{color:var(--ink-2);margin:0 0 14px;max-width:38em;}
  .v2 .pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;}
  .v2 .pair img{width:100%;aspect-ratio:4/5;object-fit:cover;}
  .v2 .pair figcaption{font-size:13px;color:var(--ink-2);margin-top:12px;}
  .v2 .big-quote{
    font-family:'Cormorant Garamond', Georgia, serif;
    font-style:italic;
    font-size:clamp(28px,3.2vw,40px);
    line-height:1.3;
    max-width:24em;
    margin:0 auto;
    text-align:center;
  }
  .v2 .big-quote cite{display:block;margin-top:24px;font-family:'Hanken Grotesk', sans-serif;font-style:normal;font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--accent);}

  /* ---------- shop ---------- */
  .v2 .products{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:48px 28px;}
  .v2 .product img{width:100%;aspect-ratio:1/1;object-fit:cover;background:var(--white);border:1px solid var(--line);}
  .v2 .product h3{font-size:25px;line-height:1.15;margin:18px 0 6px;}
  .v2 .product .price{display:block;font-size:14px;color:var(--ink-2);margin-bottom:14px;}

  /* ---------- contact ---------- */
  .v2 .reach{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,5fr) minmax(0,4fr);gap:28px;}
  .v2 .reach > div{border-top:1px solid rgba(255,255,255,.55);padding-top:22px;}
  .v2 .reach a, .v2 .reach .big{
    display:inline-block;
    font-family:'Cormorant Garamond', Georgia, serif;
    font-size:clamp(26px,2.6vw,34px);
    line-height:1.2;
    color:#fff;
    margin-top:10px;
    overflow-wrap:anywhere;
  }
  .v2 .reach a{border-bottom:1px solid rgba(255,255,255,.35);}
  .v2 .reach a:hover{border-bottom-color:#fff;}

  /* ---------- recipes ---------- */
  .v2 .rx-tools{display:flex;flex-wrap:wrap;gap:20px 32px;align-items:center;justify-content:space-between;}
  .v2 .recipe-search{
    width:min(420px,100%);
    font:inherit;
    font-size:17px;
    padding:12px 0;
    border:0;
    border-bottom:1px solid var(--ink);
    background:transparent;
    color:var(--ink);
  }
  .v2 .recipe-search:focus{outline:none;border-bottom-color:var(--accent);}
  .v2 .chip-row{display:flex;flex-wrap:wrap;gap:8px;}
  .v2 .chip{
    font:inherit;
    font-size:12px;
    font-weight:500;
    letter-spacing:0.12em;
    text-transform:uppercase;
    padding:9px 16px;
    border:1px solid var(--line);
    border-radius:999px;
    background:var(--white);
    color:var(--ink-2);
    cursor:pointer;
  }
  .v2 .chip:hover{border-color:var(--ink);color:var(--ink);}
  .v2 .chip.active{background:var(--ink);border-color:var(--ink);color:var(--white);}
  .v2 .recipe-count{font-size:12px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink-2);margin:32px 0 20px;}
  .v2 .recipe-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;}
  .v2 .recipe-card{background:var(--white);border:1px solid var(--line);padding:28px;display:flex;flex-direction:column;transition:border-color .2s;}
  .v2 .recipe-card:hover{border-color:var(--ink);}
  .v2 .rc-img{width:calc(100% + 56px);max-width:none;margin:-28px -28px 22px;height:190px;object-fit:cover;}
  .v2 .rc-tag{font-size:11.5px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);}
  .v2 .recipe-card h3{font-size:28px;line-height:1.12;margin:10px 0 6px;}
  .v2 .rc-meta{font-size:13px;color:var(--ink-2);margin-bottom:12px;}
  .v2 .rc-body{display:flex;flex-direction:column;flex:1;}
  .v2 .rc-body p{font-size:15.5px;color:var(--ink-2);margin:0 0 22px;flex:1;}
  .v2 .rc-actions{display:flex;gap:22px;align-items:center;}
  .v2 .rc-view, .v2 .rc-print, .v2 .rd-close{
    font:inherit;
    font-size:12px;
    font-weight:500;
    letter-spacing:0.14em;
    text-transform:uppercase;
    background:none;
    border:0;
    border-bottom:1px solid currentColor;
    padding:0 0 3px;
    color:var(--ink);
    cursor:pointer;
  }
  .v2 .rc-print{color:var(--ink-2);border-bottom-color:transparent;}
  .v2 .rc-view:hover, .v2 .rc-print:hover, .v2 .rd-close:hover{color:var(--accent);}
  .v2 .recipe-empty{padding:72px 0;text-align:center;color:var(--ink-2);}
  .v2 .sample-flag{display:inline-block;font-size:13px;background:var(--sand);padding:8px 14px;margin-bottom:24px;}
  .v2 .recipe-detail{background:var(--white);border:1px solid var(--line);padding:56px;}
  .v2 .rd-img{width:100%;max-height:400px;object-fit:cover;margin:28px 0 8px;}
  .v2 .recipe-detail h2{margin:24px 0 10px;}
  .v2 .rd-meta{display:flex;gap:20px;flex-wrap:wrap;font-size:12px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);margin-bottom:40px;}
  .v2 .rd-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:56px;}
  .v2 .recipe-detail h4{font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid var(--ink);}
  .v2 .recipe-detail ul, .v2 .recipe-detail ol{margin:0;padding-left:20px;color:var(--ink-2);}
  .v2 .recipe-detail li{margin-bottom:10px;}
  .v2 .rd-print{margin-top:36px;}

  /* ---------- booking band + footer ---------- */
  .v2 .book{padding:120px 0;text-align:center;}
  .v2 .book h2{margin:18px auto 22px;max-width:15em;}
  .v2 .book .sub{max-width:34em;margin:0 auto 40px;}
  .v2 .book-lines{display:flex;justify-content:center;flex-wrap:wrap;gap:14px 48px;}
  .v2 .book-lines a{
    font-family:'Cormorant Garamond', Georgia, serif;
    font-size:clamp(24px,2.6vw,32px);
    color:#fff;
    border-bottom:1px solid rgba(255,255,255,.35);
    overflow-wrap:anywhere;
  }
  .v2 .book-lines a:hover{border-bottom-color:#fff;}
  .v2 .book .where{margin:30px 0 0;font-size:14px;letter-spacing:0.06em;}
  .v2 .ft{background:var(--earth-2);color:#a7a198;font-size:14px;padding:64px 0 40px;}
  .v2 .ft-in{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,4fr) minmax(0,3fr);gap:48px;}
  .v2 .ft-brand{font-family:'Cormorant Garamond', Georgia, serif;font-size:30px;color:#fff;line-height:1.1;}
  .v2 .ft p{margin:10px 0 0;max-width:24em;}
  .v2 .ft nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 24px;}
  .v2 .ft nav a, .v2 .ft .ft-contact a{color:#d8d2c6;}
  .v2 .ft nav a:hover, .v2 .ft .ft-contact a:hover{color:#fff;}
  .v2 .ft-contact{display:flex;flex-direction:column;gap:8px;}
  .v2 .ft-base{margin-top:48px;padding-top:22px;border-top:1px solid rgba(255,255,255,.1);font-size:12.5px;color:#7f786f;}

  /* dark surfaces: declared last so they win over the light defaults above */
  .v2 :is(.s-pine,.s-earth){color:#e6e9e1;}
  .v2 :is(.s-pine,.s-earth) :is(h1,h2,h3){color:#fff;}
  .v2 :is(.s-pine,.s-earth) .label{color:var(--gold);}
  .v2 :is(.s-pine,.s-earth) p{color:#bfc8bc;}
  .v2 :is(.s-pine,.s-earth) .tlink{color:#fff;}
  .v2 :is(.s-pine,.s-earth) .tlink:hover{color:var(--gold);}
  .v2 :is(.s-pine,.s-earth) .btn{background:#fff;color:var(--ink);}
  .v2 :is(.s-pine,.s-earth) .btn:hover{background:var(--gold);}

  @media (prefers-reduced-motion:reduce){.v2 .plate-fade{animation:none;}}

  @media (max-width:980px){
    .v2 .c{padding-left:28px;padding-right:28px;}
    .v2 .hd-in{flex-direction:column;justify-content:center;gap:14px;padding:18px 0;}
    .v2 .hd nav{justify-content:center;gap:6px 20px;}
    .v2 .hero-in, .v2 .ph-in, .v2 .dish, .v2 .split, .v2 .split.rev{grid-template-columns:minmax(0,1fr);gap:48px;}
    .v2 .split.rev > figure{order:0;}
    .v2 .hero-in{padding-top:56px;padding-bottom:80px;}
    .v2 .ph{padding:56px 0 72px;}
    .v2 .sh.split{grid-template-columns:minmax(0,1fr);gap:22px;}
    .v2 .steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:36px 20px;}
    .v2 .steps figure:nth-child(even){margin-top:40px;}
    .v2 .quotes{grid-template-columns:minmax(0,1fr);gap:48px;}
    .v2 .cards, .v2 .cards.three{grid-template-columns:minmax(0,1fr);}
    .v2 .topics{grid-template-columns:repeat(2,minmax(0,1fr));}
    .v2 .products, .v2 .recipe-grid, .v2 .mosaic{grid-template-columns:repeat(2,minmax(0,1fr));}
    .v2 .band img{aspect-ratio:16/10;}
    .v2 .reach{grid-template-columns:minmax(0,1fr);}
    .v2 .rd-cols{grid-template-columns:minmax(0,1fr);gap:32px;}
    .v2 .ft-in{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
    .v2 .ft-in > div:first-child{grid-column:1 / -1;}
    .v2 .sec, .v2 .book, .v2 .menu-sec{padding:84px 0;}
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
    .v2 .dish dl div, .v2 .rate{grid-template-columns:minmax(0,1fr);gap:6px;}
    .v2 .rate{padding:22px 0;}
    .v2 .steps figcaption{font-size:14.5px;}
    .v2 .steps strong{font-size:23px;}
    .v2 .steps .n{font-size:38px;}
    .v2 .menu-card{padding:52px 26px 44px;outline-offset:-10px;}
    .v2 .course h3{font-size:29px;}
    .v2 .quotes p{font-size:24px;}
    .v2 .roll{font-size:23px;}
    .v2 .roll .sep{padding:0 8px;}
    .v2 .roll.wrap-names .h{white-space:normal;}
    .v2 .roll-next{margin-top:48px;}
    .v2 .cards a, .v2 .cards .card{padding:30px 24px;}
    .v2 .menus{grid-template-columns:minmax(0,1fr);gap:40px;}
    .v2 .topics{grid-template-columns:minmax(0,1fr);}
    .v2 .tl-e{grid-template-columns:minmax(0,1fr);gap:14px;padding:36px 0;}
    .v2 .tl-age{font-size:52px;}
    .v2 .tl h3{font-size:28px;}
    .v2 .pair{grid-template-columns:minmax(0,1fr);}
    .v2 .products, .v2 .recipe-grid{grid-template-columns:minmax(0,1fr);}
    .v2 .recipe-detail{padding:32px 22px;}
    .v2 .ft-in{grid-template-columns:minmax(0,1fr);gap:32px;}
    .v2 .sec, .v2 .book, .v2 .menu-sec{padding:68px 0;}
  }

  @media print{
    .v2 .hd, .v2 .ft, .v2 .ph, .v2 .book, .v2 .rx-tools, .v2 .recipe-count, .v2 .rc-actions, .v2 .sample-flag, .v2 .rd-close, .v2 .rd-print{display:none !important;}
    .v2 .sec{padding:0;}
    .v2 .recipe-detail{border:0;padding:0;}
  }
`;

const NAV: [string, string][] = [
  ["/farm-to-table", "Farm to Table"],
  ["/private-chef", "Private Chef"],
  ["/learn", "Learn"],
  ["/recipes", "Recipes"],
  ["/shop", "Gift Certificates"],
  ["/story", "Our Story"],
  ["/contact", "Contact"],
];

/* Private chef tiers — prices per Dyllan, 2026-09-29. */
export const PRIVATE_CHEF_TIERS = [
  {
    name: "Harvest Buffet",
    price: "$100 per guest",
    short: "A curated spread of seasonal, hyper-local dishes — relaxed and abundant, for celebrations and larger groups.",
    long: "A thoughtfully curated buffet of seasonal, hyper-local dishes. Guests serve themselves — relaxed, abundant, perfect for casual celebrations and larger groups.",
  },
  {
    name: "Gathered Family Style",
    price: "$125 per guest",
    short: "A dedicated server presents and serves each dish at the table, built for connection over the meal.",
    long: "A dedicated server presents and serves each dish at the table. Warmth and elegance, built for connection over the meal.",
  },
  {
    name: "Chef's Table Plated",
    price: "$150 per guest",
    short: "The full restaurant experience at home: every course individually plated and presented at its highest level.",
    long: "The most refined offering — every course individually plated and presented at its highest level, with technique and storytelling for an intimate, restaurant-level meal.",
  },
];

export const PHONE = "417-403-9265";
export const PHONE_HREF = "tel:14174039265";
export const EMAIL = "dyllan@wildfoodsbydyllan.com";

export function renderHeader(active: string): string {
  return `<header class="hd">
  <div class="c hd-in">
    <a class="brand" href="/"><img src="/images/logo-lockup.webp" alt="Wild Foods by Dyllan"></a>
    <nav>${NAV.map(([href, label]) => `<a href="${href}"${href === active ? ' class="on" aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
  </div>
</header>`;
}

export function renderFooter(): string {
  return `<footer class="ft">
  <div class="c">
    <div class="ft-in">
      <div>
        <div class="ft-brand">Wild Foods by Dyllan</div>
        <p>Farm-to-table dinners, private chef service, and wild foods from Chef Dyllan Dale — serving Springfield and the Ozarks.</p>
      </div>
      <nav>${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}</nav>
      <div class="ft-contact">
        <a href="${PHONE_HREF}">${PHONE}</a>
        <a href="mailto:${EMAIL}">${EMAIL}</a>
      </div>
    </div>
    <div class="ft-base">Wild Foods by Dyllan · Springfield, Missouri</div>
  </div>
</footer>`;
}

export function renderPageHero(opts: {
  label: string;
  title: string;
  sub: string;
  image?: { src: string; alt: string; position?: string };
  surface?: "s-paper" | "s-white" | "s-sand" | "s-sage" | "s-pine";
  cta?: string;
}): string {
  const img = opts.image
    ? `<figure class="ph-img"><img src="${opts.image.src}" alt="${opts.image.alt}"${
        opts.image.position ? ` style="object-position:${opts.image.position};"` : ""
      }></figure>`
    : "";
  return `<section class="ph ${opts.surface ?? "s-paper"}${opts.image ? "" : " noimg"}">
  <div class="c ph-in">
    <div>
      <div class="label">${opts.label}</div>
      <h1>${opts.title}</h1>
      <p>${opts.sub}</p>
      ${opts.cta ? `<div class="hero-cta">${opts.cta}</div>` : ""}
    </div>
    ${img}
  </div>
</section>`;
}

export function renderBook(opts?: { title?: string; sub?: string; surface?: "s-earth" | "s-pine" }): string {
  return `<section class="book ${opts?.surface ?? "s-earth"}">
  <div class="c">
    <div class="label">Book</div>
    <h2>${opts?.title ?? "Every date starts with a conversation."}</h2>
    ${opts?.sub ? `<p class="sub">${opts.sub}</p>` : ""}
    <div class="book-lines">
      <a href="${PHONE_HREF}">${PHONE}</a>
      <a href="mailto:${EMAIL}">${EMAIL}</a>
    </div>
    <p class="where">Springfield, Missouri · serving the Ozarks</p>
  </div>
</section>`;
}

export function renderRates(rows: { name: string; price: string; note?: string }[]): string {
  return `<div class="rates">
      ${rows
        .map(
          (r) => `<div class="rate"><div class="rate-name">${r.name}</div><div class="rate-price">${r.price}</div><p>${r.note ?? ""}</p></div>`
        )
        .join("\n      ")}
    </div>`;
}

/* Upcoming ticketed dates. Past dates drop off on their own; dinners lead. */
export function renderDinnerList(opts?: { dinnersOnly?: boolean }): string {
  const today = new Date().toLocaleDateString("en-CA");
  const rows = EVENTS.filter((e) => e.date >= today && (!opts?.dinnersOnly || e.kind === "dinner")).sort(
    (a, b) => (a.kind === b.kind ? 0 : a.kind === "dinner" ? -1 : 1)
  );
  if (!rows.length) {
    return `<ol class="dl"><li><div></div><div><h3>New dates coming soon</h3><p>The next dinners are being set with our farm hosts. Call or email to hear first.</p></div></li></ol>`;
  }
  return `<ol class="dl">
        ${rows
          .map((e) => {
            const d = new Date(`${e.date}T12:00:00`);
            const month = d.toLocaleDateString("en-US", { month: "short" });
            const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
            // The shared note starts with the full date, which the date column already shows.
            const parts = e.note.split(" · ");
            const details = /\d{4}/.test(parts[0]) ? parts.slice(1).join(" · ") : e.note;
            const price = e.price.startsWith("$") ? `<span class="price">${e.price.replace(" / ", " per ")}</span>` : "";
            const kind = e.kind === "workshop" ? `<span class="kind">Workshop</span>` : "";
            return `<li>
          <div><span class="d">${d.getDate()}</span><span class="m">${month}<span class="wd"> · ${weekday}</span></span></div>
          <div>${kind}<h3>${e.name}</h3><p>${details}</p></div>
          <div class="dl-side">${price}<a class="tlink" href="${BOOKING_URL}" target="_blank" rel="noopener">Tickets</a></div>
        </li>`;
          })
          .join("\n        ")}
      </ol>`;
}

export function renderRolls(): string {
  const roll = (names: string[]) => names.map((n) => `<span class="h">${n}</span>`).join('<span class="sep">·</span> ');
  return `<div class="label center">Dinners hosted at</div>
    <p class="roll">${roll(HOSTS.map((h) => h.name))}</p>
    <div class="label center roll-next">In partnership with</div>
    <p class="roll wrap-names">${roll(PARTNERS)}</p>`;
}

export function Html({ html }: { html: string }) {
  return <div className="v2-frag" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function V2Page({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: V2_STYLES }} />
      <div className="v2">{children}</div>
    </>
  );
}
