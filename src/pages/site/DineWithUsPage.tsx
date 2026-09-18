import { useEffect } from "react";
import {
  renderTopBar,
  renderPageBanner,
  renderBookCard,
  FOOTER_HTML,
  SITE_STYLES,
} from "@/pages/site-shared";

const PAGE_BODY = `${renderTopBar("/dine-with-us")}

${renderPageBanner({
  eyebrow: "Dine With Us",
  title: "Pop-Up Dinners &amp; Catering",
  sub: "Seasonal, foraged, hyper-local menus — served at farms, wineries, and private venues around the Ozarks.",
})}

<main>
  <section>
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">I</div>
        <h2>Upcoming Pop-Ups</h2>
        <div class="rule"></div>
      </div>
      <p class="shop-note">A running list of ticketed pop-up dinners and workshops, hosted at farms, wineries, and Ozarks properties. Every listing here mirrors what's currently posted for sale — tickets and exact guest counts are handled on the booking site, linked below.</p>

      <div class="rate-ledger" style="margin-top:10px;">
        <table>
          <thead>
            <tr><th>Event</th><th>Price</th><th>Details</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="svc">Live-Fire Fall Dinner at Bull Mills</td>
              <td class="rate">$125 / person</td>
              <td class="note">Saturday, November 14, 2026 · 5:30–8:30pm · limited to 25 guests · BYOB · communal fireside meal, not a formal coursed dinner.</td>
            </tr>
            <tr>
              <td class="svc">Fall Harvest Dinner with Finley Farms</td>
              <td class="rate">See listing</td>
              <td class="note">November 6, 2026 · 6–8pm · at Finley Farms · foraged &amp; farm ingredients, non-alcoholic pairings included, alcohol pairing add-on available. 18+.</td>
            </tr>
            <tr>
              <td class="svc">Ozarks Farm Stop to Table Dinner</td>
              <td class="rate">See listing</td>
              <td class="note">October 10, 2026 · 5–7pm · five courses built entirely around Ozarks Farm Stop producers · self-serve bar available.</td>
            </tr>
            <tr>
              <td class="svc">Wild Fermentation Workshop</td>
              <td class="rate">$35 / person</td>
              <td class="note">October 3, 2026 · 10am–2pm · vinegars, lacto-ferments &amp; kombucha · hands-on, take home your own ferment.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-family:'Special Elite', monospace; font-size:12.5px; color:var(--ink-soft); margin-top:18px;">Full calendar, seating, and checkout live on the current booking site — <a href="https://wildfoodsbydyllan.com/booking/" target="_blank" rel="noopener" style="color:var(--rust-deep); border-bottom:1px solid var(--rust-deep); text-decoration:none;">see all pop-up events &amp; buy tickets →</a></p>
    </div>
  </section>

  <section style="background:var(--paper-dark);">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">II</div>
        <h2>A Recent Pop-Up, In Full</h2>
        <div class="rule"></div>
      </div>
      <div class="feature-pair">
        <div class="feature-photo">
          <img src="/images/plated-venison.jpg" alt="Seared venison plate from a Wild Foods pop-up dinner">
        </div>
        <div>
          <h3>Stonewater Cove — a wine-paired tasting menu</h3>
          <p style="color:var(--ink-soft);">Under the open sky, a curated menu built around locally sourced, foraged ingredients — each course paired with wine. First course: a wood-fired butternut squash salad with shaved fennel, toasted pepitas, local chèvre, and a brown butter–sage vinaigrette. Main: pan-seared walleye almondine.</p>
          <p style="color:var(--ink-soft);">This is the level of detail every pop-up gets — a fixed menu, designed around what's in season and what was gathered that week.</p>
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
        <p class="tier-desc" style="margin-bottom:0;">Having a get-together and want a unique catering option? Wild Foods By Dyllan specializes in Ozarks wild foods — including game meats and foraged ingredients — brought to your event with a fine-dining twist. Non-wild menus are available too.</p>
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
        title: "Book a Pop-Up, Catering Date, or Ask About Hosting One",
        sub: "Own a venue and want to partner on a pop-up dinner? Planning an event and need catering? Start with a call or an email — Dyllan builds every menu around the date, the space, and what's in season.",
      })}
    </div>
  </section>
</main>

${FOOTER_HTML}`;

export function DineWithUsPage() {
  useEffect(() => {
    document.title = "Dine With Us — Wild Foods by Dyllan";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
