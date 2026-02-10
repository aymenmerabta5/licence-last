import { adminProcedure } from "../middleware"
import { getAdminStats } from "@/server/services/stats/get-admin-stats"

export const getAdminStatsProcedure = adminProcedure.handler(async () =>
  getAdminStats(),
)
