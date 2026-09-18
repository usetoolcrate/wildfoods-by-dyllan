import { useEffect, useMemo, useState } from "react";
import {
  renderTopBar,
  renderPageBanner,
  FOOTER_HTML,
  SITE_STYLES,
} from "@/pages/site-shared";

type Recipe = {
  id: string;
  title: string;
  tag: string;
  time: string;
  teaser: string;
  ingredients: string[];
  steps: string[];
};

// Sample data — titles are real dishes from Chef Dyllan's recipe collection.
// Ingredients/steps below are placeholder scaffolding for the list/filter/print UI,
// not the chef's actual written recipes. Swap for the real recipe database later.
const RECIPES: Recipe[] = [
  {
    id: "pawpaw-honey-bread",
    title: "Pawpaw Honey Bread",
    tag: "Foraged Fruit",
    time: "1 hr 20 min",
    teaser:
      "Pawpaw season in the Ozarks is short and sweet — this loaf is one of the simplest ways to let the fruit's tropical flavor shine.",
    ingredients: [
      "2 cups ripe pawpaw pulp, seeded",
      "1/3 cup local honey",
      "2 cups all-purpose flour",
      "2 eggs",
      "1/2 cup neutral oil",
      "1 tsp baking soda, pinch of salt",
    ],
    steps: [
      "Purée pawpaw pulp and remove seeds/skins.",
      "Whisk eggs, honey, and oil, then fold in pawpaw purée.",
      "Combine dry ingredients, fold into wet mixture until just combined.",
      "Pour into a greased loaf pan, bake at 350°F for 55–60 minutes.",
      "Cool fully before slicing.",
    ],
  },
  {
    id: "pawpaw-jezebel-sauce",
    title: "Pawpaw Jezebel Sauce",
    tag: "Preserves",
    time: "30 min",
    teaser:
      "A wonderfully old-fashioned Southern condiment — sweet fruit, sharp mustard, fiery horseradish — reworked with native pawpaw standing in for the usual preserves.",
    ingredients: [
      "1 cup pawpaw purée",
      "1/4 cup prepared horseradish",
      "1/4 cup Dijon mustard",
      "2 tbsp apple cider vinegar",
      "2 tbsp brown sugar",
    ],
    steps: [
      "Whisk all ingredients together until smooth.",
      "Chill at least 1 hour before serving.",
      "Serve alongside smoked or roasted meats and sharp cheese.",
    ],
  },
  {
    id: "rose-hip-creme-brulee",
    title: "No-Bake Rose Hip Crème Brûlée",
    tag: "Foraged Fruit",
    time: "40 min + chill",
    teaser:
      "Wild rose hips bring a bright, tart-cranberry edge to a dairy-free, no-bake custard finished with a brûléed sugar top.",
    ingredients: [
      "1 cup wild rose hip purée, strained",
      "1 can full-fat coconut milk",
      "3 tbsp cornstarch",
      "1/3 cup sugar, plus extra for the brûlée top",
    ],
    steps: [
      "Whisk coconut milk, rose hip purée, sugar, and cornstarch in a saucepan.",
      "Cook over medium heat, whisking, until thickened.",
      "Divide into ramekins and chill at least 3 hours.",
      "Top with sugar and torch until caramelized just before serving.",
    ],
  },
  {
    id: "acorn-brioche",
    title: "Acorn Brioche Bread",
    tag: "Nuts & Seeds",
    time: "3 hr",
    teaser:
      "Acorns are harvested in fall and add a nutrient-rich note to baked goods — because acorn flour has no gluten, it's cut with regular AP flour to keep the crumb light.",
    ingredients: [
      "10% leached acorn flour / 90% all-purpose flour (by weight)",
      "2 eggs plus 1 for wash",
      "1/4 cup sugar",
      "2 1/4 tsp active dry yeast",
      "1/2 cup warm milk, 6 tbsp softened butter",
    ],
    steps: [
      "Bloom yeast in warm milk with a pinch of sugar.",
      "Combine flours, sugar, salt, eggs, and yeast mixture into a dough.",
      "Knead in butter gradually until smooth and elastic.",
      "Proof 1.5 hours, shape, proof again 45 minutes.",
      "Egg-wash and bake at 375°F for 25–30 minutes.",
    ],
  },
  {
    id: "acorn-pasta",
    title: "Acorn Pasta",
    tag: "Nuts & Seeds",
    time: "1 hr",
    teaser: "Acorn flour doesn't produce gluten, which makes this dough tricky — and worth getting right.",
    ingredients: ["1 cup 00 flour", "1/4 cup leached acorn flour", "3 eggs", "Pinch of salt"],
    steps: [
      "Mound flours on a work surface, crack eggs into the center.",
      "Work into a shaggy dough, then knead 8–10 minutes.",
      "Rest, wrapped, for 30 minutes before rolling.",
      "Roll thin and cut to your preferred shape.",
    ],
  },
  {
    id: "persimmon-cookies",
    title: "Persimmon Cookies",
    tag: "Foraged Fruit",
    time: "45 min",
    teaser: "Wild persimmons have an unusually long ripening window — worth the wait for a soft, spiced drop cookie.",
    ingredients: ["1 cup ripe persimmon pulp", "1 tsp baking soda", "1 3/4 cups flour", "1 cup sugar", "1/2 cup butter, softened", "1 tsp cinnamon"],
    steps: [
      "Cream butter and sugar, mix in persimmon pulp.",
      "Fold in dry ingredients until just combined.",
      "Drop by the spoonful onto a lined sheet.",
      "Bake at 350°F for 12–14 minutes.",
    ],
  },
  {
    id: "pawpaw-curd",
    title: "Pawpaw Curd",
    tag: "Foraged Fruit",
    time: "25 min",
    teaser: "A silky custard built around pawpaw purée — good on toast, tarts, or by the spoonful.",
    ingredients: ["1 cup pawpaw purée", "3 tbsp sugar or honey", "7 egg yolks", "2 tbsp cream cheese", "1 tbsp cinnamon"],
    steps: [
      "Combine all ingredients in a double boiler.",
      "Cook, whisking constantly, until thickened.",
      "Strain and chill before using.",
    ],
  },
  {
    id: "watercress-kimchi",
    title: "Watercress Kimchi",
    tag: "Fermentation & Pickling",
    time: "30 min + 3 days ferment",
    teaser: "Wild watercress, salted and packed with a classic kimchi paste, left to ferment on the counter.",
    ingredients: ["4 cups wild watercress", "2 tbsp sea salt", "3 tbsp gochugaru", "3 cloves garlic", "1 tbsp fish sauce or salted shrimp"],
    steps: [
      "Salt watercress and let sit 20 minutes, rinse and drain.",
      "Blend garlic, gochugaru, and fish sauce into a paste.",
      "Massage paste through the greens, pack into a jar.",
      "Ferment at room temperature 2–4 days, then refrigerate.",
    ],
  },
  {
    id: "spruce-tip-custard-tart",
    title: "Spruce Tip Custard Tart",
    tag: "Foraged Fruit",
    time: "1 hr 30 min",
    teaser: "Young spring spruce tips lend a bright, citrusy resin note to a simple baked custard tart.",
    ingredients: ["1 blind-baked tart shell", "1 cup cream", "3 egg yolks", "1/3 cup sugar", "2 tbsp finely chopped spruce tips"],
    steps: [
      "Infuse cream with spruce tips over low heat, strain.",
      "Whisk yolks and sugar, temper in warm cream.",
      "Pour into tart shell, bake at 325°F until just set, about 25 minutes.",
      "Cool fully before slicing.",
    ],
  },
  {
    id: "wild-garlic-capers",
    title: "Wild Garlic Capers",
    tag: "Preserves",
    time: "15 min + 1 week cure",
    teaser: "Unopened wild garlic seed pods, salt-cured and brined like true capers.",
    ingredients: ["1 cup wild garlic seed pods", "2 tbsp sea salt", "1/2 cup white wine vinegar", "1/2 cup water"],
    steps: [
      "Toss pods with salt, refrigerate 3 days, draining daily.",
      "Rinse, pack into a jar.",
      "Cover with vinegar and water, refrigerate at least 1 week before using.",
    ],
  },
  {
    id: "mulberry-horchata",
    title: "Mulberry Horchata",
    tag: "Foraged Fruit",
    time: "20 min + overnight soak",
    teaser: "Wild mulberries stir a deep purple color and berry sweetness into a classic rice-milk horchata.",
    ingredients: ["1 cup rice, soaked overnight", "2 cups fresh wild mulberries", "1 cinnamon stick", "1/3 cup sugar", "4 cups water"],
    steps: [
      "Blend soaked rice, mulberries, cinnamon, and water until smooth.",
      "Strain through cheesecloth.",
      "Stir in sugar, chill, and serve over ice.",
    ],
  },
  {
    id: "plum-jam",
    title: "Wild Plum Jam",
    tag: "Preserves",
    time: "45 min",
    teaser: "Small, tart Ozarks wild plums cooked down into a classic jam, no pectin needed.",
    ingredients: ["4 cups pitted wild plums", "2 cups sugar", "Juice of 1 lemon"],
    steps: [
      "Combine plums, sugar, and lemon juice in a heavy pot.",
      "Simmer, stirring often, until thickened, about 30 minutes.",
      "Jar hot and process, or refrigerate for short-term use.",
    ],
  },
];

