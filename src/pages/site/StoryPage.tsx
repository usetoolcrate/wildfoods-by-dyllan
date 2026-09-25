import { useEffect } from "react";
import { renderTopBar, renderPageBanner, FOOTER_HTML, SITE_STYLES } from "@/pages/site-shared";

const PAGE_BODY = `${renderTopBar("/story")}

${renderPageBanner({
  eyebrow: "About",
  title: "My Story",
  sub: "How a kid who never left the woods around Branson became the Ozarks chef behind farm-to-table dinners — with a forager's eye on every plate.",
})}

<main>
  <section>
    <div class="wrap-narrow">
      <div class="ledger">
        <div class="entry">
          <div class="when"><span class="age">10</span>Branson, MO</div>
          <div>
            <h3>Never fit indoors</h3>
            <p>I can remember being completely fascinated by nature ever since I was young — every intricate part, from the moss on a tree to the lizard under a log. Growing up in the Ozarks, surrounded by that kind of diversity, I spent every hour I could flipping logs and rocks to look at everything that crawled and moved.</p>
            <p>When I was ten, I caught and skinned my first copperhead to give to a friend the snake had bitten a few days prior. I've never feared nature since — I respect it, know the danger it presents, and know I can be part of it without fearing it.</p>
          </div>
        </div>

        <div class="entry">
          <div class="when"><span class="age">11</span>Good Eats</div>
          <div>
            <h3>The show that started it</h3>
            <p>I came home from school one day to an empty house and a small 14-inch TV. "Good Eats," with Alton Brown, was on — breaking down the science of cooking in practical terms. I was fascinated, and I knew right then I wanted to be a chef.</p>
          </div>
        </div>

        <div class="entry">
          <div class="when"><span class="age">15</span>Backyard, Branson</div>
          <div>
            <h3>The mushroom that started it too</h3>
            <p>I walked into my backyard and saw a bright cherry-red mushroom with white spots — looked like candy sitting there. Too distinctive to be anything but <em>Amanita muscaria</em>. Everything online at the time said they don't grow in Missouri. I found occurrences logged on the nationwide mycological database anyway. That fascination with mushrooms never left.</p>
          </div>
        </div>

        <div class="entry">
          <div class="when"><span class="age">16</span>Thai Thai Cuisine</div>
          <div>
            <h3>The mango lesson</h3>
            <p>My first real kitchen job — dishwasher and busboy at an authentic Thai restaurant in Branson. I was asked to peel a box of mangos. "I'm done, Chef," I said, until he pulled the peels back out of the trash. "Look at all this meat wasted." He made me filet every scrap of flesh off the skins, then throw it all away anyway. Don't waste. Every detail matters in a professional kitchen.</p>
          </div>
        </div>

        <div class="entry">
          <div class="when"><span class="age">16–27</span>Line cook years</div>
          <div>
            <h3>The next ten years</h3>
            <p>The story of most line cooks — addiction, depression, and divorce riddled my life as I worked my way in and out of the complex, sweaty work of professional kitchens.</p>
          </div>
        </div>

        <div class="entry">
          <div class="when"><span class="age">27</span>Turning point</div>
          <div>
            <h3>Asked to run a kitchen</h3>
            <p>At my end and desperate for something, I knew I was made for more. About a year after deciding to pull my life together, I was asked to manage a kitchen. Me — just a good line cook? Soon I found myself pushing to be the very best I could with the food I made. Bordering on obsession. Okay — I became obsessed.</p>
            <p>I'd always been fascinated by nature and always interested in foraging. This is when I combined the two: learning to use what nature provides to the fullness of its depth. Both loves, one plate.</p>
          </div>
        </div>

        <div class="entry">
          <div class="when"><span class="age">28+</span>Mentorship &amp; degree</div>
          <div>
            <h3>Bulrush, and finishing what I started</h3>
            <p>I found a mentor in Rob Connoley of Bulrush in St. Louis — a restaurant built on Ozarks cuisine with contemporary technique and foraged, hunted ingredients. I went back and completed the culinary degree I'd started ten years earlier: classical French and contemporary technique, applied to wild foods.</p>
          </div>
        </div>
      </div>

      <p class="marginalia">"I have a wife and three wonderful sons, living in Springfield, MO. I don't think I will ever leave the Ozarks. It endlessly fascinates me with its biodiversity, and I hope to bring the flavors of the forest and field to people through fine dining and education."</p>

      <div class="duo">
        <figure>
          <img src="/images/plating-hands.jpg" alt="Chef Dyllan plating a farm dinner course">
          <figcaption>Plating a farm dinner, course by course, by hand</figcaption>
        </figure>
        <figure>
          <img src="/images/chef-portrait.jpg" alt="Chef Dyllan Dale, portrait">
          <figcaption>Chef Dyllan Dale — Springfield, MO</figcaption>
        </figure>
      </div>
    </div>
  </section>
</main>

<div class="colophon-block" id="book">
  <div class="wrap-narrow">
    <h2>Come Meet Dyllan at the Table</h2>
    <p class="sub">Farm dinners, private chef nights, and foraging walks — every date starts with a conversation.</p>
    <div class="contact-line">
      <a href="tel:14174039265">417-403-9265</a>
      <a href="mailto:dyllan@wildfoodsbydyllan.com">dyllan@wildfoodsbydyllan.com</a>
      <span>Springfield, MO — serving the Ozarks</span>
    </div>
  </div>
</div>

${FOOTER_HTML}`;

export function StoryPage() {
  useEffect(() => {
    document.title = "My Story — Wild Foods by Dyllan";
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />
    </>
  );
}
