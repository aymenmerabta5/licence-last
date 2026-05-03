import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { createMotionReactClientMock } from "@/test/mocks/motion-react-client"

mock.module("motion/react-client", createMotionReactClientMock)

const { UniversityKpiGrid } = await import(
  "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/UniversityKpiGrid"
)

describe("UniversityKpiGrid", () => {
  test("uses a compact two-column mobile grid for university metrics", () => {
    const { container } = render(
      <UniversityKpiGrid
        stats={{
          totalStudents: 1,
          totalDepartments: 15,
          totalDeptHeads: 2,
          totalApplications: 0,
          pendingValidations: 1,
          validatedPlacements: 0,
          placementRate: 0,
        }}
      />,
    )

    expect(screen.getByText("Your Institution At A Glance")).toBeTruthy()
    expect(screen.getByText("Students")).toBeTruthy()
    expect(screen.getByText("Departments")).toBeTruthy()

    const grid = screen.getByTestId("university-kpi-grid")
    expect(grid.className).toContain("grid-cols-2")

    const compactCards = container.querySelectorAll(
      '[class*="col-span-2"], [class*="h-full"]',
    )
    expect(compactCards.length).toBeGreaterThan(0)
  })
})
