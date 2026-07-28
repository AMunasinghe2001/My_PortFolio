import { SITE_URL } from "@/lib/site";

// Generated at /sitemap.xml. The public site is a single page — every section
// is an anchor on "/" — so there is one canonical URL to submit. The admin and
// login routes are deliberately left out (see robots.js).
export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
