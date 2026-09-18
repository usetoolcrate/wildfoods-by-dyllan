import { useEffect } from "react";
import { renderTopBar, FOOTER_HTML, SITE_STYLES } from "@/pages/site-shared";


const PAGE_BODY = `${renderTopBar("/")}

<header class="mast">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <div class="eyebrow-plate">Springfield &amp; the Ozarks · Est. field practice</div>
      <h1>Wild Foods by Dyllan</h1>
      <p class="sub">Hyper-local dinners, foraging walks, and Ozarks wild foods, gathered and plated by hand by Chef Dyllan Dale.</p>
      <div class="hero-facts">
        <span>Foraging Walks</span><span class="dot">·</span>
        <span>Ticketed Pop-Up Dinners</span><span class="dot">·</span>
        <span>Private Chef Service</span>
      </div>
      <div class="hero-cta">
        <a class="btn-solid" href="#rates">See Rates &amp; Book a Walk</a>
        <a class="btn-line" href="#table">See the Menu</a>
      </div>
      <div class="colophon">
        <span>Chef Dyllan Dale</span>
        <span>417&#8209;403&#8209;9265</span>
        <span>dyllan@wildfoodsbydyllan.com</span>
      </div>
    </div>
    <div class="hero-media">
      <img src="/images/hero-creek-forage.webp" alt="Chef Dyllan Dale foraging along a creek in the Ozarks with his dog">
      <div class="fig">Fig. 1 — Wet-weather foraging, a creek crossing near Springfield</div>
      <blockquote>"I don't think I will ever leave the Ozarks — I hope to bring the flavors of the forest and field to people through fine dining and education."</blockquote>
    </div>
  </div>
</header>

<main>


  <!-- THE TABLE / PRIVATE CHEF MENU -->
  <section id="table" style="background:var(--paper-dark);">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">I</div>
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

  <div class="deckle"></div>

  <!-- SPECIMEN GALLERY -->
  <section class="wrap" id="recipes-nav">
    <div class="sec-label">
      <div class="num stamp-font">II</div>
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
  <section id="rates">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">III</div>
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

  <div class="deckle"></div>

  <!-- FIELD NOTES / STORY -->
  <section class="wrap-narrow" id="story">
    <div class="sec-label">
      <div class="num stamp-font">IV</div>
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

<div class="colophon-block" id="book">
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

${FOOTER_HTML}`;

export function PublicLandingPage() {
  useEffect(() => {
    document.title = "Wild Foods by Dyllan — Field Notes of an Ozarks Forager";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
