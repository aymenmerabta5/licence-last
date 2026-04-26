import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

describe(".env.example template", () => {
  test("includes a DATABASE_URL placeholder", () => {
    const envExample = readFileSync(
      resolve(process.cwd(), ".env.example"),
      "utf8",
    )

    expect(envExample).toContain("DATABASE_URL=")
  })
})
