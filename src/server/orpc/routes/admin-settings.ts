import "server-only"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/server/db"
import { siteSettings } from "@/server/db/schema/site-settings"
import { superAdminProcedure } from "@/server/orpc/middleware"

export const getMaintenanceModeProcedure = superAdminProcedure.handler(
  async () => {
    const [row] = await db
      .select({ maintenanceMode: siteSettings.maintenanceMode })
      .from(siteSettings)
      .where(eq(siteSettings.id, "singleton"))
      .limit(1)
    return { enabled: row?.maintenanceMode ?? true }
  },
)

export const setMaintenanceModeProcedure = superAdminProcedure
  .input(z.object({ enabled: z.boolean() }))
  .handler(async ({ input }) => {
    await db
      .insert(siteSettings)
      .values({ id: "singleton", maintenanceMode: input.enabled })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: {
          maintenanceMode: input.enabled,
          updatedAt: new Date(),
        },
      })
    return { enabled: input.enabled }
  })
