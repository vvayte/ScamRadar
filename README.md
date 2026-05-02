# ScamRadar

AI-assisted scam screening for messages, links, and listing screenshots.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Prisma (Neon in production)
- **AI**: OpenAI (GPT-4o family, vision-capable)
- **Payments**: Stripe (multi-currency: USD / EUR / GBP)
- **Auth**: bcryptjs sessions, optional email verification
- **i18n**: built-in EN / RU toggle (`lib/i18n.tsx`)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
4. Apply database migrations to your Postgres database:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
   For local schema iteration use `npx prisma migrate dev` instead.
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for the full list. Highlights:

- `DATABASE_URL` — Postgres connection string (Neon / Supabase / RDS).
- `OPENAI_API_KEY` — required at runtime; the client is constructed lazily so a missing key won't crash the build.
- Stripe keys come in **three currencies** (USD, EUR, GBP) for each plan. EU customers automatically get EUR pricing, UK gets GBP, everyone else falls back to USD. Set the `STRIPE_PRICE_ID_*_EUR` / `_GBP` vars after creating the matching prices in your Stripe dashboard at the same numeric value (e.g. `4.99` USD / EUR / GBP).
- `IP_HASH_SALT` — long random string. Used to hash client IPs for free-check abuse prevention; **must be set in production**.
- `STRIPE_WEBHOOK_SECRET` — required for `/api/stripe/webhook`. Configure a Stripe webhook to send `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`.

Never commit `.env.local` or any file with real secrets.

## Project Layout

- `app/page.tsx` — public landing (minimal, animated demo card).
- `app/login`, `app/signup` — standalone auth pages with EN/RU toggle.
- `app/dashboard/*` — gated workspace: checker, history, watchlist, billing, settings.
- `app/api/check` — main analysis endpoint. Uses `canRunCheckStrict` to enforce the per-IP + per-account free-check limit so creating a new account on the same IP doesn't reset the allowance.
- `app/api/checkout/session` — creates a Stripe Checkout session in the visitor's currency.
- `lib/billing.ts` — currency detection (`cf-ipcountry` / `x-vercel-ip-country`) + Stripe price lookup.
- `lib/usage.ts` — anonymous + IP fingerprint usage merge on signup/login.
- `lib/i18n.tsx` — translation context + `<LanguageToggle />` component.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run vitest |

## Deploy

1. Provision a Postgres database, set `DATABASE_URL` in your hosting environment.
2. Run `npx prisma migrate deploy` against the production DB (Vercel: add a build step).
3. Create the matching Stripe products + prices in USD, EUR, and GBP and set the corresponding env vars.
4. Configure the Stripe webhook → `https://yourdomain/api/stripe/webhook` and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Set a strong random `IP_HASH_SALT`.
6. Deploy.

## License

MIT
