import "server-only"

import { ORPCError } from "@orpc/server"

import {
  adminProcedureGenerous,
  superAdminProcedureGenerous,
} from "@/server/orpc/rate-limited-procedures"
import { getAdminStats } from "@/server/services/stats/get-admin-stats"
import { getUniversityDashboardStats } from "@/server/services/stats/get-university-dashboard-stats"

export const getAdminStatsProcedure = superAdminProcedureGenerous.handler(async () =>
  getAdminStats(),
)

export const getUniversityDashboardStatsProcedure = adminProcedureGenerous.handler(
  async ({ context }) => {
    if (context.user.role !== "university_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "University admin access required",
      })
    }

    if (!context.user.universityId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "University admin must belong to a university",
      })
    }

    return getUniversityDashboardStats(context.user.universityId)
  },
)
