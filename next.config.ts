import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

interface ImageRemotePattern {
  hostname: string
  pathname?: string
  port?: string
  protocol?: "http" | "https"
}

function toRemotePattern(rawUrl?: string): ImageRemotePattern | null {
  if (!rawUrl) return null

  try {
    const url = new URL(rawUrl)
    const protocol = url.protocol.replace(":", "")
    if (protocol !== "http" && protocol !== "https") return null

    const pathname =
      url.pathname === "/" ? "/**" : `${url.pathname.replace(/\/+$/, "")}/**`

    return {
      protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      pathname,
    }
  } catch {
    return null
  }
}

function getStorageImageRemotePatterns(): ImageRemotePattern[] {
  const candidates = [
    process.env.S3_PUBLIC_URL,
    process.env.NEXT_PUBLIC_S3_URL,
    process.env.S3_ENDPOINT,
    process.env.NEXT_PUBLIC_S3_ENDPOINT,
  ]

  const patterns = candidates
    .map(toRemotePattern)
    .filter((pattern): pattern is ImageRemotePattern => pattern !== null)

  return Array.from(
    new Map(
      patterns.map((pattern) => [
        `${pattern.protocol}:${pattern.hostname}:${pattern.port ?? ""}:${pattern.pathname ?? ""}`,
        pattern,
      ]),
    ).values(),
  )
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./node_modules/dejavu-fonts-ttf/ttf/**/*"],
  },
  cacheComponents: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.amazonaws.com https://*.r2.cloudflarestorage.com",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: getStorageImageRemotePatterns(),
  },
  allowedDevOrigins: ["http://localhost:3000", "http://xendate"],
}

export default withNextIntl(nextConfig)
