import { useEffect } from "react";
import { renderTopBar, renderPageBanner, FOOTER_HTML, SITE_STYLES } from "@/pages/site-shared";

const PAGE_BODY = `${renderTopBar("/shop")}

${renderPageBanner({
  eyebrow: "Shop",
  title: "Apparel &amp; Gift Certificates",
  sub: "Merch and gift certificates are sold through the current storefront — cart and checkout live there, not here yet.",
})}

<main>
  <section>
    <div class="wrap">
      <p class="shop-note">Checkout and payments for the shop haven't moved to this rebuild yet — every card below links straight to where the item is actually sold today. Prices shown are current listing prices.</p>

      <div class="sec-label">
        <div class="num stamp-font">I</div>
        <h2>Apparel</h2>
        <div class="rule"></div>
      </div>

      <div class="product-grid" style="margin-bottom:44px;">
        <div class="product-card">
          <img src="/images/tee-orange.jpg" alt="Forage the Ozarks t-shirt, orange, MOGROWN collab">
          <h3>MOGROWN × Wild Foods T-Shirt</h3>
          <div class="pc-price">Third-party store</div>
          <a class="pc-link" href="https://mogrown.com/products/forage-the-ozarks-t-shirt-with-wild-foods-by-dyllan-t-shirt-only" target="_blank" rel="noopener">Shop on MOGROWN →</a>
        </div>
        <div class="product-card">
          <img src="/images/tee-gold.jpg" alt="Wild Foods by Dyllan t-shirt, gold">
          <h3>"Eat Local, Forage Global" T-Shirt</h3>
          <div class="pc-price">$20 – $30</div>
          <a class="pc-link" href="https://wildfoodsbydyllan.com/product-category/apparel/" target="_blank" rel="noopener">View in Shop →</a>
        </div>
        <div class="product-card">
          <img src="/images/tee-kelly.jpg" alt="Forage Feast Repeat t-shirt, kelly green">
          <h3>"Forage, Feast, Repeat" T-Shirt</h3>
          <div class="pc-price">$20 – $27</div>
          <a class="pc-link" href="https://wildfoodsbydyllan.com/product-category/apparel/" target="_blank" rel="noopener">View in Shop →</a>
        </div>
        <div class="product-card">
          <img src="/images/tee-white.jpg" alt="More Mushrooms Less Problems t-shirt, white">
          <h3>"More Mushrooms Less Problems" T-Shirt</h3>
          <div class="pc-price">$25 – $27</div>
          <a class="pc-link" href="https://wildfoodsbydyllan.com/product-category/apparel/" target="_blank" rel="noopener">View in Shop →</a>
        </div>
        <div class="product-card">
          <img src="/images/tee-natural.jpg" alt="I Support Sustainable Eating t-shirt, natural">
          <h3>"I Support Sustainable Eating" T-Shirt</h3>
          <div class="pc-price">$20 – $30</div>
          <a class="pc-link" href="https://wildfoodsbydyllan.com/product-category/apparel/" target="_blank" rel="noopener">View in Shop →</a>
        </div>
        <div class="product-card">
          <img src="/images/gift-certificate.jpg" alt="Wild Foods by Dyllan gift certificate">
          <h3>Gift Certificate</h3>
          <div class="pc-price">$15 – $150</div>
          <a class="pc-link" href="https://wildfoodsbydyllan.com/product/gift-certificate/" target="_blank" rel="noopener">Buy a Gift Certificate →</a>
        </div>
      </div>

      <p style="font-family:'Special Elite', monospace; font-size:12.5px; color:var(--ink-soft);">See the full apparel range — <a href="https://wildfoodsbydyllan.com/shop/" target="_blank" rel="noopener" style="color:var(--rust-deep); border-bottom:1px solid var(--rust-deep); text-decoration:none;">visit the current shop →</a></p>
    </div>
  </section>
</main>

${FOOTER_HTML}`;

export function ShopPage() {
  useEffect(() => {
    document.title = "Shop — Wild Foods by Dyllan";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
