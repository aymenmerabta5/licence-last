import "server-only"

import {
  publicProcedure,
  authedSessionProcedure,
  authedProcedure,
  adminProcedure,
  superAdminProcedure,
  companyAdminProcedure,
  studentProcedure,
  deptHeadProcedure,
} from "./middleware"
import {
  createStrictRateLimitMiddleware,
  createStandardRateLimitMiddleware,
  createGenerousRateLimitMiddleware,
  createAssistantRateLimitMiddleware,
} from "./ratelimit-middleware"

/**
 * Public procedure with strict rate limiting (5 req/min)
 * Use for: Authentication endpoints, password reset, etc.
 * Key: IP-based
 */
export const publicProcedureStrict = publicProcedure.use(
  createStrictRateLimitMiddleware("public-strict")
)

/**
 * Public procedure with standard rate limiting (100 req/min)
 * Use for: Public read operations, unauthenticated API
 * Key: IP-based
 */
export const publicProcedureStandard = publicProcedure.use(
  createStandardRateLimitMiddleware("public-standard")
)

/**
 * Authenticated procedure with standard rate limiting (100 req/min)
 * Use for: General authenticated API operations
 * Key: User-based
 */
export const authedProcedureStandard = authedProcedure.use(
  createStandardRateLimitMiddleware("authed-standard")
)

/**
 * Authenticated session-only procedure with standard rate limiting (100 req/min)
 * Bypasses approval gate; use only for bootstrap/session endpoints.
 */
export const authedSessionProcedureStandard = authedSessionProcedure.use(
  createStandardRateLimitMiddleware("authed-session-standard")
)

/**
 * Authenticated procedure with generous rate limiting (300 req/min)
 * Use for: Read-heavy operations, listings, searches
 * Key: User-based
 */
export const authedProcedureGenerous = authedProcedure.use(
  createGenerousRateLimitMiddleware("authed-generous")
)

/**
 * Authenticated session-only procedure with generous rate limiting (300 req/min)
 * Bypasses approval gate; use only for bootstrap/session endpoints.
 */
export const authedSessionProcedureGenerous = authedSessionProcedure.use(
  createGenerousRateLimitMiddleware("authed-session-generous")
)

/**
 * Authenticated procedure with strict rate limiting (5 req/min)
 * Use for: Sensitive operations (password change, email change)
 * Key: User-based
 */
export const authedProcedureStrict = authedProcedure.use(
  createStrictRateLimitMiddleware("authed-strict")
)

/**
 * Admin procedure with generous rate limiting (300 req/min)
 * Admins get higher limits for bulk operations
 * Key: Admin user-based
 */
export const adminProcedureGenerous = adminProcedure.use(
  createGenerousRateLimitMiddleware("admin-generous")
)

/**
 * Admin procedure with standard rate limiting (100 req/min)
 * Use for: Standard admin operations
 * Key: Admin user-based
 */
export const adminProcedureStandard = adminProcedure.use(
  createStandardRateLimitMiddleware("admin-standard")
)

/**
 * Super admin procedure with generous rate limiting (300 req/min)
 * Super admins get highest limits
 * Key: Super admin user-based
 */
export const superAdminProcedureGenerous = superAdminProcedure.use(
  createGenerousRateLimitMiddleware("superadmin-generous")
)

/**
 * Super admin procedure with standard rate limiting (100 req/min)
 * Use for: Standard super admin operations
 * Key: Super admin user-based
 */
export const superAdminProcedureStandard = superAdminProcedure.use(
  createStandardRateLimitMiddleware("superadmin-standard")
)

/**
 * AI/Assistant procedure with specialized rate limiting (20 req/min)
 * AI calls are expensive, so limit them strictly
 * Key: User-based
 */
export const assistantProcedureLimited = authedProcedure.use(
  createAssistantRateLimitMiddleware("assistant")
)

/**
 * Company admin procedure with standard rate limiting (100 req/min)
 * Use for: General company admin operations
 * Key: User-based
 */
export const companyAdminProcedureStandard = companyAdminProcedure.use(
  createStandardRateLimitMiddleware("companyadmin-standard")
)

/**
 * Company admin procedure with generous rate limiting (300 req/min)
 * Use for: Read-heavy company admin operations
 * Key: User-based
 */
export const companyAdminProcedureGenerous = companyAdminProcedure.use(
  createGenerousRateLimitMiddleware("companyadmin-generous")
)

/**
 * Company admin procedure with AI rate limiting (20 req/min)
 * Use for: AI assistant operations (expensive)
 * Key: User-based
 */
export const companyAdminProcedureAssistant = companyAdminProcedure.use(
  createAssistantRateLimitMiddleware("companyadmin-assistant")
)

/**
 * Student procedure with standard rate limiting (100 req/min)
 * Use for: General student operations and mutations
 * Key: User-based
 */
export const studentProcedureStandard = studentProcedure.use(
  createStandardRateLimitMiddleware("student-standard")
)

/**
 * Student procedure with generous rate limiting (300 req/min)
 * Use for: Student read-heavy operations
 * Key: User-based
 */
export const studentProcedureGenerous = studentProcedure.use(
  createGenerousRateLimitMiddleware("student-generous")
)

/**
 * Department head procedure with standard rate limiting (100 req/min)
 * Use for: General dept head operations (validate, reject)
 * Key: User-based
 */
export const deptHeadProcedureStandard = deptHeadProcedure.use(
  createStandardRateLimitMiddleware("depthead-standard")
)

/**
 * Department head procedure with generous rate limiting (300 req/min)
 * Use for: Read-heavy dept head operations (list pending)
 * Key: User-based
 */
export const deptHeadProcedureGenerous = deptHeadProcedure.use(
  createGenerousRateLimitMiddleware("depthead-generous")
)
