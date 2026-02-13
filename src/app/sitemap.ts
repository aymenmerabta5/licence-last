import type { MetadataRoute } from "next"

import { env } from "@/env"
import { routing } from "@/i18n/routing"

const publicRoutes: {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/login", priority: 0.7, changeFrequency: "monthly" },
  { path: "/signup", priority: 0.7, changeFrequency: "monthly" },
  { path: "/reset-password", priority: 0.7, changeFrequency: "monthly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_BETTER_AUTH_URL

  return publicRoutes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path === "/" ? "" : route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${baseUrl}/${l}${route.path === "/" ? "" : route.path}`,
          ])
        ),
      },
    }))
  )
}
