import type { MetadataRoute } from "next"

import { getPublicAppUrl } from "@/lib/public-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/*/dashboard/", "/*/onboarding/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${getPublicAppUrl()}/sitemap.xml`,
  }
}
