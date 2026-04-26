import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

import { SkillsManagerHeader } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager/components/SkillsManagerHeader"

describe("SkillsManagerHeader", () => {
  afterEach(() => {
    cleanup()
  })

  test("uses logical text alignment for the selection counter", () => {
    render(
      <SkillsManagerHeader
        selectedCount={3}
        maxSkills={12}
        isBusy={false}
        isDirty={true}
        isSaving={false}
        onSave={mock(() => {})}
      />,
    )

    const counter = screen.getByText("3/12")
    expect(counter.className).toContain("text-end")
    expect(counter.className).not.toContain("text-right")
  })
})
