import { describe, expect, test } from "bun:test"

import {
  createUniversityOnboardingSchema,
  createUniversityUpdateSchema,
} from "@/lib/schemas/university"

function t(key: string) {
  return `t:${key}`
}

describe("createUniversityOnboardingSchema", () => {
  const schema = createUniversityOnboardingSchema(t)

  const validInput = {
    name: "University of Algiers",
    wilayaCode: 16,
    domains: ["univ-alger.dz"],
  }

  test("should accept valid minimal input", () => {
    const result = schema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  test("should accept valid input with all optional fields", () => {
    const result = schema.safeParse({
      ...validInput,
      abbreviation: "USTHB",
      departmentName: "CS Dept",
      phone: "+213555123456",
      city: "Algiers",
      address: "123 University Ave",
      departments: [{ name: "Computer Science" }, { name: "Mathematics" }],
    })
    expect(result.success).toBe(true)
  })

  test("should reject name shorter than 2 characters", () => {
    const result = schema.safeParse({ ...validInput, name: "A" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) => i.path[0] === "name")
      expect(nameIssue?.message).toBe("t:universityNameMin")
    }
  })

  test("should reject wilayaCode of 0", () => {
    const result = schema.safeParse({ ...validInput, wilayaCode: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "wilayaCode")
      expect(issue?.message).toBe("t:wilayaRequired")
    }
  })

  test("should reject wilayaCode of 59", () => {
    const result = schema.safeParse({ ...validInput, wilayaCode: 59 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "wilayaCode")
      expect(issue?.message).toBe("t:wilayaInvalid")
    }
  })

  test("should accept boundary wilayaCodes 1 and 58", () => {
    expect(schema.safeParse({ ...validInput, wilayaCode: 1 }).success).toBe(
      true,
    )
    expect(schema.safeParse({ ...validInput, wilayaCode: 58 }).success).toBe(
      true,
    )
  })

  test("should reject empty domains array", () => {
    const result = schema.safeParse({ ...validInput, domains: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "domains")
      expect(issue?.message).toBe("t:domainsRequired")
    }
  })

  test("should reject domain shorter than 3 characters", () => {
    const result = schema.safeParse({ ...validInput, domains: ["ab"] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(
        (current) => current.path.join(".") === "domains.0",
      )
      expect(issue?.message).toBe("t:domainMin")
    }
  })

  test("should reject department entries shorter than 2 characters", () => {
    const result = schema.safeParse({
      ...validInput,
      departments: [{ name: "A" }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(
        (current) => current.path.join(".") === "departments.0.name",
      )
      expect(issue?.message).toBe("t:departmentEntryNameMin")
    }
  })

  test("should coerce string wilayaCode to number", () => {
    const result = schema.safeParse({ ...validInput, wilayaCode: "16" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.wilayaCode).toBe(16)
    }
  })
})

describe("createUniversityUpdateSchema", () => {
  const schema = createUniversityUpdateSchema(t)

  test("should accept valid update payload", () => {
    const result = schema.safeParse({
      name: "University of Algiers",
      abbreviation: "USTHB",
      phone: "+213555123456",
      wilayaCode: 16,
      city: "Algiers",
      address: "123 Avenue",
    })

    expect(result.success).toBe(true)
  })

  test("should reject short names", () => {
    const result = schema.safeParse({
      name: "A",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const nameIssue = result.error.issues.find(
        (issue) => issue.path[0] === "name",
      )
      expect(nameIssue?.message).toBe("t:universityNameMin")
    }
  })

  test("should reject invalid wilayaCode values", () => {
    const tooLow = schema.safeParse({ name: "USTHB", wilayaCode: 0 })
    const tooHigh = schema.safeParse({ name: "USTHB", wilayaCode: 59 })

    expect(tooLow.success).toBe(false)
    expect(tooHigh.success).toBe(false)
  })
})
