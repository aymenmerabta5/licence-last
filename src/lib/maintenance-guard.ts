import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { siteSettings } from "@/server/db/schema/site-settings"

export async function getMaintenanceMode(): Promise<boolean> {
  const [row] = await db
    .select({ maintenanceMode: siteSettings.maintenanceMode })
    .from(siteSettings)
    .where(eq(siteSettings.id, "singleton"))
    .limit(1)
  return row?.maintenanceMode ?? false
}

export async function isMaintenanceBypass(
  currentRole: string | null,
  impersonatedBy?: string | null,
): Promise<boolean> {
  if (currentRole === "super_admin") return true
  if (impersonatedBy) {
    const [impersonator] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, impersonatedBy))
      .limit(1)
    return impersonator?.role === "super_admin"
  }
  return false
}
