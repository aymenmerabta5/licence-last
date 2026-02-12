import "server-only"

import { adminProcedureGenerous } from "@/server/orpc/rate-limited-procedures"
import { getAdminStats } from "@/server/services/stats/get-admin-stats"

export const getAdminStatsProcedure = adminProcedureGenerous.handler(async () =>
  getAdminStats(),
)
