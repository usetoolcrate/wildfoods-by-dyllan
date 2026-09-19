import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureSchema, getSql } from "../_lib/db";
import { isAuthedRequest } from "../_lib/auth";

// One-time seed: loads the sample recipe set (real dish titles, placeholder
// ingredients/steps) as a starting point Dyllan can edit in place from the
// admin page, instead of starting from a blank list. Safe to call more than
// once — skips if recipes already exist.
const SAMPLE_RECIPES = [
  { title: "Pawpaw Honey Bread", tag: "Foraged Fruit", time: "1 hr 20 min", teaser: "Pawpaw season in the Ozarks is short and sweet — this loaf is one of the simplest ways to let the fruit's tropical flavor shine.", ingredients: ["2 cups ripe pawpaw pulp, seeded", "1/3 cup local honey", "2 cups all-purpose flour", "2 eggs", "1/2 cup neutral oil", "1 tsp baking soda, pinch of salt"], steps: ["Purée pawpaw pulp and remove seeds/skins.", "Whisk eggs, honey, and oil, then fold in pawpaw purée.", "Combine dry ingredients, fold into wet mixture until just combined.", "Pour into a greased loaf pan, bake at 350°F for 55–60 minutes.", "Cool fully before slicing."] },
  { title: "Pawpaw Jezebel Sauce", tag: "Preserves", time: "30 min", teaser: "A wonderfully old-fashioned Southern condiment — sweet fruit, sharp mustard, fiery horseradish — reworked with native pawpaw standing in for the usual preserves.", ingredients: ["1 cup pawpaw purée", "1/4 cup prepared horseradish", "1/4 cup Dijon mustard", "2 tbsp apple cider vinegar", "2 tbsp brown sugar"], steps: ["Whisk all ingredients together until smooth.", "Chill at least 1 hour before serving.", "Serve alongside smoked or roasted meats and sharp cheese."] },
  { title: "No-Bake Rose Hip Crème Brûlée", tag: "Foraged Fruit", time: "40 min + chill", teaser: "Wild rose hips bring a bright, tart-cranberry edge to a dairy-free, no-bake custard finished with a brûléed sugar top.", ingredients: ["1 cup wild rose hip purée, strained", "1 can full-fat coconut milk", "3 tbsp cornstarch", "1/3 cup sugar, plus extra for the brûlée top"], steps: ["Whisk coconut milk, rose hip purée, sugar, and cornstarch in a saucepan.", "Cook over medium heat, whisking, until thickened.", "Divide into ramekins and chill at least 3 hours.", "Top with sugar and torch until caramelized just before serving."] },
  { title: "Acorn Brioche Bread", tag: "Nuts & Seeds", time: "3 hr", teaser: "Acorns are harvested in fall and add a nutrient-rich note to baked goods — because acorn flour has no gluten, it's cut with regular AP flour to keep the crumb light.", ingredients: ["10% leached acorn flour / 90% all-purpose flour (by weight)", "2 eggs plus 1 for wash", "1/4 cup sugar", "2 1/4 tsp active dry yeast", "1/2 cup warm milk, 6 tbsp softened butter"], steps: ["Bloom yeast in warm milk with a pinch of sugar.", "Combine flours, sugar, salt, eggs, and yeast mixture into a dough.", "Knead in butter gradually until smooth and elastic.", "Proof 1.5 hours, shape, proof again 45 minutes.", "Egg-wash and bake at 375°F for 25–30 minutes."] },
  { title: "Acorn Pasta", tag: "Nuts & Seeds", time: "1 hr", teaser: "Acorn flour doesn't produce gluten, which makes this dough tricky — and worth getting right.", ingredients: ["1 cup 00 flour", "1/4 cup leached acorn flour", "3 eggs", "Pinch of salt"], steps: ["Mound flours on a work surface, crack eggs into the center.", "Work into a shaggy dough, then knead 8–10 minutes.", "Rest, wrapped, for 30 minutes before rolling.", "Roll thin and cut to your preferred shape."] },
  { title: "Persimmon Cookies", tag: "Foraged Fruit", time: "45 min", teaser: "Wild persimmons have an unusually long ripening window — worth the wait for a soft, spiced drop cookie.", ingredients: ["1 cup ripe persimmon pulp", "1 tsp baking soda", "1 3/4 cups flour", "1 cup sugar", "1/2 cup butter, softened", "1 tsp cinnamon"], steps: ["Cream butter and sugar, mix in persimmon pulp.", "Fold in dry ingredients until just combined.", "Drop by the spoonful onto a lined sheet.", "Bake at 350°F for 12–14 minutes."] },
  { title: "Pawpaw Curd", tag: "Foraged Fruit", time: "25 min", teaser: "A silky custard built around pawpaw purée — good on toast, tarts, or by the spoonful.", ingredients: ["1 cup pawpaw purée", "3 tbsp sugar or honey", "7 egg yolks", "2 tbsp cream cheese", "1 tbsp cinnamon"], steps: ["Combine all ingredients in a double boiler.", "Cook, whisking constantly, until thickened.", "Strain and chill before using."] },
  { title: "Watercress Kimchi", tag: "Fermentation & Pickling", time: "30 min + 3 days ferment", teaser: "Wild watercress, salted and packed with a classic kimchi paste, left to ferment on the counter.", ingredients: ["4 cups wild watercress", "2 tbsp sea salt", "3 tbsp gochugaru", "3 cloves garlic", "1 tbsp fish sauce or salted shrimp"], steps: ["Salt watercress and let sit 20 minutes, rinse and drain.", "Blend garlic, gochugaru, and fish sauce into a paste.", "Massage paste through the greens, pack into a jar.", "Ferment at room temperature 2–4 days, then refrigerate."] },
  { title: "Spruce Tip Custard Tart", tag: "Foraged Fruit", time: "1 hr 30 min", teaser: "Young spring spruce tips lend a bright, citrusy resin note to a simple baked custard tart.", ingredients: ["1 blind-baked tart shell", "1 cup cream", "3 egg yolks", "1/3 cup sugar", "2 tbsp finely chopped spruce tips"], steps: ["Infuse cream with spruce tips over low heat, strain.", "Whisk yolks and sugar, temper in warm cream.", "Pour into tart shell, bake at 325°F until just set, about 25 minutes.", "Cool fully before slicing."] },
  { title: "Wild Garlic Capers", tag: "Preserves", time: "15 min + 1 week cure", teaser: "Unopened wild garlic seed pods, salt-cured and brined like true capers.", ingredients: ["1 cup wild garlic seed pods", "2 tbsp sea salt", "1/2 cup white wine vinegar", "1/2 cup water"], steps: ["Toss pods with salt, refrigerate 3 days, draining daily.", "Rinse, pack into a jar.", "Cover with vinegar and water, refrigerate at least 1 week before using."] },
  { title: "Mulberry Horchata", tag: "Foraged Fruit", time: "20 min + overnight soak", teaser: "Wild mulberries stir a deep purple color and berry sweetness into a classic rice-milk horchata.", ingredients: ["1 cup rice, soaked overnight", "2 cups fresh wild mulberries", "1 cinnamon stick", "1/3 cup sugar", "4 cups water"], steps: ["Blend soaked rice, mulberries, cinnamon, and water until smooth.", "Strain through cheesecloth.", "Stir in sugar, chill, and serve over ice."] },
  { title: "Wild Plum Jam", tag: "Preserves", time: "45 min", teaser: "Small, tart Ozarks wild plums cooked down into a classic jam, no pectin needed.", ingredients: ["4 cups pitted wild plums", "2 cups sugar", "Juice of 1 lemon"], steps: ["Combine plums, sugar, and lemon juice in a heavy pot.", "Simmer, stirring often, until thickened, about 30 minutes.", "Jar hot and process, or refrigerate for short-term use."] },
];

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isAuthedRequest(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    await ensureSchema();
    const sql = getSql();
    const existing = await sql`SELECT count(*)::int AS n FROM recipes`;
    if (existing[0].n > 0) {
      res.status(200).json({ ok: true, seeded: false, message: "Recipes already exist, skipped seeding." });
      return;
    }
    for (const r of SAMPLE_RECIPES) {
      const slug = slugify(r.title);
      await sql`
        INSERT INTO recipes (slug, title, tag, time, teaser, ingredients, steps, published)
        VALUES (${slug}, ${r.title}, ${r.tag}, ${r.time}, ${r.teaser}, ${JSON.stringify(r.ingredients)}::jsonb, ${JSON.stringify(r.steps)}::jsonb, true)
        ON CONFLICT (slug) DO NOTHING
      `;
    }
    res.status(200).json({ ok: true, seeded: true, count: SAMPLE_RECIPES.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
