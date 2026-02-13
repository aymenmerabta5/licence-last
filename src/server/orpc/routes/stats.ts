import "server-only"

import { superAdminProcedureGenerous } from "@/server/orpc/rate-limited-procedures"
import { getAdminStats } from "@/server/services/stats/get-admin-stats"

export const getAdminStatsProcedure = superAdminProcedureGenerous.handler(async () =>
  getAdminStats(),
)
