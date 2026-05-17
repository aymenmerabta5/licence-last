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
import { createMotionReactClientMock } from "@/test/mocks/motion-react-client"

// Mock sonner
const mockToastError = mock(() => {})
const mockToastSuccess = mock(() => {})
let turnstileEnabled = false
mock.module("sonner", () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}))

// Mock next-intl
const TRANSLATIONS: Record<string, string> = {
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
  "auth.login.error": "An error occurred. Please try again.",
  "errors.auth.captchaRequired": "Please complete the CAPTCHA challenge.",
  "errors.auth.rateLimitExceeded": "Too many attempts. Please try again later.",
}

mock.module("next-intl", () => ({
  useTranslations: () =>
    Object.assign((key: string) => TRANSLATIONS[key] || key, {
      has: (key: string) => key in TRANSLATIONS,
    }),
}))

// Mock auth validation
mock.module("@/lib/schemas/auth", () => ({
  createLoginSchema: () => ({
    safeParse: (data: { email: string; password: string }) => {
      const issues: Array<{ path: (string | number)[]; message: string }> = []

      if (!data.email?.includes("@")) {
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

// Mock auth client
const mockSignIn = mock<
  (
    credentials: Record<string, unknown>,
  ) => Promise<{ error: Record<string, unknown> | null }>
>(() => Promise.resolve({ error: null }))
const mockSendVerificationEmail = mock<
  (
    data: Record<string, unknown>,
  ) => Promise<{ error: Record<string, unknown> | null }>
>(() => Promise.resolve({ error: null }))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mockSignIn,
    },
    sendVerificationEmail: mockSendVerificationEmail,
  },
}))

// Mock post-login redirect
mock.module("@/lib/post-login-redirect", () => ({
  getPostLoginRedirectPath: () => "/dashboard",
}))

// Mock oRPC client
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

// Mock routing
const mockRouterPush = mock(() => {})
mock.module("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
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
  TurnstileWidget: () => null,
  isTurnstileEnabledOnClient: () => turnstileEnabled,
}))

const { LoginForm } = await import(
  "@/app/[locale]/(auth)/login/_components/LoginForm"
)

