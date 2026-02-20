import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import {
  admin as adminPlugin,
  captcha,
  multiSession,
  twoFactor,
} from "better-auth/plugins"
import { and, eq, inArray } from "drizzle-orm"
import { env } from "@/env"
import { domainCandidates, getEmailDomain } from "@/lib/auth-utils"
import {
  ac,
  companyAdmin,
  deptHead,
  student,
  superAdmin,
  universityAdmin,
} from "@/lib/permissions"
import { db } from "@/server/db"
import { universityDomain } from "@/server/db/schema/universities"
import { sendEmail } from "@/server/email/sendEmail"
import DeptHeadWelcomeEmail from "@/server/email/templates/DeptHeadWelcomeEmail"
import ResetPasswordEmail from "@/server/email/templates/ResetPasswordEmail"
import TwoFactorOtpEmail from "@/server/email/templates/TwoFactorOtpEmail"
import VerifyEmailEmail from "@/server/email/templates/VerifyEmailEmail"

// Re-export for backward compatibility
export { domainCandidates, getEmailDomain } from "@/lib/auth-utils"

/**
 * Short-lived signal map for bulk dept-head creation.
 * Set immediately before `auth.api.requestPasswordReset()`, consumed in
 * the `sendResetPassword` callback within the same HTTP request.
 *
 * Safe as an in-memory Map because both the write (in assign-head-by-email.ts)
 * and the read (in sendResetPassword below) happen synchronously within a
 * single request lifecycle — this is never shared across concurrent requests.
 */
export const pendingWelcomeEmails = new Map<
  string,
  { name: string; departmentName: string; universityName: string }
>()

const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY
const CAPTCHA_ENABLED =
  Boolean(TURNSTILE_SECRET_KEY) &&
  process.env.CI !== "true" &&
  process.env.E2E_DISABLE_CAPTCHA !== "1"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        // input: false — admin plugin forces this. Role is set by the
        // databaseHooks.user.create.before hook using ctx.body.accountType.
        input: false,
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
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        // Clean up S3 avatar if the user has one
        if (user.image) {
          try {
            const key = new URL(user.image).pathname.slice(1)
            if (key) {
              const { deleteFile } = await import("@/server/storage/s3")
              await deleteFile(key)
            }
          } catch {
            // S3 cleanup is best-effort — don't block deletion
          }
        }
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (data, ctx) => {
          const VALID_ROLES = new Set<string>([
            "student",
            "company_admin",
            "dept_head",
            "university_admin",
            "super_admin",
          ])
          const ALLOWED_SIGNUP_ROLES = new Set<string>([
            "student",
          ])
          const isAdminCreated = data.emailVerified === true

          if (isAdminCreated) {
            // Admin creating a user — role is set directly by admin endpoint
            const requestedRole = (data.role as string | undefined) ?? "student"
            if (!VALID_ROLES.has(requestedRole)) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid role",
              })
            }
            return { data: { ...data, role: requestedRole } }
          }

          // Self-registration — read accountType from raw request body
          // (role field has input:false via admin plugin, so we use a separate body field)
          const requestedRole =
            (ctx?.body?.accountType as string | undefined) ?? "student"
          if (!ALLOWED_SIGNUP_ROLES.has(requestedRole)) {
            throw new APIError("BAD_REQUEST", {
              code: "ROLE_IS_NOT_ALLOWED_TO_BE_SET",
              message: "role is not allowed to be set",
            })
          }
          const role = requestedRole as "student"

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
      await sendEmail(
        user.email,
        "Verify your email address",
        VerifyEmailEmail,
        { link: url },
      )
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      const welcomeData = pendingWelcomeEmails.get(user.email)
      if (welcomeData) {
        pendingWelcomeEmails.delete(user.email)
        await sendEmail(
          user.email,
          "Welcome to Internex — Set Your Password",
          DeptHeadWelcomeEmail,
          { ...welcomeData, link: url },
        )
      } else {
        await sendEmail(user.email, "Reset your password", ResetPasswordEmail, {
          link: url,
        })
      }
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
        university_admin: universityAdmin,
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
    ...(CAPTCHA_ENABLED
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: TURNSTILE_SECRET_KEY!,
          }),
        ]
      : []),
    nextCookies(), // must be last — handles Set-Cookie in server actions
  ],
})
