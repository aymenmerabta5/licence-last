import { createAuthClient } from "better-auth/react"
import { adminClient, multiSessionClient } from "better-auth/client/plugins"
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
    openAPI(),
    haveIBeenPwned({
      customPasswordCompromisedMessage: "Your password in the dark web be careful! change it"
  })
  ],
})
