# ScamRadar Prelaunch Checklist

## Implemented in code
- URL + image scam analysis pipeline with structured risk scoring.
- Marketplace-aware inspection for major listing platforms.
- API hardening:
  - Rate limiting by client IP.
  - Request/body size limits.
  - URL safety checks (SSRF protections).
  - Non-cacheable API responses.
- Production metadata:
  - Open Graph / Twitter metadata.
  - `robots.txt` and `sitemap.xml`.
- Legal pages:
  - `/privacy`
  - `/terms`
- Optional analytics integration:
  - Google Analytics (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
  - Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`)
- Security headers via `next.config.js`.

## Must do before ad traffic
1. Set real production env values in deployment platform:
   - `NEXT_PUBLIC_APP_URL`
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID_SINGLE`
   - `STRIPE_PRICE_ID_MONTHLY`
   - `STRIPE_PRICE_ID_YEARLY`
   - `STRIPE_PRICE_ID_FLASH`
2. Set up Stripe production prices and verify checkout success/cancel URLs.
3. Configure your custom domain + HTTPS and verify DNS propagation.
4. Add your support email and company/contact details inside legal pages.
5. Add analytics IDs and verify real-time events after deploy.
6. Run manual smoke tests on:
   - iOS Safari
   - Android Chrome
   - Desktop Chrome/Safari/Firefox
7. Submit domain to Google Search Console and verify `sitemap.xml`.

## Recommended after launch
- Add webhook-based Stripe subscription state syncing.
- Add server-side persisted user history (instead of only localStorage).
- Add abuse monitoring alerts for unusual API spikes.
