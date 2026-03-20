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
mock.module("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}))

const TRANSLATIONS: Record<string, Record<string, string>> = {
  "auth.login": {
    title: "Welcome Back",
    subtitle: "Sign in to your account",
    email: "Email",
    emailPlaceholder: "you@university.edu",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    submit: "Sign In",
    or: "Or",
    noAccount: "Don't have an account?",
    createOne: "Create one",
    error: "An error occurred. Please try again.",
    emailNotVerified: "Please verify your email first",
    resendVerification: "Resend verification email",
    verificationSent: "Verification email sent",
  },
  "auth.login.twoFactor": {
    title: "Two-Factor Authentication",
    subtitle: "Enter your verification code to continue",
    codeLabel: "Verification code",
    codePlaceholder: "Enter 6-digit code",
    totp: "Authenticator App",
    otp: "Email Code",
    backup: "Backup Code",
    verify: "Verify",
    sendOtp: "Send Code",
    otpSent: "Code sent to your email",
    trustDevice: "Trust this device for 30 days",
    invalidCode: "Invalid code. Please try again.",
    error: "Verification failed. Please try again.",
    backToLogin: "Back to login",
  },
  "auth.validation": {
    emailInvalid: "Invalid email",
    passwordRequired: "Password required",
  },
}

mock.module("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    TRANSLATIONS[namespace ?? ""]?.[key] ?? key,
}))

mock.module("@/lib/schemas/auth", () => ({
  createLoginSchema: () => ({
    safeParse: (data: { email: string; password: string }) => {
      const issues: Array<{ path: (string | number)[]; message: string }> = []

      if (!data.email || !data.email.includes("@")) {
        issues.push({ path: ["email"], message: "Invalid email" })
      }
      if (!data.password) {
        issues.push({ path: ["password"], message: "Password required" })
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

interface AuthError {
  status?: number
  message?: string
}

interface SignInResult {
  error: AuthError | null
  data?: { twoFactorRedirect?: boolean } | null
}

const mockSignIn = mock((_payload: Record<string, unknown>) =>
  Promise.resolve<SignInResult>({ error: null, data: null }),
)
const mockSendVerificationEmail = mock(() =>
  Promise.resolve<{ error: AuthError | null }>({ error: null }),
)
const mockVerifyTotp = mock(() =>
  Promise.resolve<{ error: AuthError | null }>({ error: null }),
)
const mockVerifyOtp = mock(() =>
  Promise.resolve<{ error: AuthError | null }>({ error: null }),
)
const mockVerifyBackupCode = mock(() =>
  Promise.resolve<{ error: AuthError | null }>({ error: null }),
)
const mockSendOtp = mock(() =>
  Promise.resolve<{ error: AuthError | null }>({ error: null }),
)

mock.module("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mockSignIn,
    },
    sendVerificationEmail: mockSendVerificationEmail,
    twoFactor: {
      verifyTotp: mockVerifyTotp,
      verifyOtp: mockVerifyOtp,
      verifyBackupCode: mockVerifyBackupCode,
      sendOtp: mockSendOtp,
    },
  },
}))

mock.module("@/lib/post-login-redirect", () => ({
  getPostLoginRedirectPath: () => "/dashboard",
}))

const mockGetMe = mock(() =>
  Promise.resolve({
    user: {
      id: "student-1",
      email: "test.student@example.com",
      role: "student",
      name: "Test Student",
      onboardingCompleted: true,
    },
    company: null,
  }),
)

mock.module("@/server/orpc/client", () => ({
  orpcClient: {
    users: {
      getMe: mockGetMe,
    },
  },
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
  },
}))

const mockRouterPush = mock(() => {})
mock.module("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: mockRouterPush,
    replace: mock(() => {}),
    back: mock(() => {}),
    forward: mock(() => {}),
    refresh: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}))

mock.module("motion/react-client", createMotionReactClientMock)

mock.module("@/components/TurnstileWidget", () => ({
  TurnstileWidget: () => <div data-testid="turnstile-widget" />,
}))

const { LoginForm } = await import(
  "@/app/[locale]/(auth)/login/_components/LoginForm"
)

async function openTwoFactorStep() {
  const emailInput = screen.getByLabelText("Email")
  const passwordInput = screen.getByLabelText("Password")

  fireEvent.change(emailInput, { target: { value: "test@example.com" } })
  fireEvent.change(passwordInput, { target: { value: "password123" } })

  const form = document.querySelector("form")
  if (form) {
    fireEvent.submit(form)
  }

  await waitFor(() => {
    expect(screen.getByText("Two-Factor Authentication")).toBeDefined()
  })
}

describe("LoginForm 2FA flows", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    mockSignIn.mockClear()
    mockSendVerificationEmail.mockClear()
    mockVerifyTotp.mockClear()
    mockVerifyOtp.mockClear()
    mockVerifyBackupCode.mockClear()
    mockSendOtp.mockClear()
    mockGetMe.mockClear()
    mockRouterPush.mockClear()
    mockToastError.mockClear()
    mockToastSuccess.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  test("switches to TwoFactorStep when sign-in requires 2FA", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: null,
      data: { twoFactorRedirect: true },
    })

    render(<LoginForm />)
    await openTwoFactorStep()

    expect(mockRouterPush).toHaveBeenCalledTimes(0)
  })

  test("verifies TOTP code and redirects after success", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: null,
      data: { twoFactorRedirect: true },
    })
    mockVerifyTotp.mockResolvedValueOnce({ error: null })

    render(<LoginForm />)
    await openTwoFactorStep()

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }))

    await waitFor(() => {
      expect(mockVerifyTotp).toHaveBeenCalledWith({
        code: "123456",
        trustDevice: false,
      })
    })

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard")
    })
  })

  test("shows invalid-code message when verification fails", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: null,
      data: { twoFactorRedirect: true },
    })
    mockVerifyTotp.mockResolvedValueOnce({
      error: { message: "Invalid code" },
    })

    render(<LoginForm />)
    await openTwoFactorStep()

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }))

    await waitFor(() => {
      expect(screen.getByText("Invalid code. Please try again.")).toBeDefined()
    })

    expect(mockRouterPush).toHaveBeenCalledTimes(0)
  })

  test("supports OTP method and sends OTP code", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: null,
      data: { twoFactorRedirect: true },
    })
    mockSendOtp.mockResolvedValueOnce({ error: null })

    render(<LoginForm />)
    await openTwoFactorStep()

    fireEvent.click(screen.getByRole("tab", { name: /Email Code/i }))
    fireEvent.click(screen.getByRole("button", { name: /Send Code/i }))

    await waitFor(() => {
      expect(mockSendOtp).toHaveBeenCalledTimes(1)
      expect(mockToastSuccess).toHaveBeenCalledWith("Code sent to your email")
    })
  })

  test("uses OTP verifier when OTP method is selected", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: null,
      data: { twoFactorRedirect: true },
    })
    mockVerifyOtp.mockResolvedValueOnce({ error: null })

    render(<LoginForm />)
    await openTwoFactorStep()

    fireEvent.click(screen.getByRole("tab", { name: /Email Code/i }))
    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "654321" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Verify/i }))

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        code: "654321",
        trustDevice: false,
      })
    })
  })

  test("returns to login form from TwoFactorStep", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: null,
      data: { twoFactorRedirect: true },
    })

    render(<LoginForm />)
    await openTwoFactorStep()

    fireEvent.click(screen.getByRole("button", { name: /Back to login/i }))

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeDefined()
      expect(screen.getByLabelText("Password")).toBeDefined()
    })
  })
})
