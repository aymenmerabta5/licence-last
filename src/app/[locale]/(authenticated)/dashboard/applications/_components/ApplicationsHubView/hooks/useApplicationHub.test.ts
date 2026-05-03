import { describe, expect, test } from "bun:test"

import {
  unwrapORPCPayload,
} from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/hooks/useApplicationHub"

describe("useApplicationHub helpers", () => {
  test("returns raw payload values unchanged", () => {
    const journeys = [{ id: "journey-1" }]

    expect(unwrapORPCPayload(journeys)).toEqual(journeys)
  })

  test("unwraps JSON-wrapped ORPC payload values", () => {
    const wrapped = { json: [{ id: "journey-2" }] }

    expect(unwrapORPCPayload(wrapped)).toEqual(wrapped.json)
  })
})