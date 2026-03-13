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

// Mock next-intl
mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Create Account",
      subtitle: "Sign up for a new account",
      name: "Full Name",
      namePlaceholder: "John Doe",
      email: "Email",
      emailPlaceholder: "you@university.edu",
      password: "Password",
      passwordPlaceholder: "Create a password",
      passwordHint: "Must be at least 8 characters",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      agreeToTerms: "I agree to the",
      terms: "Terms of Service",
      and: "and",
      privacy: "Privacy Policy",
      submit: "Create Account",
      or: "Or",
      hasAccount: "Already have an account?",
      signIn: "Sign In",
      error: "An error occurred. Please try again.",
      verifyTitle: "Verify your email",
      verifyDescription: "Check your email to complete registration",
      backToLogin: "Back to login",
      back: "Back",
    }
    return translations[key] || key
  },
}))

// Mock auth validation
mock.module("@/lib/schemas/auth", () => ({
  createSignupSchema: () => ({
    safeParse: (data: {
      name: string
      email: string
      password: string
      confirmPassword: string
      agreeToTerms: boolean
    }) => {
      const issues: Array<{ path: (string | number)[]; message: string }> = []

      if (!data.name || data.name.length < 2) {
        issues.push({
          path: ["name"],
          message: "Name must be at least 2 characters",
        })
      }
      if (!data.email || !data.email.includes("@")) {
        issues.push({ path: ["email"], message: "Invalid email" })
      }
      if (!data.password || data.password.length < 8) {
        issues.push({
          path: ["password"],
          message: "Password must be at least 8 characters",
        })
      }
      if (!data.confirmPassword) {
        issues.push({
          path: ["confirmPassword"],
          message: "Please confirm your password",
        })
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
const mockSignUp = mock<
  (
    data: Record<string, unknown>,
  ) => Promise<{ error: Record<string, unknown> | null }>
>(() => Promise.resolve({ error: null }))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: mockSignUp,
    },
  },
}))

// Mock routing
mock.module("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

mock.module("motion/react-client", createMotionReactClientMock)

const { StudentSignupForm } = await import(
  "@/app/[locale]/(auth)/signup/_components/SignupForm/StudentSignupForm"
)

describe("StudentSignupForm", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    mockSignUp.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  describe("rendering", () => {
    test("should render form elements", () => {
      render(<StudentSignupForm onBack={() => {}} />)

      expect(
        screen.getByRole("heading", { name: "Create Account" }),
      ).toBeDefined()
      expect(screen.getByText("Sign up for a new account")).toBeDefined()
      expect(screen.getByLabelText("Full Name")).toBeDefined()
      expect(screen.getByLabelText("Email")).toBeDefined()
      expect(screen.getByLabelText("Password")).toBeDefined()
      expect(screen.getByLabelText("Confirm Password")).toBeDefined()
      expect(
        screen.getByRole("button", { name: /Create Account/i }),
      ).toBeDefined()
    })

    test("should render password hint", () => {
      render(<StudentSignupForm onBack={() => {}} />)
      const hints = screen.getAllByText("Must be at least 8 characters")
      expect(hints.length).toBeGreaterThan(0)
    })

    test("should render terms checkbox", () => {
      render(<StudentSignupForm onBack={() => {}} />)
      const agreeTexts = screen.getAllByText(/I agree to the/i)
      expect(agreeTexts.length).toBeGreaterThan(0)
      expect(screen.getAllByText("Terms of Service").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Privacy Policy").length).toBeGreaterThan(0)
    })

    test("should render login link", () => {
      render(<StudentSignupForm onBack={() => {}} />)
      const loginLinks = screen.getAllByText("Sign In")
      expect(loginLinks.length).toBeGreaterThan(0)
      const loginLink = loginLinks.find(
        (el) => el.closest("a")?.getAttribute("href") === "/login",
      )
      expect(loginLink).toBeDefined()
    })
  })

  describe("form validation", () => {
    test("should show validation error for short name", async () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      fireEvent.change(nameInput, { target: { value: "A" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        const alerts = screen.queryAllByRole("alert")
        expect(alerts.length).toBeGreaterThan(0)
      })
    })

    test("should show validation error for invalid email", async () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
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

    test("should show validation error for short password", async () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "123" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        const alerts = screen.queryAllByRole("alert")
        expect(alerts.length).toBeGreaterThan(0)
      })
    })

    test("should show validation error for missing confirm password", async () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        const alerts = screen.queryAllByRole("alert")
        expect(alerts.length).toBeGreaterThan(0)
      })
    })

    test("should show validation error for terms not agreed", async () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const confirmInput = screen.getByLabelText("Confirm Password")

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.change(confirmInput, { target: { value: "password123" } })

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
      render(<StudentSignupForm onBack={() => {}} />)

      const passwordInput = screen.getByLabelText("Password")
      const toggleButtons = screen.getAllByLabelText("Show password")
      const toggleButton = toggleButtons[0]

      expect(passwordInput.getAttribute("type")).toBe("password")

      fireEvent.click(toggleButton)

      expect(passwordInput.getAttribute("type")).toBe("text")
      expect(screen.getAllByLabelText("Hide password")[0]).toBeDefined()

      fireEvent.click(screen.getAllByLabelText("Hide password")[0])
      expect(passwordInput.getAttribute("type")).toBe("password")
    })

    test("should toggle confirm password visibility", () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const confirmInput = screen.getByLabelText("Confirm Password")
      const toggleButtons = screen.getAllByLabelText("Show password")
      const confirmToggle = toggleButtons[1]

      expect(confirmInput.getAttribute("type")).toBe("password")

      fireEvent.click(confirmToggle)

      expect(confirmInput.getAttribute("type")).toBe("text")
      expect(screen.getAllByLabelText("Hide password").length).toBe(1)
    })
  })

  describe("terms checkbox", () => {
    test("should toggle terms checkbox", () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const checkboxes = screen.getAllByRole("checkbox")
      const checkbox = checkboxes[0] as HTMLInputElement
      expect(checkbox).toBeDefined()
      expect(checkbox.checked).toBe(false)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)

      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })
  })

  describe("form submission", () => {
    test("should call signUp with correct data", async () => {
      mockSignUp.mockResolvedValueOnce({ error: null })

      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const confirmInput = screen.getByLabelText("Confirm Password")
      const termsCheckbox = screen.getAllByRole("checkbox")[0]

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.change(confirmInput, { target: { value: "password123" } })
      fireEvent.click(termsCheckbox)

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(mockSignUp.mock.calls.length).toBe(1)
      })

      const callArg = mockSignUp.mock.calls[0][0] as {
        name: string
        email: string
        password: string
        callbackURL: string
        fetchOptions: { body: { accountType: string } }
      }
      expect(callArg.name).toBe("John Doe")
      expect(callArg.email).toBe("test@example.com")
      expect(callArg.password).toBe("password123")
      expect(callArg.callbackURL).toBe("/")
      expect(callArg.fetchOptions.body.accountType).toBe("student")
    })

    test("should show success state after registration", async () => {
      mockSignUp.mockResolvedValueOnce({ error: null })

      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const confirmInput = screen.getByLabelText("Confirm Password")
      const termsCheckbox = screen.getAllByRole("checkbox")[0]

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.change(confirmInput, { target: { value: "password123" } })
      fireEvent.click(termsCheckbox)

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(screen.getByText("Verify your email")).toBeDefined()
        expect(
          screen.getByText("Check your email to complete registration"),
        ).toBeDefined()
        expect(screen.getByText("Back to login")).toBeDefined()
      })
    })

    test("should show server error on failed registration", async () => {
      mockSignUp.mockResolvedValueOnce({
        error: { message: "Email already exists" },
      })

      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const confirmInput = screen.getByLabelText("Confirm Password")
      const termsCheckbox = screen.getAllByRole("checkbox")[0]

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, {
        target: { value: "existing@example.com" },
      })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.change(confirmInput, { target: { value: "password123" } })
      fireEvent.click(termsCheckbox)

      const form = document.querySelector("form")
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeDefined()
      })
    })
  })

  describe("loading state", () => {
    test("should show loading spinner during submission", async () => {
      mockSignUp.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      const confirmInput = screen.getByLabelText("Confirm Password")
      const termsCheckbox = screen.getAllByRole("checkbox")[0]

      fireEvent.change(nameInput, { target: { value: "John Doe" } })
      fireEvent.change(emailInput, { target: { value: "test@example.com" } })
      fireEvent.change(passwordInput, { target: { value: "password123" } })
      fireEvent.change(confirmInput, { target: { value: "password123" } })
      fireEvent.click(termsCheckbox)

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

  describe("field interactions", () => {
    test("should update name field on change", () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const nameInput = screen.getByLabelText("Full Name") as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: "Jane Smith" } })

      expect(nameInput.value).toBe("Jane Smith")
    })

    test("should update email field on change", () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement
      fireEvent.change(emailInput, { target: { value: "jane@example.com" } })

      expect(emailInput.value).toBe("jane@example.com")
    })

    test("should update password field on change", () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const passwordInput = screen.getByLabelText(
        "Password",
      ) as HTMLInputElement
      fireEvent.change(passwordInput, { target: { value: "mypassword123" } })

      expect(passwordInput.value).toBe("mypassword123")
    })

    test("should update confirm password field on change", () => {
      render(<StudentSignupForm onBack={() => {}} />)

      const confirmInput = screen.getByLabelText(
        "Confirm Password",
      ) as HTMLInputElement
      fireEvent.change(confirmInput, { target: { value: "mypassword123" } })

      expect(confirmInput.value).toBe("mypassword123")
    })
  })
})
