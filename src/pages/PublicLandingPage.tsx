import {
  V2Page,
  Html,
  renderHeader,
  renderFooter,
  renderBook,
  renderDinnerList,
  renderRolls,
  PRIVATE_CHEF_TIERS,
} from "@/pages/v2";
import { PlateGallery } from "@/pages/site/PlateGallery";

const TOP = `${renderHeader("/")}

<section class="hero s-paper">
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
      <img src="/images/g-chef-plating.jpg" alt="Chef Dyllan Dale plating a long table of courses in black gloves" style="object-position:center 30%;">
      <figcaption>Plating a full dinner service by hand.</figcaption>
    </figure>
  </div>
</section>

<section class="sec s-pine" id="dinners">
  <div class="c">
    <div class="sh split">
      <div>
        <div class="label">Farm dinners</div>
        <h2>At the table this season</h2>
      </div>
      <p>Ticketed dinners set at the farms, ranches, and orchards that raise the food. Each menu is crafted from farm-fresh ingredients, seasonal produce, and wild foods foraged throughout the Ozarks.</p>
    </div>
    <figure class="band">
      <img src="/images/g-dinner-dusk.jpg" alt="Dyllan speaking to guests at an outdoor dinner at dusk, under string lights" style="object-position:center 40%;">
    </figure>
    ${renderDinnerList({ dinnersOnly: true })}
    <div class="after-list"><a class="tlink" href="/farm-to-table">All dates, workshops &amp; catering</a></div>
  </div>
</section>

<section class="sec s-paper">
  <div class="c">
    <div class="sh center">
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
        <img src="/images/g-hands-plating.jpg" alt="Hands placing garnish on a long row of plated courses" style="object-position:center 55%;">
        <figcaption><span class="n">02</span><strong>Finished</strong>Every plate completed by hand at the pass.</figcaption>
      </figure>
      <figure>
        <img src="/images/g-teal-course.jpg" alt="A composed first course of beets, cured fish, and greens on a teal plate">
        <figcaption><span class="n">03</span><strong>Composed</strong>One course, built around what the season gave that week.</figcaption>
      </figure>
      <figure>
        <img src="/images/dish-short-rib.webp" alt="A braised short rib course carried out to the table" style="object-position:40% center;">
        <figcaption><span class="n">04</span><strong>Served</strong>Course by course, at the farm or in your home.</figcaption>
      </figure>
    </div>
  </div>
</section>`;

const BOTTOM = `<section class="menu-sec" id="private-chef">
  <img class="menu-bg" src="/images/g-plating-lamp.jpg" alt="">
  <div class="c">
    <div class="menu-card">
      <div class="label">Private chef</div>
      <h2>A restaurant-level dinner, in your home</h2>
      <p class="intro">Every menu starts with a conversation about your tastes, your guests, and the season, then is built from scratch. Farm-to-table, wild, or a blend of both.</p>
      <div class="menu-list">
        ${PRIVATE_CHEF_TIERS.map(
          (t) => `<div class="course">
          <div class="price">${t.price}</div>
          <h3>${t.name}</h3>
          <p>${t.short}</p>
        </div>`
        ).join("\n        ")}
      </div>
      <div class="menu-foot">
        Five-guest minimum · 50% deposit reserves your date<br>
        Menu, sourcing, cooking, service &amp; cleanup included
        <div><a class="tlink" href="/private-chef">Plan a private dinner</a></div>
      </div>
    </div>
  </div>
</section>

<section class="sec s-sand">
  <div class="c split rev">
    <figure>
      <img src="/images/g-chef-standing.jpg" alt="Chef Dyllan Dale in a black chef coat, standing in a kitchen before service" style="object-position:center 35%;">
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

<section class="sec s-sage">
  <div class="c">
    <div class="qmark" aria-hidden="true">“</div>
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

<section class="sec s-white">
  <div class="c">
    ${renderRolls()}
  </div>
</section>

<section class="sec s-paper">
  <div class="c cards">
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

${renderBook()}
${renderFooter()}`;

export function PublicLandingPage() {
  return (
    <V2Page title="Wild Foods by Dyllan — Farm-to-Table Dining in the Ozarks">
      <Html html={TOP} />
      <PlateGallery />
      <Html html={BOTTOM} />
    </V2Page>
  );
}