describe("LoginForm", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    mockSignIn.mockClear()
    mockSendVerificationEmail.mockClear()
    mockRouterPush.mockClear()
    mockToastError.mockClear()
    mockToastSuccess.mockClear()
    turnstileEnabled = false
  })

  afterEach(() => {
    cleanup()
  })

  describe("rendering", () => {
    test("should render form elements", () => {
      render(<LoginForm />)

      expect(screen.getByText("Welcome Back")).toBeDefined()
      expect(screen.getByText("Sign in to your account")).toBeDefined()
      expect(screen.getByLabelText("Email")).toBeDefined()
      expect(screen.getByLabelText("Password")).toBeDefined()
      expect(screen.getByText("Remember me")).toBeDefined()
      expect(screen.getByText("Sign In")).toBeDefined()
    })

    test("should have password input as password type initially", () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText("Password")
      expect(passwordInput.getAttribute("type")).toBe("password")
    })

    test("should render forgot password link", () => {
      render(<LoginForm />)

      const forgotLink = screen.getByText("Forgot password?")
      expect(forgotLink).toBeDefined()
      expect(forgotLink.closest("a")?.getAttribute("href")).toBe(
        "/reset-password",
      )
    })

    test("should render sign up link", () => {
      render(<LoginForm />)

      const signupLink = screen.getByText("Create one")
      expect(signupLink).toBeDefined()
      expect(signupLink.closest("a")?.getAttribute("href")).toBe("/signup")
    })
  })

  describe("form validation", () => {
    test("should show validation error for invalid email", async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      fireEvent.change(emailInput, { target: { value: "invalid-email" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        const alerts = screen.queryAllByRole("alert")
        expect(alerts.length).toBeGreaterThan(0)
      })
    })

    test("should show validation error for empty password", async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        const alerts = screen.queryAllByRole("alert")
        expect(alerts.length).toBeGreaterThan(0)
      })
    })
  })

  describe("password visibility toggle", () => {
    test("should toggle password visibility", () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText("Password")
      const toggleButton = screen.getByLabelText("Show password")

      expect(passwordInput.getAttribute("type")).toBe("password")

      fireEvent.click(toggleButton)

      expect(passwordInput.getAttribute("type")).toBe("text")
      expect(screen.getByLabelText("Hide password")).toBeDefined()

      fireEvent.click(screen.getByLabelText("Hide password"))
      expect(passwordInput.getAttribute("type")).toBe("password")
    })
  })

  describe("remember me checkbox", () => {
    test("should toggle remember me checkbox", () => {
      render(<LoginForm />)

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement
      expect(checkbox).toBeDefined()
      expect(checkbox.checked).toBe(false)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })
  })

  describe("form submission", () => {
    test("should call signIn with correct data", async () => {
      mockSignIn.mockResolvedValueOnce({ error: null })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(mockSignIn.mock.calls.length).toBe(1)
      })

      const callArg = mockSignIn.mock.calls[0][0] as {
        email: string
        password: string
        rememberMe: boolean
      }
      expect(callArg.email).toBe("test@example.com")
      expect(callArg.password).toBe("password123")
      expect(callArg.rememberMe).toBe(false)
    })

    test("should pass rememberMe to signIn", async () => {
      mockSignIn.mockResolvedValueOnce({ error: null })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const rememberCheckbox = screen.getByRole("checkbox")

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.click(rememberCheckbox)

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(mockSignIn.mock.calls.length).toBe(1)
      })

      const callArg = mockSignIn.mock.calls[0][0] as { rememberMe: boolean }
      expect(callArg.rememberMe).toBe(true)
    })

    test("should show localized CAPTCHA error before submitting when captcha is required", async () => {
      turnstileEnabled = true

      render(<LoginForm />)

      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123" },
      })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(
          screen.getByText("Please complete the CAPTCHA challenge."),
        ).toBeDefined()
      })
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    test("should show server error on failed login", async () => {
      mockSignIn.mockResolvedValueOnce({
        error: { message: "Invalid credentials" },
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(
          screen.getByText("An error occurred. Please try again."),
        ).toBeDefined()
      })
    })

    test("should show verification message for 403 error", async () => {
      mockSignIn.mockResolvedValueOnce({
        error: { status: 403, message: "Email not verified" },
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(screen.getByText("Please verify your email first")).toBeDefined()
        expect(screen.getByText("Resend verification email")).toBeDefined()
      })
    })
  })

  describe("verification email resend", () => {
    test("should resend verification email", async () => {
      mockSignIn.mockResolvedValueOnce({
        error: { status: 403, message: "Email not verified" },
      })
      mockSendVerificationEmail.mockResolvedValueOnce({ error: null })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(screen.getByText("Resend verification email")).toBeDefined()
      })

      const resendButton = screen.getByText("Resend verification email")
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockSendVerificationEmail.mock.calls.length).toBe(1)
        expect(mockToastSuccess).toHaveBeenCalledWith("Verification email sent")
      })

      const callArg = mockSendVerificationEmail.mock.calls[0][0] as {
        email: string
        callbackURL: string
      }
      expect(callArg.email).toBe("test@example.com")
      expect(callArg.callbackURL).toBe("/")
    })

    test("should show error if resend fails", async () => {
      mockSignIn.mockResolvedValueOnce({
        error: { status: 403, message: "Email not verified" },
      })
      mockSendVerificationEmail.mockResolvedValueOnce({
        error: { status: 429, message: "Rate limit exceeded" },
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(screen.getByText("Resend verification email")).toBeDefined()
      })

      const resendButton = screen.getByText("Resend verification email")
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Too many attempts. Please try again later.",
        )
      })
    })
  })

  describe("loading state", () => {
    test("should show loading spinner during submission", async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<LoginForm />)

      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        const buttons = screen.getAllByRole("button")
        const submitButton = buttons.find(
          (b) => b.getAttribute("type") === "submit",
        )
        expect(submitButton).toBeDefined()
        expect(submitButton?.querySelector("svg")).toBeDefined()
      })
    })
  })
})
