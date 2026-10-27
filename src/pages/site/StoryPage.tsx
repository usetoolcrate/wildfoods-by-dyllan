import { V2Page, Html, renderHeader, renderFooter, renderPageHero, renderBook } from "@/pages/v2";

const ENTRIES: { age: string; place: string; title: string; body: string[] }[] = [
  {
    age: "Roots",
    place: "The early years",
    title: "A childhood rooted in the Ozarks",
    body: [
      "My connection to the natural world began long before I ever stepped into a professional kitchen.",
      "Growing up in the Ozarks, I was surrounded by one of the most biologically diverse regions in North America. I spent countless hours outdoors, fascinated by the smallest details of the world around me. From moss growing along the bark of a tree to the lizards, insects, and salamanders beneath fallen logs, I wanted to understand everything.",
      "Those early experiences shaped the way I see the natural world. I developed a deep respect for the complexity of our ecosystems and an understanding that humans are not separate from nature, but part of it. That connection would eventually become the foundation of my approach to food.",
    ],
  },
  {
    age: "11",
    place: "The inspiration",
    title: "Good Eats: the art and science of cooking",
    body: [
      "One afternoon, I came home from school to an empty house and turned on our small 14-inch television. Alton Brown’s <em>Good Eats</em> was playing.",
      "I was captivated by the way he explained cooking through science, technique, and an understanding of ingredients. Food suddenly became more than something we ate. It was something to study, understand, and create with intention.",
      "That afternoon, at eleven years old, I knew I wanted to become a chef.",
    ],
  },
  {
    age: "15",
    place: "A growing curiosity",
    title: "The mushroom that changed everything",
    body: [
      "At fifteen, I discovered a striking red mushroom with white spots growing in my backyard in Branson, Missouri. It appeared to be <em>Amanita muscaria</em>, a species I had read was not found in Missouri. Curious, I began researching further and eventually discovered documented occurrences in a national mycological database.",
      "That discovery opened the door to an entirely new understanding of the landscape I had grown up exploring. Mushrooms became more than a curiosity. They introduced me to the remarkable relationships between fungi, plants, trees, soil, and the ecosystems that support them.",
      "It was the beginning of a lifelong interest in mycology and, eventually, the wild ingredients that would help define my cooking.",
    ],
  },
  {
    age: "16",
    place: "The first kitchen",
    title: "Thai Thai Cuisine: learning to respect ingredients",
    body: [
      "My first professional kitchen experience began at Thai Thai Cuisine, an authentic Thai restaurant in Branson, where I worked as a dishwasher and busboy.",
      "One day, I was given a box of mangoes to peel. After finishing, I proudly told the chef I was done. He pulled the discarded peels from the trash and showed me how much usable fruit remained attached to them. He instructed me to carefully remove every remaining piece of flesh, only to have me discard it afterward.",
      "The lesson was never really about mangoes. It was about respecting ingredients, minimizing waste, and understanding that even the smallest details matter in a professional kitchen.",
      "That philosophy remains central to how I cook today. Whether an ingredient comes from a local farm or the forest floor, it deserves to be treated with care, purpose, and respect.",
    ],
  },
  {
    age: "16–27",
    place: "The foundation",
    title: "A decade in professional kitchens",
    body: [
      "For the next decade, I worked my way through professional kitchens, developing the discipline, technical ability, and resilience that the culinary profession demands.",
      "Those years were not without personal challenges. Addiction, depression, and divorce became part of my story as I navigated the intensity of kitchen life and the difficulties of finding direction outside of it.",
      "But those years also gave me an invaluable foundation. I learned the realities of professional cooking, the importance of consistency, and the dedication required to become truly proficient in a craft. Most importantly, I began to understand that being a chef could mean something greater than simply preparing good food.",
    ],
  },
  {
    age: "27",
    place: "A new direction",
    title: "Finding purpose through food",
    body: [
      "At twenty-seven, after making the decision to rebuild my life, I was offered the opportunity to manage a kitchen. Until then, I had considered myself a capable line cook. Leadership challenged me to think differently about food, technique, responsibility, and what I wanted to accomplish as a chef.",
      "I became deeply committed to improving my craft, studying ingredients, refining techniques, and developing a culinary identity of my own. At the same time, my lifelong fascination with the natural world was becoming increasingly connected to my work.",
      "I began exploring how the wild foods of the Ozarks could become part of a thoughtful, contemporary culinary experience. Mushrooms, native fruits, wild herbs, seasonal plants, and ingredients grown by local farmers offered an opportunity to create food that was both deeply regional and technically refined.",
      "For the first time, my two greatest interests came together. The landscape I had spent my childhood exploring became the foundation of my culinary philosophy.",
    ],
  },
  {
    age: "28+",
    place: "Education &amp; mentorship",
    title: "Refining a regional culinary identity",
    body: [
      "As my career developed, I sought opportunities to deepen my understanding of regional cuisine and contemporary cooking techniques.",
      "I found an important mentor in Chef Rob Connoley of Bulrush in St. Louis, whose work centered on interpreting Ozarks food traditions through contemporary technique, historical research, and locally sourced, foraged, and hunted ingredients. His approach reinforced something I had come to believe: the Ozarks possesses a culinary identity worthy of the same attention and respect given to any celebrated food region.",
      "I also attended culinary school, continuing to develop the technical foundation needed to translate that philosophy into my own cooking. During this chapter of my life, I began building a family and eventually established Wild Foods by Dyllan, bringing my experience, education, and connection to the Ozarks into private dining.",
    ],
  },
  {
    age: "Today",
    place: "Wild Foods by Dyllan",
    title: "Taking the Ozarks from farm and forest to table",
    body: [
      "Today, my work takes me across the Ozarks as a private chef, creating thoughtful, seasonal dining experiences in private homes, on beautiful properties, and in some of the region’s most remarkable settings.",
      "I also partner with vineyards, family farms, ranches, and venues throughout the Ozarks to host a limited number of pop-up dinners. These collaborations allow me to bring people closer to the farmers, producers, landscapes, and ingredients that make our region unique.",
      "Beyond the table, education has become an important part of my work. I teach classes and lead experiences focused on foraging, wild foods, cooking, fermentation, and the culinary traditions of the Ozarks. Through schools, organizations, and community partnerships, I have the opportunity to share the knowledge I’ve spent much of my life developing.",
      "My cooking remains rooted in a commitment to local agriculture, seasonal ingredients, responsible foraging, and preparing food from scratch. I work directly with local farmers and producers, source from locally owned businesses, and build menus around the ingredients available throughout our region.",
      "Whether I’m preparing an intimate private dinner, collaborating with a local farm on a seasonal event, or teaching someone to recognize the edible plants growing around them, the purpose remains the same: to strengthen the connection between people, food, and the land that sustains us.",
      "I believe the Ozarks deserves to be recognized for its remarkable agricultural diversity, wild abundance, and distinct culinary identity. My work is dedicated to helping bring that identity to the table while supporting the farmers, communities, and ecosystems that make it possible.",
    ],
  },
];

const BODY = `${renderHeader("/story")}

${renderPageHero({
  label: "Our story",
  title: "Never fit indoors",
  sub: "The journey from a childhood spent exploring the Ozarks to a chef devoted to the land, its ingredients, and the people who call it home.",
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
    <blockquote class="big-quote">“What began as a childhood spent turning over rocks and studying the natural world has become a career that takes me across the very landscape I grew up exploring. I never fit indoors. And in many ways, that is exactly what made me the chef I am today.”<cite>Chef Dyllan Dale</cite></blockquote>
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
