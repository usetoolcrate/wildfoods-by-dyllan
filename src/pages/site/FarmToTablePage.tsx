import {
  V2Page,
  Html,
  renderHeader,
  renderFooter,
  renderPageHero,
  renderBook,
  renderDinnerList,
  renderRolls,
  renderRates,
} from "@/pages/v2";

const BODY = `${renderHeader("/farm-to-table")}

${renderPageHero({
  label: "Farm to Table",
  title: "Dinners set where the food is grown",
  sub: "Ticketed dinners at Ozarks farms, ranches, orchards, and wineries — menus built from what the host grows and raises, with wild foods foraged close by.",
  image: { src: "/images/g-dinner-brick.jpg", alt: "Dyllan introducing a course to dinner guests in a brick-walled venue", position: "center 40%" },
})}

<section class="sec s-pine" id="dates">
  <div class="c">
    <div class="sh split">
      <div>
        <div class="label">Upcoming</div>
        <h2>Dinners &amp; workshops</h2>
      </div>
      <p>Each menu is crafted from farm-fresh ingredients, seasonal produce, and wild foods foraged throughout the Ozarks, then served where the food comes from. Dinners are hosted with a partner farm or venue, and the host sells the tickets — follow the link on each date.</p>
    </div>
    ${renderDinnerList()}
    <div class="after-list"><a class="tlink" href="#catering">Host a dinner with Dyllan</a></div>
  </div>
</section>

<section class="sec s-white">
  <div class="c">
    <div class="sh">
      <div class="label">Recent dinners</div>
      <h2>From the pass</h2>
    </div>
    <div class="mosaic">
      <figure>
        <img src="/images/g-regalo-pork.jpg" alt="Pork roulade with a golden sauce on a teal plate">
        <figcaption>Pork roulade, Regalo Orchard</figcaption>
      </figure>
      <figure>
        <img src="/images/g-regalo-overhead.jpg" alt="A table of plated courses with squash purée and green beans">
        <figcaption>A course ready to go out, Regalo Orchard</figcaption>
      </figure>
      <figure>
        <img src="/images/g-melon-course.jpg" alt="Melon, shaved onion, and mint in a pale green bowl">
        <figcaption>End-of-summer melon course</figcaption>
      </figure>
      <figure>
        <img src="/images/g-teal-overhead.jpg" alt="Rows of composed first courses on teal plates">
      </figure>
      <figure>
        <img src="/images/g-dark-plate.jpg" alt="A plated course on a dark plate set on a wooden table with greenery">
      </figure>
      <figure>
        <img src="/images/g-raspberry-tart.jpg" alt="A raspberry tart topped with meringue kisses and mint">
      </figure>
    </div>
  </div>
</section>

<section class="sec s-paper">
  <div class="c">
    ${renderRolls()}
  </div>
</section>

<section class="sec s-sand">
  <div class="c split">
    <figure>
      <img src="/images/plated-venison.jpg" alt="Seared venison plate from a Wild Foods dinner">
    </figure>
    <div>
      <div class="label">A recent dinner, in full</div>
      <h2>Stonewater Cove, wine-paired</h2>
      <p>Under the open sky, a curated menu built around locally sourced, foraged ingredients — each course paired with wine. First course: a wood-fired butternut squash salad with shaved fennel, toasted pepitas, local chèvre, and a brown butter–sage vinaigrette. Main: pan-seared walleye almondine.</p>
      <p>This is the level of detail every dinner gets — a fixed menu, designed around what's in season, what the farms are harvesting, and what was gathered that week.</p>
    </div>
  </div>
</section>

<section class="sec s-white" id="catering">
  <div class="c">
    <div class="sh split">
      <div>
        <div class="label">Catering &amp; hosting</div>
        <h2>Bring the dinner to your event</h2>
      </div>
      <p>Menus built from small Ozarks farms and seasonal produce — with game meats and foraged wild foods whenever you want them — brought to your event with a fine-dining twist. Own a farm, winery, or venue? Host a dinner with Dyllan.</p>
    </div>
    ${renderRates([
      { name: "Catering", price: "From $25 per guest", note: "15-guest minimum. Fewer than 15? See <a href=\"/private-chef\" style=\"border-bottom:1px solid currentColor;\">private chef dinners</a>." },
      { name: "Host a farm dinner", price: "$50–$90 per guest", note: "For farms, wineries &amp; event spaces. 3 to 6 courses, 20-guest minimum, $250 planning fee. Full staffing and service included — the host keeps ticket revenue." },
    ])}
  </div>
</section>

${renderBook({
  title: "Book a dinner, a catering date, or host one.",
  sub: "Start with a call or an email — Dyllan builds every menu around the date, the place, and what's in season.",
})}
${renderFooter()}`;

export function FarmToTablePage() {
  return (
    <V2Page title="Farm-to-Table Dinners — Wild Foods by Dyllan">
      <Html html={BODY} />
    </V2Page>
  );
}
