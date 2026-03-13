import { describe, expect, test } from "bun:test"

import { getMaintenancePostgresOptions } from "@/server/db/postgres-options"

describe("getMaintenancePostgresOptions", () => {
  test("should disable postgres notices during destructive maintenance operations", () => {
    const options = getMaintenancePostgresOptions()

    expect(options.max).toBe(1)
    expect(options.prepare).toBe(false)
    expect(options.onnotice).toBeFunction()
    expect(options.onnotice?.({} as never)).toBeUndefined()
  })
})
