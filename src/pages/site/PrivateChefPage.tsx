import { useEffect } from "react";
import {
  renderTopBar,
  renderPageBanner,
  renderBookCard,
  FOOTER_HTML,
  SITE_STYLES,
} from "@/pages/site-shared";

const PAGE_BODY = `${renderTopBar("/private-chef")}

${renderPageBanner({
  eyebrow: "Private Chef",
  title: "Private Chef Services",
  sub: "Hyper-local, seasonal, crafted with intention — a full restaurant experience, brought to your table.",
})}

<main>
  <section>
    <div class="wrap-narrow">
      <p style="font-size:20px; color:var(--ink-soft); line-height:1.55;">Every private chef experience is built around one belief: the best meals come from what's grown, raised, and gathered close to home. Each dinner uses hyper-local ingredients, small-farm proteins, and — when you want it — wild foraged foods that bring depth and a sense of place to every course.</p>
      <p style="font-size:18px; color:var(--ink-soft);">Whether the menu is fully wild, completely non-wild, or a curated mix of both, your evening is crafted to be personal, memorable, and deeply flavorful. Please send an email to check date availability — <strong>50% is paid up front</strong>.</p>
    </div>
  </section>

  <section style="background:var(--paper-dark);">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">I</div>
        <h2>Choose Your Experience</h2>
        <div class="rule"></div>
      </div>
      <div class="menu-block">
        <h3 class="tier"><span>Harvest Buffet</span><span class="leader"></span><span class="price">$90 / person</span></h3>
        <p class="tier-desc">A thoughtfully curated buffet of seasonal, hyper-local dishes. Guests serve themselves — relaxed, abundant, perfect for casual celebrations and larger groups.</p>

        <h3 class="tier"><span>Gathered Family Style</span><span class="leader"></span><span class="price">$120 / person</span></h3>
        <p class="tier-desc">A guided family-style meal — a dedicated server presents and serves each dish at the table. Warmth and elegance, encouraging connection while elevating the experience.</p>

        <h3 class="tier"><span>Chef's Table Plated</span><span class="leader"></span><span class="price">$150 / person</span></h3>
        <p class="tier-desc">Our most refined offering — every course individually plated and presented at its highest level. Technique, storytelling, and presentation for an intimate, restaurant-level meal in your home.</p>

        <div class="dish-list">
          <div>
            <h4>Wild-Inspired Sample Dishes</h4>
            <ul>
              <li>Chanterelle velouté with herb oil</li>
              <li>Citrus-smoked trout with seasonal produce</li>
              <li>Wild herb–marinated beef or bison</li>
              <li>Rabbit ravioli with brown-butter sage</li>
              <li>Pawpaw or seasonal fruit crème brûlée</li>
            </ul>
          </div>
          <div>
            <h4>Non-Wild Hyper-Local Sample Dishes</h4>
            <ul>
              <li>Herb-roasted chicken with pan jus</li>
              <li>Braised short ribs with garlic mashed potatoes</li>
              <li>Seared salmon with lemon-herb cream</li>
              <li>Whipped sweet potatoes with browned butter</li>
              <li>Elegant tartlets with local fruit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">II</div>
        <h2>Everything Is Handled</h2>
        <div class="rule"></div>
      </div>
      <div class="feature-pair rev">
        <div class="feature-photo">
          <img src="/images/plated-tartare.jpg" alt="A plated course from a Wild Foods private chef dinner">
        </div>
        <div>
          <h3>No templates, no pre-set menus</h3>
          <p style="color:var(--ink-soft);">Every experience starts with a conversation about your tastes, dietary needs, and event style — then a custom menu is built from scratch. That includes:</p>
          <div class="dish-list" style="columns:1; margin-top:20px; padding-top:20px;">
            <ul>
              <li>Menu development</li>
              <li>Ingredient sourcing — real relationships with growers, ranchers, and makers</li>
              <li>On-site cooking</li>
              <li>Plating &amp; service</li>
              <li>Complete cleanup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section style="background:var(--paper-dark);">
    <div class="wrap-narrow">
      ${renderBookCard({
        title: "Let's Build Your Hyper-Local Dining Experience",
        sub: "Wild, non-wild, or a blend of both — your dinner is crafted intentionally and uniquely for your event. 5-person minimum, 50% deposit to reserve your date.",
      })}
    </div>
  </section>
</main>

${FOOTER_HTML}`;

export function PrivateChefPage() {
  useEffect(() => {
    document.title = "Private Chef Services — Wild Foods by Dyllan";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
