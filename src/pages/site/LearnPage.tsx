import { useEffect } from "react";
import {
  renderTopBar,
  renderPageBanner,
  renderBookCard,
  FOOTER_HTML,
  SITE_STYLES,
} from "@/pages/site-shared";

const PAGE_BODY = `${renderTopBar("/learn")}

${renderPageBanner({
  eyebrow: "Learn",
  title: "Foraging Walks, Consultations &amp; Teaching",
  sub: "Hands-on identification in the field, one-on-one coaching, and classes for schools, restaurants, and community groups.",
})}

<main>
  <section id="foraging-walks">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">I</div>
        <h2>Foraging Walks</h2>
        <div class="rule"></div>
      </div>
      <div class="feature-pair">
        <div class="feature-photo">
          <img src="/images/creek-foraging.jpg" alt="Chef Dyllan foraging along a creek in the Ozarks with his dog">
        </div>
        <div>
          <h3>Foraging Walks with Chef Dyllan</h3>
          <p style="color:var(--ink-soft);">Chef Dyllan comes to your land for a private foraging walk, where you'll learn to identify and use wild edibles. Built for landowners who want to be guided through their own property to learn identification and location practices.</p>
          <p style="color:var(--ink-soft);">Foraging requires real knowledge of plant identification, safe harvesting, and environmental stewardship — that's exactly what these walks teach, hands-on, in the field.</p>
        </div>
      </div>

      <div class="rate-ledger" style="margin-top:44px;">
        <table>
          <thead><tr><th>Session</th><th>Rate</th><th>Notes</th></tr></thead>
          <tbody>
            <tr>
              <td class="svc">2-Hour Walk</td>
              <td class="rate">$100 / session</td>
              <td class="note">On your property, identifying and using wild edibles.</td>
            </tr>
            <tr>
              <td class="svc">4-Hour Walk</td>
              <td class="rate">$200 / session</td>
              <td class="note">Add a 3-course foraged meal for $30/person.</td>
            </tr>
            <tr>
              <td class="svc">Travel</td>
              <td class="rate">$5 / 10 mi</td>
              <td class="note">Beyond 30 miles of Springfield, MO. 50% deposit required to reserve your date.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <div class="deckle"></div>

  <section style="background:var(--paper-dark);" id="consultations">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">II</div>
        <h2>Consultations</h2>
        <div class="rule"></div>
      </div>
      <p style="max-width:640px;color:var(--ink-soft);margin-top:-24px;margin-bottom:36px;">Nearly 15 years of professional cooking experience, offered as personalized guidance for restaurants, chefs, and home foragers — zero-waste operations, farm-to-table transitions, fermentation, wild foods, menu development, and kitchen technique. Phone, Zoom, or in person.</p>
      <div class="rate-ledger">
        <table>
          <thead><tr><th>Session</th><th>Rate</th><th>Notes</th></tr></thead>
          <tbody>
            <tr>
              <td class="svc">30-Minute Consultation</td>
              <td class="rate">$30</td>
              <td class="note">Phone or Zoom.</td>
            </tr>
            <tr>
              <td class="svc">1-Hour Consultation</td>
              <td class="rate">$50</td>
              <td class="note">Phone or Zoom.</td>
            </tr>
            <tr>
              <td class="svc">In-Person Consultation</td>
              <td class="rate">Same + $1/mi</td>
              <td class="note">Round-trip mileage, added to the phone/Zoom rate.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <div class="deckle"></div>

  <section id="instructor-services">
    <div class="wrap">
      <div class="sec-label">
        <div class="num stamp-font">III</div>
        <h2>Teaching &amp; Instructor Services</h2>
        <div class="rule"></div>
      </div>
      <p style="max-width:640px;color:var(--ink-soft);margin-top:-24px;margin-bottom:36px;">Engaging, educational presentations for schools, organizations, conferences, community groups, and private events — approachable, informative, rooted in real-world experience.</p>

      <div class="menu-block" style="margin-bottom:36px;">
        <div class="dish-list" style="margin-top:0; padding-top:0; border-top:none;">
          <div>
            <h4>Cooking Fundamentals</h4>
            <ul><li>Knife skills, flavor building, seasonal cooking, professional kitchen technique</li></ul>
          </div>
          <div>
            <h4>Cooking With Wild Foods</h4>
            <ul><li>Incorporating foraged ingredients into everyday meals, safely and creatively</li></ul>
          </div>
          <div>
            <h4>Fermentation &amp; Preservation</h4>
            <ul><li>Vinegars, lacto-fermentation, food safety, traditional preservation</li></ul>
          </div>
          <div>
            <h4>Foraging Education</h4>
            <ul><li>Ozarks-focused plant identification, ethics, seasonality, responsible harvesting</li></ul>
          </div>
        </div>
      </div>

      <div class="rate-ledger">
        <table>
          <thead><tr><th>Session</th><th>Rate</th><th>Notes</th></tr></thead>
          <tbody>
            <tr>
              <td class="svc">Per Hour</td>
              <td class="rate">$100</td>
              <td class="note">Talks and classes tailored to your audience and time frame.</td>
            </tr>
            <tr>
              <td class="svc">Half-Day Session</td>
              <td class="rate">$300</td>
              <td class="note">—</td>
            </tr>
            <tr>
              <td class="svc">Full-Day Session</td>
              <td class="rate">$500</td>
              <td class="note">Rates may vary for travel, multi-day engagements, or custom curriculum.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section style="background:var(--paper-dark);">
    <div class="wrap-narrow">
      ${renderBookCard({
        title: "Book a Walk, Consultation, or Class",
        sub: "Tell Dyllan what you want to learn and when — walks, coaching calls, and classes all start with a quick conversation.",
      })}
    </div>
  </section>
</main>

${FOOTER_HTML}`;

export function LearnPage() {
  useEffect(() => {
    document.title = "Learn — Foraging, Consultations & Teaching — Wild Foods by Dyllan";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
