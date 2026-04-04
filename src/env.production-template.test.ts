import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, test } from "bun:test"

describe(".env.production template", () => {
  test("includes a DATABASE_URL placeholder for production builds", () => {
    const envProduction = readFileSync(
      resolve(process.cwd(), ".env.production"),
      "utf8",
    )

    expect(envProduction).toContain("DATABASE_URL=")
  })
})
