import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const now = new Date();
  return [
    { url: `${site}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/auth`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
