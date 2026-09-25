# Wild Foods by Dyllan

Website for Wild Foods by Dyllan (Chef Dyllan Dale, Springfield MO). A Vite + React
single-page site, deployed on Vercel, with a small serverless backend.

Live preview: https://wildfoods-by-dyllan.vercel.app (the real domain,
wildfoodsbydyllan.com, still points at the old WordPress site).

## Layout

- `src/routes.tsx` — every page route.
- `src/pages/` — pages. Public pages are HTML strings styled by `SITE_STYLES` in
  `src/pages/site-shared.ts`; `PublicLandingPage.tsx` is the home page.
- `src/pages/site/AdminRecipesPage.tsx` — Dyllan's recipe editor at `/admin/recipes`.
- `src/pages/site/QuestionsPage.tsx` and `AdminQuestionsPage.tsx` — the scoping
  questionnaire at `/questions` and its answers at `/admin/questions`.
- `api/` — Vercel serverless functions: recipes CRUD, admin login and uploads,
  questionnaire answers. Shared code in `api/_lib/` (Neon client, admin session).
- Fonts (Cormorant Garamond, Special Elite) load from Google Fonts in `index.html`.

## Services

- **Neon Postgres** (`DATABASE_URL`): recipes and questionnaire answers.
- **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`): recipe photos.
- `ADMIN_PASSWORD` / `SESSION_SECRET`: the `/admin/*` login.

See `.env.example`. All are set in the Vercel project `wildfoods-by-dyllan`
(team `aschottkys-projects`).

## Develop and deploy

```bash
bun install          # or: npx bun install
bun run dev          # front end only; /api needs `vercel dev`
bun run build        # type-check + production build
vercel deploy --prod --scope aschottkys-projects
```

Vercel installs with bun (`bun.lock`). Deploys are made with the CLI; pushing to
GitHub does not deploy.
