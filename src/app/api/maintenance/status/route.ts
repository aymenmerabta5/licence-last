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

    return NextResponse.json({ enabled, canBypass })
  } catch {
    // Fail open: if the DB or session check breaks, never lock the site
    return NextResponse.json({ enabled: false, canBypass: false })
  }
}
