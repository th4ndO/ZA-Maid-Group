import type { MetadataRoute } from "next";
import { nav } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    ...nav.map((item) => ({
      url: new URL(item.href, base).toString(),
      changeFrequency: "monthly" as const,
      priority: item.href === "/" ? 1 : 0.8,
    })),
    { url: new URL("/privacy", base).toString(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];
}
