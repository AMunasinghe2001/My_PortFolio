// Canonical origin of the deployed site. Vercel sets NEXT_PUBLIC_SITE_URL on
// production; preview builds and local dev fall back to the live domain so
// generated absolute URLs (sitemap, OG tags) stay correct.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://anushanga-munasinghe.vercel.app"
).replace(/\/$/, "");
