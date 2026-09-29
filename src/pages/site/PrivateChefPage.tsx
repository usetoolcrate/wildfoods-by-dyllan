import { V2Page, Html, renderHeader, renderFooter, renderPageHero, renderBook, PRIVATE_CHEF_TIERS } from "@/pages/v2";

const BODY = `${renderHeader("/private-chef")}

${renderPageHero({
  label: "Private chef",
  title: "A restaurant-level dinner, in your home",
  sub: "Small-farm proteins, seasonal produce, and wild foods when you want them — every course cooked, plated, and served at your table.",
  image: { src: "/images/g-private-residence.jpg", alt: "Dyllan plating a wild game dinner in a private home kitchen", position: "center 35%" },
  surface: "s-sand",
})}

<section class="sec s-white">
  <div class="c narrow">
    <p class="big-quote" style="font-style:normal;">Every private dinner is built around one belief: the best meals come from what's grown, raised, and gathered close to home.</p>
  </div>
</section>

<section class="menu-sec">
  <img class="menu-bg" src="/images/g-roulade-counter.jpg" alt="">
  <div class="c">
    <div class="menu-card">
      <div class="label">Choose your experience</div>
      <h2>Three ways to dine</h2>
      <p class="intro">Fully farm-to-table, fully wild, or a curated mix of both. Please email to check date availability.</p>
      <div class="menu-list">
        ${PRIVATE_CHEF_TIERS.map(
          (t) => `<div class="course">
          <div class="price">${t.price}</div>
          <h3>${t.name}</h3>
          <p>${t.long}</p>
        </div>`
        ).join("\n        ")}
      </div>
      <div class="menu-foot">Five-guest minimum · 50% deposit reserves your date</div>
    </div>
  </div>
</section>

<section class="sec s-paper">
  <div class="c">
    <div class="sh center">
      <div class="label">Sample dishes</div>
      <h2>A taste of the menu</h2>
      <p>No templates and no pre-set menus — these show the range. Yours is written from scratch.</p>
    </div>
    <div class="menus">
      <div>
        <h3>Farm-to-table</h3>
        <ul>
          <li>Herb-roasted chicken with pan jus</li>
          <li>Braised short ribs with garlic mashed potatoes</li>
          <li>Seared salmon with lemon-herb cream</li>
          <li>Whipped sweet potatoes with browned butter</li>
          <li>Elegant tartlets with local fruit</li>
        </ul>
      </div>
      <div>
        <h3>Wild-inspired</h3>
        <ul>
          <li>Chanterelle velouté with herb oil</li>
          <li>Citrus-smoked trout with seasonal produce</li>
          <li>Wild herb–marinated beef or bison</li>
          <li>Rabbit ravioli with brown-butter sage</li>
          <li>Pawpaw or seasonal fruit crème brûlée</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="sec s-sage">
  <div class="c split">
    <figure>
      <img src="/images/g-duck.jpg" alt="Sliced seared duck breast over wild rice with apple chutney, sage, and baby chard">
    </figure>
    <div>
      <div class="label">Everything is handled</div>
      <h2>You host. Dyllan does the rest.</h2>
      <p>Every experience starts with a conversation about your tastes, dietary needs, and event style — then a custom menu is built from scratch. That includes:</p>
      <ol class="ticks">
        <li><span>01</span>Menu development</li>
        <li><span>02</span>Ingredient sourcing — real relationships with growers, ranchers, and makers</li>
        <li><span>03</span>On-site cooking</li>
        <li><span>04</span>Plating &amp; service</li>
        <li><span>05</span>Complete cleanup</li>
      </ol>
    </div>
  </div>
</section>

${renderBook({
  title: "Let's plan your dinner.",
  sub: "Farm-to-table, wild, or a blend of both — crafted for your table. Five-guest minimum, 50% deposit to reserve your date.",
})}
${renderFooter()}`;

export function PrivateChefPage() {
  return (
    <V2Page title="Private Chef Services — Wild Foods by Dyllan">
      <Html html={BODY} />
    </V2Page>
  );
}
