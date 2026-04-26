import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import type { ReactNode } from "react"
import { createMotionReactClientMock } from "@/test/mocks/motion-react-client"

const mockToastError = mock(() => {})
const mockToastSuccess = mock(() => {})
let turnstileEnabled = false

mock.module("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}))

const TRANSLATIONS: Record<string, string> = {
  title: "أهلاً وسهلاً",
  subtitle: "سجل الدخول إلى حساب إنترنكس الخاص بك",
  email: "عنوان البريد الإلكتروني",
  emailPlaceholder: "you@university.edu",
  password: "كلمة المرور",
  passwordPlaceholder: "أدخل كلمة المرور الخاصة بك",
  rememberMe: "تذكرني",
  forgotPassword: "هل نسيت كلمة المرور؟",
  submit: "تسجيل الدخول",
  or: "أو",
  noAccount: "ليس لديك حساب؟",
  createOne: "أنشئ حساباً",
  error: "حدث شيء خاطئ. يرجى المحاولة مرة أخرى.",
  emailNotVerified: "يرجى التحقق من بريدك الإلكتروني للمتابعة.",
  resendVerification: "إعادة إرسال بريد التحقق",
  verificationSent: "تم إرسال بريد التحقق. تفقد بريدك الوارد.",
  "auth.login.error": "حدث شيء خاطئ. يرجى المحاولة مرة أخرى.",
  "errors.auth.captchaRequired": "يرجى إكمال اختبار CAPTCHA.",
}

mock.module("next-intl", () => ({
  useTranslations: () =>
    Object.assign((key: string) => TRANSLATIONS[key] || key, {
      has: (key: string) => key in TRANSLATIONS,
    }),
}))

mock.module("@/lib/schemas/auth", () => ({
  createLoginSchema: () => ({
    safeParse: (data: { email: string; password: string }) => {
      const issues: Array<{ path: (string | number)[]; message: string }> = []

      if (!data.email || !data.email.includes("@")) {
        issues.push({ path: ["email"], message: "بريد إلكتروني غير صالح" })
      }
      if (!data.password) {
        issues.push({ path: ["password"], message: "كلمة المرور مطلوبة" })
      }

      if (issues.length > 0) {
        return { success: false, error: { issues } }
      }

      return { success: true, data }
    },
  }),
  errorMessage: (error: unknown) => {
    if (typeof error === "string") return error
    if (typeof error === "object" && error && "message" in error) {
      return String(error.message)
    }
    return String(error)
  },
}))

const mockSignIn = mock<
  (
    credentials: Record<string, unknown>,
  ) => Promise<{ error: Record<string, unknown> | null; data?: unknown }>
>(() => Promise.resolve({ error: null }))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mockSignIn,
    },
    sendVerificationEmail: mock(() => Promise.resolve({ error: null })),
    twoFactor: {
      sendOtp: mock(() => Promise.resolve({ error: null })),
    },
  },
}))

mock.module("@/lib/post-login-redirect", () => ({
  getPostLoginRedirectPath: () => "/dashboard",
}))

mock.module("@/server/orpc/client", () => ({
  orpcClient: {
    users: {
      getMe: mock(() =>
        Promise.resolve({
          user: {
            id: "1",
            email: "test@example.com",
            role: "student",
            name: "Test User",
            onboardingCompleted: false,
          },
          company: null,
        }),
      ),
    },
  },
}))

mock.module("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    back: mock(() => {}),
    forward: mock(() => {}),
    refresh: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}))

mock.module("motion/react-client", createMotionReactClientMock)

mock.module("@/components/TurnstileWidget", () => ({
  TurnstileWidget: () => null,
  isTurnstileEnabledOnClient: () => turnstileEnabled,
}))

const { LoginForm } = await import(
  "@/app/[locale]/(auth)/login/_components/LoginForm"
)

describe("LoginForm Arabic localization", () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockToastError.mockClear()
    mockToastSuccess.mockClear()
    turnstileEnabled = false
  })

  afterEach(() => {
    cleanup()
  })

  afterAll(() => {
    mock.restore()
  })

  test("shows Arabic CAPTCHA validation before submitting when Turnstile is enabled", async () => {
    turnstileEnabled = true

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("عنوان البريد الإلكتروني"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText("كلمة المرور"), {
      target: { value: "password123" },
    })

    const form = document.querySelector("form")
    if (form) {
      fireEvent.submit(form)
    }

    await waitFor(() => {
      expect(screen.getByText("يرجى إكمال اختبار CAPTCHA.")).toBeDefined()
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  test("maps backend CAPTCHA errors to Arabic instead of showing raw English", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: "Missing CAPTCHA response" },
    })

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText("عنوان البريد الإلكتروني"), {
      target: { value: "test@example.com" },
    })
    fireEvent.change(screen.getByLabelText("كلمة المرور"), {
      target: { value: "password123" },
    })

    const form = document.querySelector("form")
    if (form) {
      fireEvent.submit(form)
    }

    await waitFor(() => {
      expect(screen.getByText("يرجى إكمال اختبار CAPTCHA.")).toBeDefined()
    })
    expect(screen.queryByText("Missing CAPTCHA response")).toBeNull()
  })
})