const TAGS = ["All", ...Array.from(new Set(RECIPES.map((r) => r.tag)))];

function printRecipe(recipe: Recipe) {
  const win = window.open("", "_blank", "width=720,height=900");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${recipe.title} — Wild Foods by Dyllan</title>
        <style>
          body{font-family:Georgia,serif;color:#1f2e22;max-width:640px;margin:40px auto;padding:0 20px;}
          h1{font-size:28px;margin-bottom:4px;}
          .meta{font-family:'Courier New',monospace;font-size:12px;color:#3c4a3c;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.06em;}
          h2{font-size:16px;text-transform:uppercase;letter-spacing:0.08em;color:#a85a22;border-bottom:1px solid #c9bb9a;padding-bottom:6px;}
          ul,ol{padding-left:20px;}
          li{margin-bottom:8px;}
          .cols{display:flex;gap:36px;}
          .cols > div{flex:1;}
          footer{margin-top:36px;font-size:11px;color:#3c4a3c;font-family:'Courier New',monospace;}
        </style>
      </head>
      <body>
        <h1>${recipe.title}</h1>
        <div class="meta">${recipe.tag} · ${recipe.time}</div>
        <div class="cols">
          <div>
            <h2>Ingredients</h2>
            <ul>${recipe.ingredients.map((i) => `<li>${i}</li>`).join("")}</ul>
          </div>
          <div>
            <h2>Method</h2>
            <ol>${recipe.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
          </div>
        </div>
        <footer>Wild Foods by Dyllan — wildfoodsbydyllan.com — sample recipe card</footer>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

export function RecipesPage() {
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Recipes — Wild Foods by Dyllan";
  }, []);

  const filtered = useMemo(() => {
    return RECIPES.filter((r) => {
      const tagMatch = activeTag === "All" || r.tag === activeTag;
      const q = query.trim().toLowerCase();
      const queryMatch = !q || r.title.toLowerCase().includes(q) || r.teaser.toLowerCase().includes(q);
      return tagMatch && queryMatch;
    });
  }, [activeTag, query]);

  const openRecipe = openId ? RECIPES.find((r) => r.id === openId) ?? null : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SITE_STYLES }} />
      <div
        dangerouslySetInnerHTML={{
          __html: renderTopBar("/recipes"),
        }}
      />
      <div
        dangerouslySetInnerHTML={{
          __html: renderPageBanner({
            eyebrow: "Recipes",
            title: "Wild Recipes, Ozarks-Style",
            sub: "Foraged fruits, ferments, nuts, and preserves — searchable, filterable, and ready to print for the kitchen counter.",
          }),
        }}
      />

      <main>
        <section>
          <div className="wrap">
            <span className="sample-flag">
              Sample preview — real recipe write-ups &amp; photos import once the full database is connected
            </span>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
              <input
                className="recipe-search"
                type="text"
                placeholder="Search recipes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="chip-row">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  className={`chip${activeTag === tag ? " active" : ""}`}
                  onClick={() => setActiveTag(tag)}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="recipe-count">
              {filtered.length} recipe{filtered.length === 1 ? "" : "s"}
            </div>

            {openRecipe ? (
              <div className="recipe-detail" style={{ marginBottom: 40 }}>
                <button className="rd-close" onClick={() => setOpenId(null)} type="button">
                  &larr; Back to all recipes
                </button>
                <h2>{openRecipe.title}</h2>
                <div className="rd-meta">
                  <span>{openRecipe.tag}</span>
                  <span>{openRecipe.time}</span>
                </div>
                <div className="rd-cols">
                  <div>
                    <h4>Ingredients</h4>
                    <ul>
                      {openRecipe.ingredients.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Method</h4>
                    <ol>
                      {openRecipe.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div style={{ marginTop: 28 }}>
                  <button className="rc-print" onClick={() => printRecipe(openRecipe)} type="button">
                    Print This Recipe
                  </button>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="recipe-empty">No recipes match that search — try another word or filter.</div>
            ) : (
              <div className="recipe-grid">
                {filtered.map((r) => (
                  <div className="recipe-card" key={r.id}>
                    <div className="rc-tag">{r.tag}</div>
                    <h3>{r.title}</h3>
                    <div className="rc-meta">
                      <span>{r.time}</span>
                    </div>
                    <div className="rc-body">
                      <p>{r.teaser}</p>
                      <div className="rc-actions">
                        <button
                          type="button"
                          onClick={() => setOpenId(r.id)}
                          style={{
                            fontFamily: "'Special Elite', monospace",
                            fontSize: 11,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            background: "none",
                            border: "none",
                            color: "var(--rust-deep)",
                            cursor: "pointer",
                            padding: 0,
                            borderBottom: "1px solid var(--rust-deep)",
                          }}
                        >
                          View Recipe
                        </button>
                        <button className="rc-print" type="button" onClick={() => printRecipe(r)}>
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <div dangerouslySetInnerHTML={{ __html: FOOTER_HTML }} />
    </>
  );
}
