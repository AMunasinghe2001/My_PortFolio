import { SITE_URL } from "@/lib/site";

// Generated at /robots.txt. The admin area holds no public content and would
// only waste crawl budget, so it is excluded.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
