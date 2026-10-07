# Another Level — Pizzeria & Fast Food, Sarandë

Multilingual (Shqip / English / Italiano) restaurant site with online ordering via [Resend](https://resend.com).

- `/` Albanian · `/en/` English · `/it/` Italian — each page is pre-rendered for SEO; switching language in the UI is instant (no reload).
- Orders are re-priced on the server from `src/content/menu.mjs` and e-mailed to `ORDER_TO_EMAIL`.

## Run locally

```bash
npm install
cp .env.example .env   # add RESEND_API_KEY and ORDER_TO_EMAIL
npm run dev            # build + start → http://localhost:3000
```

## Edit content

| What | Where |
| --- | --- |
| Phone, hours, address, social links | `src/content/site.mjs` |
| Menu items, prices, ingredients | `src/content/menu.mjs` |
| All interface text (AL / EN / IT) | `src/content/i18n.mjs` |
| Photos | put originals in `photos-original/`, then `npm run images` |

Run `npm run build` after any change.

## Deploy on Railway

1. Push this folder to a GitHub repo and create a Railway service from it (or run `railway up`).
2. Add the variables: `RESEND_API_KEY`, `RESEND_FROM`, `ORDER_TO_EMAIL`, `NODE_ENV=production` (and `SITE_URL` once a custom domain is attached).
3. `railway.json` already sets the build (`npm run build`), the start command and the `/health` health check.
