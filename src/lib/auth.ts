import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { universityDomain } from "@/server/db/schema/universities"
import { sendEmail } from "@/server/email/sendEmail"
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
        type: ["student", "recruiter", "admin"],
        required: false,
        defaultValue: "student",
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
          const role = data.role ?? "student"
          if (role !== "student" && role !== "recruiter") {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid role",
            })
          }

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
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Verify your email by clicking this link: ${url}`,
      })
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Reset your password by clicking this link: ${url}`,
      })
    },
  },
  plugins: [nextCookies()], // must be last — handles Set-Cookie in server actions
})
