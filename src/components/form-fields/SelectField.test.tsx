import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { SelectField } from "@/components/form-fields/SelectField"

describe("SelectField", () => {
  test("shows the placeholder when the current numeric value is 0", () => {
    render(
      <SelectField
        id="student-wilaya"
        label="Wilaya"
        placeholder="Select your wilaya"
        options={[{ value: 1, label: "01 - Adrar" }]}
        value={0}
        onChange={() => {}}
      />,
    )

    expect(screen.getByText("Select your wilaya")).toBeInTheDocument()
  })

  test("shows the selected option label when a valid value is present", () => {
    render(
      <SelectField
        id="student-wilaya"
        label="Wilaya"
        placeholder="Select your wilaya"
        options={[{ value: 1, label: "01 - Adrar" }]}
        value={1}
        onChange={() => {}}
      />,
    )

    expect(screen.getByText("01 - Adrar")).toBeInTheDocument()
  })
})