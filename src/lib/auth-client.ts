import {
  adminClient,
  multiSessionClient,
  twoFactorClient,
} from "better-auth/client/plugins"
import { haveIBeenPwned, openAPI } from "better-auth/plugins"
import { createAuthClient } from "better-auth/react"
import {
  ac,
  companyAdmin,
  deptHead,
  student,
  superAdmin,
  universityAdmin,
} from "@/lib/permissions"

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        super_admin: superAdmin,
        university_admin: universityAdmin,
        dept_head: deptHead,
        student,
        company_admin: companyAdmin,
      },
    }),
    multiSessionClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        // No-op: we handle 2FA inline on the login page
      },
    }),
    openAPI(),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "Your password in the dark web be careful! change it",
    }),
  ],
})
