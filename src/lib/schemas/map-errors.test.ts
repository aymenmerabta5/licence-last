import { describe, expect, test } from "bun:test"
import { z } from "zod"

import { mapZodErrors } from "@/lib/schemas/map-errors"

describe("mapZodErrors", () => {
  const schema = z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(2, "Name too short"),
    age: z.number().min(18, "Must be 18+"),
  })

  test("should return undefined for successful parse", () => {
    const result = schema.safeParse({
      email: "a@b.com",
      name: "Alice",
      age: 25,
    })
    expect(mapZodErrors(result)).toBeUndefined()
  })

  test("should return field errors for single invalid field", () => {
    const result = schema.safeParse({
      email: "not-email",
      name: "Alice",
      age: 25,
    })
    const errors = mapZodErrors(result)
    expect(errors).toBeDefined()
    expect(errors?.fields.email).toBe("Invalid email")
  })

  test("should return errors for multiple invalid fields", () => {
    const result = schema.safeParse({ email: "not-email", name: "A", age: 10 })
    const errors = mapZodErrors(result)
    expect(errors).toBeDefined()
    expect(errors?.fields.email).toBe("Invalid email")
    expect(errors?.fields.name).toBe("Name too short")
    expect(errors?.fields.age).toBe("Must be 18+")
  })

  test("should keep only the first error per field", () => {
    // String refinement: min(2) fails before email check
    const multiSchema = z.object({
      value: z.string().min(2, "too short").email("bad email"),
    })
    const result = multiSchema.safeParse({ value: "x" })
    const errors = mapZodErrors(result)
    expect(errors).toBeDefined()
    // Only first error for "value" field should appear
    expect(Object.keys(errors?.fields ?? {})).toHaveLength(1)
  })

  test("should return undefined when all issues lack a path", () => {
    // Create a ZodError manually with no-path issue
    const error = new z.ZodError([
      {
        code: "custom",
        message: "Top-level error",
        path: [],
      },
    ])
    const result = { success: false as const, error }
    expect(mapZodErrors(result)).toBeUndefined()
  })

  test("should handle issues with numeric path keys", () => {
    const arraySchema = z.array(z.string().min(1, "Required"))
    const result = arraySchema.safeParse([""])
    const errors = mapZodErrors(result)
    expect(errors).toBeDefined()
    expect(errors?.fields["0"]).toBe("Required")
  })

  test("should preserve nested field paths while keeping the root field fallback", () => {
    const nestedSchema = z.object({
      rows: z.array(
        z.object({
          departmentName: z.string().min(2, "Department name too short"),
        }),
      ),
    })

    const result = nestedSchema.safeParse({
      rows: [{ departmentName: "A" }],
    })
    const errors = mapZodErrors(result)

    expect(errors?.fields["rows.0.departmentName"]).toBe(
      "Department name too short",
    )
    expect(errors?.fields.rows).toBe("Department name too short")
  })
})
