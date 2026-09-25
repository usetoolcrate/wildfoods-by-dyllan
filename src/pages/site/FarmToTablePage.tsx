import { useEffect } from "react";
import {
  renderTopBar,
  renderPageBanner,
  renderBookCard,
  renderEventRows,
  renderHostRoll,
  BOOKING_URL,
  FOOTER_HTML,
  SITE_STYLES,
} from "@/pages/site-shared";

const PAGE_BODY = `${renderTopBar("/farm-to-table")}

${renderPageBanner({
  eyebrow: "Farm to Table",
  title: "Farm-to-Table Dinners &amp; Catering",
  sub: "Ticketed dinners set at Ozarks farms, ranches, orchards, and wineries — menus built from what the host grows and raises, with wild foods foraged close by.",
})}

<main>
  <section>
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">I</div>
        <h2>Upcoming Farm Dinners</h2>
        <div class="rule"></div>
      </div>
      <p class="shop-note">Each menu is crafted from farm-fresh ingredients, seasonal produce, and wild foods foraged throughout the Ozarks, then served where the food comes from. Tickets and exact guest counts are handled on the booking site, linked below.</p>

      <div class="rate-ledger" style="margin-top:10px;">
        <table>
          <thead>
            <tr><th>Event</th><th>Price</th><th>Details</th></tr>
          </thead>
          <tbody>
            ${renderEventRows()}
          </tbody>
        </table>
      </div>
      <p class="ledger-link">Full calendar, seating, and checkout live on the current booking site — <a href="${BOOKING_URL}" target="_blank" rel="noopener">see all dinners &amp; buy tickets →</a></p>

      <div class="host-head">Where the table's been set</div>
      ${renderHostRoll()}
    </div>
  </section>

  <section style="background:var(--paper-dark);">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">II</div>
        <h2>A Recent Dinner, In Full</h2>
        <div class="rule"></div>
      </div>
      <div class="feature-pair">
        <div class="feature-photo">
          <img src="/images/plated-venison.jpg" alt="Seared venison plate from a Wild Foods dinner">
        </div>
        <div>
          <h3>Stonewater Cove — a wine-paired tasting menu</h3>
          <p style="color:var(--ink-soft);">Under the open sky, a curated menu built around locally sourced, foraged ingredients — each course paired with wine. First course: a wood-fired butternut squash salad with shaved fennel, toasted pepitas, local chèvre, and a brown butter–sage vinaigrette. Main: pan-seared walleye almondine.</p>
          <p style="color:var(--ink-soft);">This is the level of detail every dinner gets — a fixed menu, designed around what's in season, what the farms are harvesting, and what was gathered that week.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">III</div>
        <h2>Catering</h2>
        <div class="rule"></div>
      </div>
      <div class="menu-block">
        <p class="tier-desc" style="margin-bottom:0;">Having a get-together and want a unique catering option? Menus are built from small Ozarks farms and seasonal produce — with game meats and foraged wild foods whenever you want them — and brought to your event with a fine-dining twist.</p>
        <div class="dish-list" style="columns:1; margin-top:26px; padding-top:22px;">
          <h4>Rates</h4>
          <ul>
            <li>Starts at $25 per head</li>
            <li>Minimum 15 guests</li>
            <li>Fewer than 15? Ask about <a href="/private-chef" style="color:var(--rust-deep);">Private Chef Services</a> instead</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section style="background:var(--paper-dark);">
    <div class="wrap-narrow">
      ${renderBookCard({
        title: "Book a Farm Dinner, a Catering Date, or Host One",
        sub: "Own a farm, winery, or venue and want to host a dinner? Planning an event and need catering? Start with a call or an email — Dyllan builds every menu around the date, the place, and what's in season.",
      })}
    </div>
  </section>
</main>

${FOOTER_HTML}`;

export function FarmToTablePage() {
  useEffect(() => {
    document.title = "Farm-to-Table Dinners — Wild Foods by Dyllan";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
