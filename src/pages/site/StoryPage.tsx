import { V2Page, Html, renderHeader, renderFooter, renderPageHero, renderBook } from "@/pages/v2";

const ENTRIES: { age: string; place: string; title: string; body: string[] }[] = [
  {
    age: "10",
    place: "Branson, MO",
    title: "Never fit indoors",
    body: [
      "I can remember being completely fascinated by nature ever since I was young — every intricate part, from the moss on a tree to the lizard under a log. Growing up in the Ozarks, surrounded by that kind of diversity, I spent every hour I could flipping logs and rocks to look at everything that crawled and moved.",
      "When I was ten, I caught and skinned my first copperhead to give to a friend the snake had bitten a few days prior. I've never feared nature since — I respect it, know the danger it presents, and know I can be part of it without fearing it.",
    ],
  },
  {
    age: "11",
    place: "Good Eats",
    title: "The show that started it",
    body: [
      "I came home from school one day to an empty house and a small 14-inch TV. “Good Eats,” with Alton Brown, was on — breaking down the science of cooking in practical terms. I was fascinated, and I knew right then I wanted to be a chef.",
    ],
  },
  {
    age: "15",
    place: "Backyard, Branson",
    title: "The mushroom that started it too",
    body: [
      "I walked into my backyard and saw a bright cherry-red mushroom with white spots — looked like candy sitting there. Too distinctive to be anything but <em>Amanita muscaria</em>. Everything online at the time said they don't grow in Missouri. I found occurrences logged on the nationwide mycological database anyway. That fascination with mushrooms never left.",
    ],
  },
  {
    age: "16",
    place: "Thai Thai Cuisine",
    title: "The mango lesson",
    body: [
      "My first real kitchen job — dishwasher and busboy at an authentic Thai restaurant in Branson. I was asked to peel a box of mangos. “I'm done, Chef,” I said, until he pulled the peels back out of the trash. “Look at all this meat wasted.” He made me filet every scrap of flesh off the skins, then throw it all away anyway. Don't waste. Every detail matters in a professional kitchen.",
    ],
  },
  {
    age: "16–27",
    place: "Line cook years",
    title: "The next ten years",
    body: [
      "The story of most line cooks — addiction, depression, and divorce riddled my life as I worked my way in and out of the complex, sweaty work of professional kitchens.",
    ],
  },
  {
    age: "27",
    place: "Turning point",
    title: "Asked to run a kitchen",
    body: [
      "At my end and desperate for something, I knew I was made for more. About a year after deciding to pull my life together, I was asked to manage a kitchen. Me — just a good line cook? Soon I found myself pushing to be the very best I could with the food I made. Bordering on obsession. Okay — I became obsessed.",
      "I'd always been fascinated by nature and always interested in foraging. This is when I combined the two: learning to use what nature provides to the fullness of its depth. Both loves, one plate.",
    ],
  },
  {
    age: "28+",
    place: "Mentorship &amp; culinary school",
    title: "Bulrush, culinary school, and a family",
    body: [
      "I found a mentor in Rob Connoley of Bulrush in St. Louis — a restaurant built on Ozarks cuisine with contemporary technique and foraged, hunted ingredients. I attended culinary school before starting a family and launching Wild Foods by Dyllan as a private chef in the Ozarks.",
    ],
  },
];

const BODY = `${renderHeader("/story")}

${renderPageHero({
  label: "Our story",
  title: "My story",
  sub: "How a kid from the Ozarks countryside became the chef behind farm-to-table dinners — with a forager's eye on every plate.",
  image: { src: "/images/g-before-service.jpg", alt: "Dyllan in the kitchen, the calm before service at Wild Arts Learning Center", position: "center 30%" },
})}

<section class="sec s-white">
  <div class="c narrow">
    <div class="tl">
      ${ENTRIES.map(
        (e) => `<div class="tl-e">
        <div><div class="tl-age">${e.age}</div><span class="tl-place">${e.place}</span></div>
        <div><h3>${e.title}</h3>${e.body.map((p) => `<p>${p}</p>`).join("")}</div>
      </div>`
      ).join("\n      ")}
    </div>
  </div>
</section>

<section class="sec s-sand">
  <div class="c">
    <blockquote class="big-quote">“I have a wife and five wonderful kids, living in Seymour, MO. I don't think I will ever leave the Ozarks. It endlessly fascinates me with its biodiversity, and I hope to bring the flavors of the forest and field to people through fine dining and education.”<cite>Chef Dyllan Dale</cite></blockquote>
  </div>
</section>

<section class="sec s-paper">
  <div class="c pair">
    <figure>
      <img src="/images/g-brigade-bw.jpg" alt="Dyllan and his kitchen crew plating a row of bowls, in black and white">
      <figcaption>Plating a dinner service</figcaption>
    </figure>
    <figure>
      <img src="/images/duo-family.webp" alt="Dyllan, his wife, and their newborn son" style="object-position:center 30%;">
      <figcaption>Dyllan and family</figcaption>
    </figure>
  </div>
</section>

${renderBook({ title: "Come meet Dyllan at the table.", sub: "Farm dinners, private chef nights, and foraging walks — every date starts with a conversation." })}
${renderFooter()}`;

export function StoryPage() {
  return (
    <V2Page title="My Story — Wild Foods by Dyllan">
      <Html html={BODY} />
    </V2Page>
  );
}
