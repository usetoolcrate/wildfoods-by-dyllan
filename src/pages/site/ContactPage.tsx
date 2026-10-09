import { V2Page, Html, renderHeader, renderFooter, PHONE, PHONE_HREF, EMAIL } from "@/pages/v2";

const BODY = `${renderHeader("/contact")}

<section class="ph s-pine">
  <div class="c">
    <div class="sh" style="margin-bottom:64px;">
      <div class="label">Contact</div>
      <h1 style="font-size:clamp(42px,5.4vw,74px);line-height:1;margin-top:22px;">Let's talk about your date.</h1>
      <p style="font-size:18.5px;margin-top:24px;">Farm dinners, private chef nights, catering, foraging walks, classes, or just a question — call, text, or email and tell Dyllan what you're picturing.</p>
    </div>
    <div class="reach">
      <div><div class="label">Call or text</div><a href="${PHONE_HREF}">${PHONE}</a></div>
      <div><div class="label">Email</div><a href="mailto:${EMAIL}">${EMAIL}</a></div>
      <div><div class="label">Serving</div><span class="big">All of Missouri, Northwest Arkansas &amp; Eastern Oklahoma</span></div>
    </div>
  </div>
</section>

<section class="sec s-paper">
  <div class="c">
    <div class="sh center">
      <div class="label">Not sure where to start?</div>
      <h2>Find the right fit</h2>
    </div>
    <div class="cards three">
      <a href="/farm-to-table">
        <div class="label">Farm to table</div>
        <h3>A seat at a farm dinner</h3>
        <p>Ticketed dinners at Ozarks farms, ranches, and orchards — plus catering and hosting.</p>
        <span class="tlink">See dates</span>
      </a>
      <a href="/private-chef">
        <div class="label">Private chef</div>
        <h3>A dinner in your home</h3>
        <p>Buffet, family style, or plated — a custom menu for five guests or more.</p>
        <span class="tlink">See options</span>
      </a>
      <a href="/learn">
        <div class="label">Learn</div>
        <h3>A walk or a class</h3>
        <p>Foraging walks on your land, consultations, and teaching for groups.</p>
        <span class="tlink">See rates</span>
      </a>
    </div>
  </div>
</section>

${renderFooter()}`;

export function ContactPage() {
  return (
    <V2Page title="Contact — Wild Foods by Dyllan">
      <Html html={BODY} />
    </V2Page>
  );
}
