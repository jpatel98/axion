# Axion Technologies Landing Page

Single-page marketing site for `axiontechnologies.ca`, built with Next.js, React, TypeScript, and Tailwind CSS.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
cp .env.example .env.local
```

3. Update the booking URL, GA4 ID, and lead webhook values.

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deploy

Recommended target: Vercel.

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. Import the project into Vercel.
3. Configure the same environment variables from `.env.example`.
4. Deploy.

Local production check:

```bash
npm run build
npm run start
```

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical site URL
- `NEXT_PUBLIC_BOOKING_URL`: external scheduler link used by primary CTAs
- `NEXT_PUBLIC_CONTACT_EMAIL`: public contact email
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: GA4 measurement ID
- `LEAD_WEBHOOK_URL`: webhook endpoint that receives contact form submissions
- `LEAD_WEBHOOK_SECRET`: optional secret sent as `x-axion-webhook-secret`

## Where to edit copy

- Main landing-page copy and section structure: `src/content/site.ts`
- Contact and SEO defaults: `src/lib/site-config.ts`

## Where to change branding and design

- Fonts, colors, global theme tokens, and background treatment: `src/app/globals.css`
- Metadata and font loading: `src/app/layout.tsx`
- Social sharing image: `src/app/opengraph-image.tsx`
- Hero visual treatment: `src/components/landing/systems-visual.tsx`

## Tracking and lead flow

- GA4 script loading and page-level metadata live in `src/app/layout.tsx`
- Client-side CTA and form event helpers live in `src/lib/analytics.ts`
- Contact form client flow lives in `src/components/contact-form.tsx`
- Server-side webhook delivery lives in `src/app/api/leads/route.ts`

## Notes

- Primary conversion is booking-first. If `NEXT_PUBLIC_BOOKING_URL` is not updated, CTAs will point to the placeholder scheduler URL from `.env.example`.
- The contact form now submits to the configured webhook endpoint and falls back to booking/email if the webhook is unavailable.
- The site remains a single-page homepage with anchored sections for services, results, process, FAQ, and contact.
