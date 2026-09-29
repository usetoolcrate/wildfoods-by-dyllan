import { V2Page, Html, renderHeader, renderFooter, renderPageHero, renderBook, renderRates } from "@/pages/v2";

const BODY = `${renderHeader("/learn")}

${renderPageHero({
  label: "Learn",
  title: "Foraging walks, consultations &amp; teaching",
  sub: "Hands-on identification in the field, one-on-one coaching, and classes for schools, restaurants, and community groups.",
  image: { src: "/images/creek-foraging.jpg", alt: "Dyllan foraging along a creek in the Ozarks with his dog", position: "center 45%" },
  surface: "s-sage",
})}

<section class="sec s-paper" id="foraging-walks">
  <div class="c">
    <div class="sh split">
      <div>
        <div class="label">On your land</div>
        <h2>Foraging walks</h2>
      </div>
      <p>Dyllan comes to your property for a private walk, teaching you to identify and use the wild edibles already growing there — plant identification, safe harvesting, and stewardship, hands-on in the field.</p>
    </div>
    ${renderRates([
      { name: "Two-hour walk", price: "$100 per session", note: "On your property, identifying and using wild edibles." },
      { name: "Four-hour walk", price: "$200 per session", note: "Add a three-course foraged meal for $30 per person." },
      { name: "Travel", price: "$5 per 10 miles", note: "Beyond 30 miles of Springfield. 50% deposit reserves your date." },
    ])}
  </div>
</section>

<section class="sec s-white" id="consultations">
  <div class="c">
    <div class="sh split">
      <div>
        <div class="label">One-on-one</div>
        <h2>Consultations</h2>
      </div>
      <p>Nearly 15 years of professional cooking, offered as personal guidance for restaurants, chefs, and home foragers — zero-waste kitchens, farm-to-table transitions, fermentation, wild foods, menu development, and technique.</p>
    </div>
    ${renderRates([
      { name: "30 minutes", price: "$30", note: "Phone or Zoom." },
      { name: "One hour", price: "$50", note: "Phone or Zoom." },
      { name: "In person", price: "Same rate + $1 per mile", note: "Round-trip mileage, added to the phone or Zoom rate." },
    ])}
  </div>
</section>

<section class="sec s-sand" id="instructor-services">
  <div class="c">
    <div class="split rev" style="margin-bottom:72px;">
      <figure>
        <img src="/images/g-talk-room.jpg" alt="Dyllan speaking to a room of guests" style="object-position:center 40%;">
      </figure>
      <div>
        <div class="label">Teaching &amp; talks</div>
        <h2>For schools, groups &amp; conferences</h2>
        <p>Engaging, educational presentations for schools, organizations, conferences, community groups, and private events — approachable, informative, and rooted in real-world experience.</p>
      </div>
    </div>
    <div class="topics">
      <div class="topic"><h3>Cooking fundamentals</h3><p>Knife skills, flavor building, seasonal cooking, and professional kitchen technique.</p></div>
      <div class="topic"><h3>Cooking with wild foods</h3><p>Bringing foraged ingredients into everyday meals, safely and creatively.</p></div>
      <div class="topic"><h3>Fermentation &amp; preservation</h3><p>Vinegars, lacto-fermentation, food safety, and traditional preservation.</p></div>
      <div class="topic"><h3>Foraging education</h3><p>Ozarks plant identification, ethics, seasonality, and responsible harvesting.</p></div>
    </div>
    ${renderRates([
      { name: "Per hour", price: "$100", note: "Talks and classes tailored to your audience and time frame." },
      { name: "Half day", price: "$300" },
      { name: "Full day", price: "$500", note: "Rates may vary for travel, multi-day engagements, or custom curriculum." },
    ])}
  </div>
</section>

${renderBook({
  title: "Book a walk, a consultation, or a class.",
  sub: "Tell Dyllan what you want to learn and when — walks, coaching calls, and classes all start with a quick conversation.",
  surface: "s-pine",
})}
${renderFooter()}`;

export function LearnPage() {
  return (
    <V2Page title="Learn — Foraging, Consultations & Teaching — Wild Foods by Dyllan">
      <Html html={BODY} />
    </V2Page>
  );
}
