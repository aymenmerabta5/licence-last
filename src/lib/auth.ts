import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { universityDomain } from "@/server/db/schema/universities"
import { sendEmail } from "@/server/email/sendEmail"
import ResetPasswordEmail from "@/server/email/emails/ResetPasswordEmail"
import VerifyEmailEmail from "@/server/email/emails/VerifyEmailEmail"
import { env } from "@/env"
import { getEmailDomain, domainCandidates } from "./auth-utils"

// Re-export for backward compatibility
export { getEmailDomain, domainCandidates } from "./auth-utils"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  user: {
    additionalFields: {
      role: {
        type: ["student", "company_admin", "admin", "super_admin"],
        required: false,
        defaultValue: "student",
        // input: true is required for company_admin self-registration.
        // The databaseHooks.user.create.before hook enforces an allowlist
        // (only "student" and "company_admin" are accepted).
        input: true,
      },
      universityId: {
        type: "string",
        required: false,
        input: false,
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (data) => {
          // Defense-in-depth: only allow self-registration as student or company_admin.
          // Any other value (admin, super_admin, etc.) is rejected.
          const ALLOWED_SIGNUP_ROLES = new Set<string>(["student", "company_admin"])
          const requestedRole = (data.role as string | undefined) ?? "student"
          if (!ALLOWED_SIGNUP_ROLES.has(requestedRole)) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid role for self-registration",
            })
          }
          const role = requestedRole as "student" | "company_admin"

          if (role !== "student") {
            return { data: { ...data, role } }
          }

          const domain = getEmailDomain(data.email)
          if (!domain) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid email address",
            })
          }

          const candidates = domainCandidates(domain)
          const [match] = await db
            .select({ universityId: universityDomain.universityId })
            .from(universityDomain)
            .where(
              and(
                eq(universityDomain.status, "approved"),
                inArray(universityDomain.domain, candidates),
              ),
            )
            .limit(1)

          if (!match) {
            throw new APIError("BAD_REQUEST", {
              message:
                "University email domain is not approved yet. Please request approval or use a university email.",
            })
          }

          return {
            data: {
              ...data,
              role,
              universityId: match.universityId,
            },
          }
        },
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(user.email, "Verify your email address", VerifyEmailEmail, { link: url })
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(user.email, "Reset your password", ResetPasswordEmail, { link: url })
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // Refresh token every hour
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [nextCookies()], // must be last — handles Set-Cookie in server actions
})
