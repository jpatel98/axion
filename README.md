# Axion Technologies Landing Page

Single-page marketing site for `axiontechnologies.ca`, built with Next.js, React, TypeScript, and Tailwind CSS.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Deploy

Recommended target: Vercel.

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. Import the project into Vercel.
3. Configure the environment variables below.
4. Deploy.

Local production check:

```bash
npm run build
npm run start
```

## Environment variables

Copy `.env.example` to `.env.local` and update values as needed.

- `NEXT_PUBLIC_SITE_URL`: canonical site URL
- `NEXT_PUBLIC_BOOKING_URL`: consultation booking link
- `NEXT_PUBLIC_CONTACT_EMAIL`: public contact email

## Where to edit copy

- Main landing-page copy: `src/content/site.ts`
- Contact/SEO config defaults: `src/lib/site-config.ts`

## Where to change branding and design

- Fonts, colors, global theme tokens, and background treatment: `src/app/globals.css`
- Metadata and font loading: `src/app/layout.tsx`
- Social sharing image: `src/app/opengraph-image.tsx`
- Hero systems visual: `src/components/landing/systems-visual.tsx`

## Notes

- The contact form is production-ready in UI and validation but intentionally stops at a non-live submission boundary. Wire `src/lib/lead.ts` into your server action, email provider, or CRM when ready.
- The site is built as a single-page homepage with anchored sections for services, solutions, process, FAQ, and contact.
