import { getSessionCookie } from "better-auth/cookies"
import { eq } from "drizzle-orm"
import type { NextRequest } from "next/server"

import { db } from "@/server/db"
import { session, user } from "@/server/db/schema/auth"
import { siteSettings } from "@/server/db/schema/site-settings"

export async function checkMaintenanceStatus(request: NextRequest): Promise<{
  enabled: boolean
  canBypass: boolean
}> {
  const [settingsRow] = await db
    .select({ maintenanceMode: siteSettings.maintenanceMode })
    .from(siteSettings)
    .where(eq(siteSettings.id, "singleton"))
    .limit(1)

  const enabled = settingsRow?.maintenanceMode ?? false
  if (!enabled) {
    return { enabled: false, canBypass: false }
  }

  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return { enabled: true, canBypass: false }
  }

  const [sessionRow] = await db
    .select({
      userId: session.userId,
      impersonatedBy: session.impersonatedBy,
    })
    .from(session)
    .where(eq(session.token, sessionCookie))
    .limit(1)

  if (!sessionRow) {
    return { enabled: true, canBypass: false }
  }

  const [userRow] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, sessionRow.userId))
    .limit(1)

  if (userRow?.role === "super_admin") {
    return { enabled: true, canBypass: true }
  }

  if (sessionRow.impersonatedBy) {
    const [impersonator] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, sessionRow.impersonatedBy))
      .limit(1)
    if (impersonator?.role === "super_admin") {
      return { enabled: true, canBypass: true }
    }
  }

  return { enabled: true, canBypass: false }
}
