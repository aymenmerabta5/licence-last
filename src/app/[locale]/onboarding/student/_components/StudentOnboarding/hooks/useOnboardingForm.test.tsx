import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { renderHook } from "@testing-library/react"

const observedQueryOptions: Array<{ enabled?: boolean; queryKey?: unknown[] }> = []
let currentMeResult: { university?: { id: string } | null } | undefined
let importCounter = 0

const useQueryMock = mock(
  (options?: { enabled?: boolean; queryKey?: unknown[] }) => {
    observedQueryOptions.push(options ?? {})

    const scope = Array.isArray(options?.queryKey) ? options.queryKey[0] : null

    if (scope === "users") {
      return { data: currentMeResult, isLoading: false, error: null }
    }

    if (options?.enabled === false) {
      return { data: undefined, isLoading: false, error: null }
    }

    if (scope === "departments") {
      return {
        data: [{ id: "dept-1", name: "Computer Science" }],
        isLoading: false,
        error: null,
      }
    }

    return { data: [], isLoading: false, error: null }
  },
)

mock.module("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}))

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

mock.module("@/i18n/routing", () => ({
  useRouter: () => ({ push: mock(() => {}) }),
}))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    getSession: mock(async () => ({ data: null })),
  },
}))

mock.module("@/lib/feature-flags-client", () => ({
  isLanguageRequirementsEnabledOnClient: () => false,
}))

mock.module("@/server/orpc/client", () => ({
  orpcClient: {
    students: {
      upsertProfile: mock(async () => ({ userId: "student-1" })),
    },
  },
  orpc: {
    users: {
      getMe: {
        queryOptions: () => ({ queryKey: ["users", "getMe"] }),
      },
    },
    skills: {
      listPrioritized: {
        queryOptions: ({ input }: { input: { departmentId: string } }) => ({
          queryKey: ["skills", "listPrioritized", input],
        }),
      },
      list: {
        queryOptions: () => ({ queryKey: ["skills", "list"] }),
      },
    },
    departments: {
      list: {
        queryOptions: ({ input }: { input: { universityId: string } }) => ({
          queryKey: ["departments", "list", input],
        }),
      },
    },
  },
}))

async function loadUseOnboardingForm() {
  importCounter += 1
  return import(
    `@/app/[locale]/onboarding/student/_components/StudentOnboarding/hooks/useOnboardingForm?test=${importCounter}`
  )
}

describe("useOnboardingForm", () => {
  beforeEach(() => {
    currentMeResult = undefined
    observedQueryOptions.length = 0
    useQueryMock.mockClear()
  })

  afterAll(() => {
    mock.restore()
  })

  test("disables department loading until a university id is available", async () => {
    const { useOnboardingForm } = await loadUseOnboardingForm()

    renderHook(() => useOnboardingForm())

    const departmentsCall = observedQueryOptions.find(
      (options) => options.queryKey?.[0] === "departments",
    )

    expect(departmentsCall).toEqual({
      queryKey: ["departments", "list", { universityId: "" }],
      enabled: false,
    })
  })

  test("loads departments when the student university is available", async () => {
    currentMeResult = { university: { id: "uni-1" } }
    const { useOnboardingForm } = await loadUseOnboardingForm()

    const { result } = renderHook(() => useOnboardingForm())

    const departmentsCall = observedQueryOptions.find(
      (options) => options.queryKey?.[0] === "departments",
    )

    expect(departmentsCall).toEqual({
      queryKey: ["departments", "list", { universityId: "uni-1" }],
      enabled: true,
    })
    expect(result.current.departments).toEqual([
      { id: "dept-1", name: "Computer Science" },
    ])
  })
})