import type { MetadataRoute } from "next"

import { env } from "@/env"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/*/dashboard/", "/*/onboarding/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/sitemap.xml`,
  }
}
