import { describe, expect, test } from "bun:test"

import { createBulkCreateDepartmentsSchema } from "@/lib/schemas/department"

function t(key: string) {
  return `t:${key}`
}

describe("createBulkCreateDepartmentsSchema", () => {
  const schema = createBulkCreateDepartmentsSchema(t)

  test("should accept valid bulk department rows", () => {
    const result = schema.safeParse({
      rows: [
        {
          departmentName: "Computer Science",
          headEmail: "head@university.dz",
        },
      ],
    })

    expect(result.success).toBe(true)
  })

  test("should use translated messages for nested row validation", () => {
    const result = schema.safeParse({
      rows: [
        {
          departmentName: "A",
          headEmail: "not-an-email",
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.find(
          (issue) => issue.path.join(".") === "rows.0.departmentName",
        )?.message,
      ).toBe("t:departmentNameMin")
      expect(
        result.error.issues.find(
          (issue) => issue.path.join(".") === "rows.0.headEmail",
        )?.message,
      ).toBe("t:headEmailInvalid")
    }
  })
})
