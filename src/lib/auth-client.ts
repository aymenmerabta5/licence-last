import { createAuthClient } from "better-auth/react"
import { adminClient, multiSessionClient, twoFactorClient } from "better-auth/client/plugins"
import { ac, superAdmin, admin, student, companyAdmin } from "./permissions"
import { openAPI, haveIBeenPwned  } from "better-auth/plugins"


export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        super_admin: superAdmin,
        admin,
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
      customPasswordCompromisedMessage: "Your password in the dark web be careful! change it"
  })
  ],
})
