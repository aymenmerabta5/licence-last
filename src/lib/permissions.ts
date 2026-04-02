/**
 * Access control definitions for Better Auth admin plugin.
 * Shared between server (auth.ts) and client (auth-client.ts) — NO "server-only".
 */
import { createAccessControl } from "better-auth/plugins/access"

/**
 * Resource + action matrix.
 * "user" and "session" are the resources the admin plugin operates on.
 */
const statement = {
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
} as const

export const ac = createAccessControl(statement)

/** super_admin — full platform control */
export const superAdmin = ac.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
})

/** university_admin — scoped university user management */
export const universityAdmin = ac.newRole({
  user: ["list", "ban", "delete"],
  session: ["list"],
})

/** DEPRECATED: dept_head role no longer assigned. Department heads use university_admin + membership. */
export const deptHead = ac.newRole({
  user: ["list"],
  session: ["list"],
})

/** student — no admin permissions */
export const student = ac.newRole({
  user: [],
  session: [],
})

/** company_admin — no admin permissions */
export const companyAdmin = ac.newRole({
  user: [],
  session: [],
})
