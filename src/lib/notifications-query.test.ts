import { describe, expect, test } from "bun:test"

import { notificationsQueryKeys } from "@/lib/notifications-query"

describe("src/lib/notifications-query", () => {
  test("creates user-scoped root keys", () => {
    expect(notificationsQueryKeys.root("user-1")).toEqual([
      "notifications",
      "user-1",
    ])
    expect(notificationsQueryKeys.root("user-2")).toEqual([
      "notifications",
      "user-2",
    ])
  })

  test("creates user-scoped list keys including limit", () => {
    expect(notificationsQueryKeys.list("user-1", 6)).toEqual([
      "notifications",
      "user-1",
      "list",
      6,
    ])
    expect(notificationsQueryKeys.list("user-1", 50)).toEqual([
      "notifications",
      "user-1",
      "list",
      50,
    ])
  })
})

