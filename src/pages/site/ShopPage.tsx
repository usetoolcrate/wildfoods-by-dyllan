import { V2Page, Html, renderHeader, renderFooter, renderPageHero, renderBook } from "@/pages/v2";

// Shirts are paused (Dyllan, 2026-09-29); gift certificates still sell on the current store.
const GIFT_URL = "https://wildfoodsbydyllan.com/product/gift-certificate/";

const BODY = `${renderHeader("/shop")}

${renderPageHero({
  label: "Gift certificates",
  title: "Give someone a seat at the table",
  sub: "A Wild Foods by Dyllan gift certificate, from $15 to $150. Checkout is on the current Wild Foods store for now.",
  image: { src: "/images/g-raspberry-tart.jpg", alt: "A raspberry tart topped with meringue kisses and mint" },
  surface: "s-sand",
  cta: `<a class="btn" href="${GIFT_URL}" target="_blank" rel="noopener">Buy a gift certificate</a>`,
})}

${renderBook({
  title: "Questions about a gift?",
  sub: "Call or email — Dyllan is happy to help you choose.",
})}
${renderFooter()}`;

export function ShopPage() {
  return (
    <V2Page title="Gift Certificates — Wild Foods by Dyllan">
      <Html html={BODY} />
    </V2Page>
  );
}
