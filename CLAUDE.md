@AGENTS.md

# Axion Technologies - Codebase Guide

Single-page marketing site for [axiontechnologies.ca](https://axiontechnologies.ca) — a consulting firm for websites, automation, and AI systems.

## Tech Stack

- **Next.js 16.2.1** (App Router) / **React 19** / **TypeScript 5** (strict)
- **Tailwind CSS 4** via `@tailwindcss/postcss` — design tokens as CSS custom properties in `globals.css`
- **Framer Motion** for scroll-reveal animations
- **Google Analytics 4** (optional, via `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- No database, no ORM, no auth

## Commands

```bash
npm run dev        # Dev server on :3000
npm run build      # Production build
npm run start      # Run production build
npm run lint       # ESLint (flat config, Next.js vitals + TS rules)
npm run typecheck  # tsc --noEmit
```

Always run `lint` and `typecheck` before considering work complete.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout: fonts, GA4, metadata
│   ├── page.tsx              # Homepage — assembles all sections
│   ├── globals.css           # CSS tokens, global styles, animations
│   ├── api/leads/route.ts    # POST /api/leads — webhook delivery
│   ├── opengraph-image.tsx   # Dynamic OG image (1200x630)
│   ├── robots.ts / sitemap.ts
│   └── favicon.ico
├── components/
│   ├── contact-form.tsx      # Lead capture form + validation + GA4 tracking
│   └── landing/              # All landing page sections + primitives
│       ├── site-header.tsx   # Nav + sticky mobile CTA
│       ├── hero-section.tsx
│       ├── credibility-strip.tsx
│       ├── proof-section.tsx
│       ├── services-section.tsx
│       ├── why-axion-section.tsx
│       ├── process-section.tsx
│       ├── faq-section.tsx
│       ├── cta-section.tsx
│       ├── site-footer.tsx
│       ├── reveal.tsx            # Scroll-triggered fade-in wrapper
│       ├── link-button.tsx       # Styled link with booking analytics
│       ├── section-heading.tsx   # Consistent heading pattern
│       ├── section-shell.tsx     # Section layout primitives
│       └── systems-visual.tsx    # Hero SVG animation
├── content/
│   └── site.ts               # ALL copywriting lives here (single source of truth)
└── lib/
    ├── site-config.ts         # Env-driven config (URLs, GA ID, meta)
    ├── lead.ts                # Form types, validation, client submission
    ├── analytics.ts           # GA4 event helpers
    └── utils.ts               # cn() = clsx + tailwind-merge
```

## Key Conventions

### Content is centralized
All page copy lives in `src/content/site.ts` as a single `siteContent` const object. Never hardcode text in components — update `site.ts` instead.

### Configuration is env-driven
`src/lib/site-config.ts` reads env vars with sensible defaults. Key variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL | `https://axiontechnologies.ca` |
| `NEXT_PUBLIC_BOOKING_URL` | Calendar CTA link | placeholder |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Fallback email | `hello@axiontechnologies.ca` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 tracking | empty (GA disabled) |
| `LEAD_WEBHOOK_URL` | Server-side webhook for form | none |
| `LEAD_WEBHOOK_SECRET` | Webhook auth header | none |

### Component patterns
- **`SectionShell` + `SectionInner`**: Layout primitives wrapping every section
- **`Reveal`**: Framer Motion wrapper for scroll animations (respects `prefers-reduced-motion`)
- **`ButtonLink`**: Styled anchor with `variant="primary|secondary"` and optional booking analytics
- **`SectionHeading`**: Consistent eyebrow + title + description pattern

### Styling
- Tailwind 4 with CSS custom properties defined in `:root` of `globals.css`
- Color palette: dark blue background (`#070b12`), light foreground (`#f5f7ff`), cyan accent (`#7dd3fc`)
- Three fonts: Manrope (body), Instrument Serif (display), IBM Plex Mono (mono)
- Mobile-first responsive design using Tailwind breakpoints (`sm:`, `lg:`, etc.)

### Form flow
1. Client validates in `contact-form.tsx` using rules from `lib/lead.ts`
2. POSTs to `/api/leads` which re-validates server-side
3. API route forwards to external webhook (if configured)
4. Fallback to email/booking link on failure

### Analytics
- `trackEvent()`, `trackBookingClick()`, `trackFormStart()`, etc. in `lib/analytics.ts`
- Event names use `snake_case` (e.g. `contact_form_submit_success`)
- GA4 script only loads when measurement ID is set

### Path alias
`@/*` maps to `./src/*` — use `@/components/...`, `@/lib/...`, etc.

## Architecture Decisions

- **Single page**: All content on `/` with anchor nav — optimized for conversion
- **Webhook model**: Form submits to external endpoint, not a database — flexible integration
- **No dark mode toggle**: Always dark theme
- **No images**: Hero uses SVG component (`systems-visual.tsx`), no image optimization needed

## Common Tasks

| Task | Where to edit |
|------|--------------|
| Change copy | `src/content/site.ts` |
| Change colors/tokens | `src/app/globals.css` `:root` |
| Change URLs/config | `src/lib/site-config.ts` or env vars |
| Add a section | New component in `components/landing/`, import in `page.tsx`, add copy to `site.ts` |
| Add form field | Type in `lib/lead.ts`, validation in same file, UI in `contact-form.tsx` |
| Add analytics event | Use helpers in `lib/analytics.ts` |
