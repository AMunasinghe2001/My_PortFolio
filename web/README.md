# Portfolio — Next.js (Liquid Glass UI)

The Next.js rewrite of the portfolio front end, replacing the Create React App
version in [`../frontend`](../frontend). Same backend, same admin features, new
UI and routing.

## Getting started

```bash
cd web
npm install
cp .env.example .env.local   # required for local dev — see below
npm run dev                  # http://localhost:3000
```

The backend is unchanged — run it separately from [`../Backend`](../Backend):

```bash
cd Backend
npm run dev                  # http://localhost:5000
```

> **`.env.local` is not optional for local development.** Without it,
> `NEXT_PUBLIC_API_URL` falls back to the *deployed* backend, which rejects
> `localhost` origins with a CORS error and leaves every section showing its
> hardcoded fallback data instead of your real content.
>
> Next.js reads env files only at startup — restart the dev server after
> changing one.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL. Defaults to the deployed backend. |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS service for the Hire Me form. |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS template. |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public key. |

All four have working defaults baked in, so the app runs without a `.env.local`.
Set them in Vercel for production.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (also type/lint-validates) |
| `npm start` | Serve the production build |

## Structure

```text
src/
  app/                    App Router routes
    page.js               public single-page portfolio
    layout.js             root layout, fonts, metadata, ambient background
    globals.css           design tokens + glass primitives  ← start here
    login/                admin login
    admin/                token-guarded admin area
      layout.js           route guard + admin chrome
      profile|projects|skills|journey|services|account/
  components/             public section components (+ CSS modules)
    admin/                shared admin UI (nav, panels, project form)
  lib/                    api client, auth context, profile cache, hooks
```

## The design system

Everything visual is driven by the tokens at the top of
[`src/app/globals.css`](src/app/globals.css). The look is one dark teal canvas
with an ambient colour field behind it; content sits on frosted panels built
from a single recipe — translucent fill, backdrop blur, a lit top rim and a
soft shadow.

Reusable classes:

- `.glass` — a frosted panel. `.glass-strong` blurs harder; `.glass-hover` adds
  the lift-and-brighten interaction.
- `.btn` with `.btn-primary` / `.btn-glass` / `.btn-danger` / `.btn-success`, plus `.btn-sm`.
- `.section`, `.container`, `.section-title`, `.section-sub`, `.eyebrow` — page scaffolding.
- `.field` — form control styling, shared by the contact form, login and every admin editor.
- `.reveal` — fades and rises on scroll, driven by `useReveal()`.

To restyle the whole site, change the tokens in `:root` rather than editing
components.

## Notes

- Public sections fetch their own data on the client and each ships a hardcoded
  fallback, so the page is never empty if the API is unreachable.
- The profile response is cached in `localStorage` and de-duplicated across
  Hero/About/Contact/Footer, so a reload renders the right content immediately.
  Saving in the admin Profile editor clears that cache.
- The admin area is guarded in `app/admin/layout.js`. Because the JWT lives in
  `localStorage`, the guard waits for hydration (`ready`) before redirecting.
- `prefers-reduced-motion` disables the animations; panels fall back to opaque
  tinted backgrounds where `backdrop-filter` is unsupported.

## Deploying to Vercel

Set the project's **Root Directory** to `web`. Next.js is detected
automatically; add the environment variables above.
