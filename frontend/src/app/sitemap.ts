import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Generates /sitemap.xml. Only lists routes reachable without authentication —
 * the rest of the app is auth-gated and would redirect to login for a crawler.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/auth/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${siteUrl}/auth/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
