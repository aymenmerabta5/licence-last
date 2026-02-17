import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

import { Dialog, DialogContent } from "@/components/ui/dialog"

describe("Dialog", () => {
  afterEach(() => {
    cleanup()
  })

  test("uses logical inset utility for close button positioning", () => {
    render(
      <Dialog open>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    )

    const closeButton = screen.getByRole("button", { name: "Close" })
    expect(closeButton.className).toContain("end-2")
    expect(closeButton.className).not.toContain("right-2")
  })
})
