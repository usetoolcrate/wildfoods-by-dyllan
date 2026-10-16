import { V2Page, Html, renderHeader, renderFooter, renderPageHero, renderBook } from "@/pages/v2";

// Shirts are paused (Dyllan, 2026-09-29). Gift certificates sell on /gift-certificates.

const BODY = `${renderHeader("/shop")}

${renderPageHero({
  label: "Gift certificates",
  title: "Give someone a seat at the table",
  sub: "A Wild Foods by Dyllan gift certificate, from $15 to $150, good toward his dinners and workshops.",
  image: { src: "/images/g-raspberry-tart.jpg", alt: "A raspberry tart topped with meringue kisses and mint" },
  surface: "s-sand",
  cta: `<a class="btn" href="/gift-certificates">Buy a gift certificate</a>`,
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
