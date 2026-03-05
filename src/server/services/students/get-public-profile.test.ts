import { beforeEach, describe, expect, mock, test } from "bun:test"

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

function applyGetPublicStudentProfileMocks() {
  mock.module("@/server/services/students/get-profile-for-viewer", () => ({
    getStudentProfileForViewer: mockGetStudentProfileForViewer,
  }))
}

let getPublicStudentProfileImportCounter = 0
async function importGetPublicStudentProfile() {
  getPublicStudentProfileImportCounter += 1
  return import(
    `@/server/services/students/get-public-profile?test=${getPublicStudentProfileImportCounter}`
  )
}

describe("src/server/services/students/get-public-profile", () => {
  beforeEach(() => {
    applyGetPublicStudentProfileMocks()
    mockGetStudentProfileForViewer.mockClear()
  })

  test("should delegate to getStudentProfileForViewer", async () => {
    const { getPublicStudentProfile } = await importGetPublicStudentProfile()
    const result = await getPublicStudentProfile(
      { id: "viewer-1", role: "company_admin" },
      "student-1",
    )

    expect(mockGetStudentProfileForViewer).toHaveBeenCalledTimes(1)
    expect(result?.user.id).toBe("student-1")
  })
})
