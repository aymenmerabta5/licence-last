import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockGetStudentProfileForViewer = mock(async () => ({
  user: {
    id: "student-1",
    name: "Student",
    role: "student",
    image: null,
    universityId: null,
    createdAt: new Date(),
    email: null,
  },
  profile: null,
  skills: [],
}))

mock.module("@/server/services/students/get-profile-for-viewer", () => ({
  getStudentProfileForViewer: mockGetStudentProfileForViewer,
}))

describe("src/server/services/students/get-public-profile", () => {
  beforeEach(() => {
    mockGetStudentProfileForViewer.mockClear()
  })

  test("should delegate to getStudentProfileForViewer", async () => {
    const { getPublicStudentProfile } = await import("./get-public-profile")
    const result = await getPublicStudentProfile(
      { id: "viewer-1", role: "company_admin" },
      "student-1",
    )

    expect(mockGetStudentProfileForViewer).toHaveBeenCalledTimes(1)
    expect(result?.user.id).toBe("student-1")
  })
})
