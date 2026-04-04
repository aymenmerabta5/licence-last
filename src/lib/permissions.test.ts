import { describe, expect, test } from "bun:test"

import { superAdmin, universityAdmin } from "@/lib/permissions"

describe("src/lib/permissions", () => {
  test("keeps privileged Better Auth actions reserved for super admins", () => {
    expect(universityAdmin.statements.user).toEqual([])
    expect(universityAdmin.statements.session).toEqual([])
    expect(universityAdmin.statements.user).not.toContain("set-role")
    expect(universityAdmin.statements.user).not.toContain("impersonate")
    expect(universityAdmin.statements.user).not.toContain("ban")
    expect(universityAdmin.statements.user).not.toContain("delete")

    expect(superAdmin.statements.user).toContain("list")
    expect(superAdmin.statements.user).toContain("ban")
    expect(superAdmin.statements.user).toContain("impersonate")
    expect(superAdmin.statements.session).toContain("list")
    expect(superAdmin.statements.session).toContain("revoke")
  })
})
