import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"

const uploadAvatarMock = mock(async () => ({
  url: "https://cdn.example.com/avatar.png",
}))
const toastErrorMock = mock(() => {})

mock.module("sonner", () => ({
  toast: {
    success: mock(() => {}),
    error: toastErrorMock,
  },
}))

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      "errors.common.profilePhotoUpdated": "Profile photo updated.",
      "errors.common.uploadFailed": "Upload failed. Please try again.",
      "errors.common.profilePhotoRemoved": "Profile photo removed.",
      "errors.common.profilePhotoRemoveFailed":
        "Could not remove profile photo.",
      "errors.common.saveChangesFailed": "Could not save changes.",
    })[key] ?? key,
}))

mock.module("@/i18n/routing", () => ({
  useRouter: () => ({ refresh: mock(() => {}) }),
  Link: ({ children }: { children: ReactNode }) => children,
}))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    getSession: mock(async () => ({})),
  },
}))

mock.module("@/server/orpc/client", () => ({
  orpc: {
    placements: {
      getPendingById: {
        queryOptions: ({ input }: { input: { applicationId: string } }) => ({
          queryKey: ["placements", "getPendingById", input],
          queryFn: async () => ({ application: { id: input.applicationId } }),
        }),
      },
    },
    deptHead: {
      getPendingById: {
        queryOptions: ({ input }: { input: { applicationId: string } }) => ({
          queryKey: ["deptHead", "getPendingById", input],
          queryFn: async () => ({ application: { id: input.applicationId } }),
        }),
      },
    },
    users: {
      getMe: { queryOptions: () => ({ queryKey: ["users", "me"] }) },
      updateMe: { mutationOptions: () => ({ mutationFn: async () => ({}) }) },
    },
    students: {
      getProfile: {
        queryOptions: () => ({ queryKey: ["students", "profile"] }),
      },
      upsertProfileDetails: {
        mutationOptions: () => ({ mutationFn: async () => ({}) }),
      },
    },
  },
  orpcClient: {
    users: {
      uploadAvatar: uploadAvatarMock,
      deleteAvatar: mock(async () => ({})),
    },
  },
}))

describe("useProfileSettings upload failures", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    uploadAvatarMock.mockClear()
    toastErrorMock.mockClear()
  })

  test("shows recoverable error toast when avatar upload fails", async () => {
    uploadAvatarMock.mockRejectedValueOnce(new Error("S3 is not configured"))

    const queryClient = new QueryClient()
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    }

    const me = {
      user: {
        id: "student-1",
        role: "student",
        name: "Student",
        image: null,
      },
    }

    const studentProfile = null

    const { useProfileSettings } = await import(
      "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/useProfileSettings"
    )

    const { result } = renderHook(
      () => useProfileSettings(me as never, studentProfile),
      { wrapper: Wrapper },
    )

    const file = new File([new Uint8Array([137, 80, 78, 71])], "avatar.png", {
      type: "image/png",
    })

    await act(async () => {
      await result.current.handleAvatarUpload({
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(uploadAvatarMock).toHaveBeenCalledTimes(1)
    expect(toastErrorMock).toHaveBeenCalledTimes(1)
    expect(result.current.isAvatarUploading).toBe(false)
  })
})
