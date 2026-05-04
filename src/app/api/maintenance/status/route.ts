import { NextResponse } from "next/server"

import {
  getMaintenanceMode,
  isMaintenanceBypass,
} from "@/lib/maintenance-guard"
import { getFreshAuthSession } from "@/server/auth/get-fresh-session"

export async function GET(request: Request) {
  try {
    const enabled = await getMaintenanceMode()

    const session = await getFreshAuthSession(request.headers)

    const currentRole = session?.user?.role ?? null
    const impersonatedBy =
      (session?.session as { impersonatedBy?: string } | null)
        ?.impersonatedBy ?? null

    const canBypass = await isMaintenanceBypass(currentRole, impersonatedBy)

    return NextResponse.json(
      { enabled, canBypass },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Cloudflare-CDN-Cache-Control": "no-store",
        },
      },
    )
  } catch (err) {
    console.error("[maintenance/status] error:", err)
    // Fail open: if the DB or session check breaks, never lock the site
    return NextResponse.json(
      { enabled: false, canBypass: false },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Cloudflare-CDN-Cache-Control": "no-store",
        },
      },
    )
  }
}
