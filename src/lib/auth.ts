import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { admin as adminPlugin, multiSession, twoFactor } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { and, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { universityDomain } from "@/server/db/schema/universities"
import { sendEmail } from "@/server/email/sendEmail"
import ResetPasswordEmail from "@/server/email/emails/ResetPasswordEmail"
import VerifyEmailEmail from "@/server/email/emails/VerifyEmailEmail"
import TwoFactorOtpEmail from "@/server/email/emails/TwoFactorOtpEmail"
import { env } from "@/env"
import { getEmailDomain, domainCandidates } from "./auth-utils"
import { ac, superAdmin, admin, deptHead, student, companyAdmin } from "./permissions"

// Re-export for backward compatibility
export { getEmailDomain, domainCandidates } from "./auth-utils"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  user: {
    additionalFields: {
      role: {
        type: ["student", "company_admin", "dept_head", "admin", "super_admin"],
        required: false,
        defaultValue: "student",
        // input: true is required for company_admin self-registration.
        // The databaseHooks.user.create.before hook enforces an allowlist
        // (only "student" and "company_admin" are accepted for self-reg).
        input: true,
      },
      universityId: {
        type: "string",
        required: false,
        input: false,
      },
      departmentId: {
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
      banned: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      banReason: {
        type: "string",
        required: false,
        input: false,
      },
      banExpires: {
        type: "number",
        required: false,
        input: false,
      },
      twoFactorEnabled: {
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
          const VALID_ROLES = new Set<string>(["student", "company_admin", "dept_head", "admin", "super_admin"])
          const ALLOWED_SIGNUP_ROLES = new Set<string>(["student", "company_admin"])
          const requestedRole = (data.role as string | undefined) ?? "student"

          // Admin-created users arrive with emailVerified: true (admin plugin default).
          // Self-registered users have emailVerified: false (requireEmailVerification: true).
          const isAdminCreated = data.emailVerified === true

          if (isAdminCreated) {
            // Admin creating a user — allow any valid role
            if (!VALID_ROLES.has(requestedRole)) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid role",
              })
            }
            return { data: { ...data, role: requestedRole } }
          }

          // Self-registration — only student or company_admin allowed
          if (!ALLOWED_SIGNUP_ROLES.has(requestedRole)) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid role for self-registration",
            })
          }
          const role = requestedRole as "student" | "company_admin"

          // company_admin skips domain validation
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
  plugins: [
    adminPlugin({
      ac,
      roles: {
        super_admin: superAdmin,
        admin,
        dept_head: deptHead,
        student,
        company_admin: companyAdmin,
      },
      adminRoles: ["super_admin"],
      defaultRole: "student",
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
    twoFactor({
      issuer: "Internex",
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendEmail(
            user.email,
            "Your Internex verification code",
            TwoFactorOtpEmail,
            { otp, userName: user.name || "User" },
          )
        },
        period: 5, // OTP valid for 5 minutes
      },
      backupCodes: {
        amount: 10,
        length: 10,
      },
      skipVerificationOnEnable: false,
    }),
    multiSession({
      maximumSessions: 5,
    }),
    nextCookies(), // must be last — handles Set-Cookie in server actions
  ],
})
