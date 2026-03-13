import { afterAll, afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { createMotionReactClientMock } from "@/test/mocks/motion-react-client"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Two-Factor Authentication",
      subtitle: "Enter your verification code to continue",
      codeLabel: "Verification code",
      codePlaceholder: "Enter 6-digit code",
      totp: "Authenticator App",
      otp: "Email Code",
      backup: "Backup Code",
      verify: "Verify",
      sendOtp: "Send Code",
      trustDevice: "Trust this device for 30 days",
      backToLogin: "Back to login",
    }

    return translations[key] ?? key
  },
}))

mock.module("motion/react-client", createMotionReactClientMock)

const { TwoFactorStep } = await import(
  "@/app/[locale]/(auth)/login/_components/LoginForm/components/TwoFactorStep"
)

describe("TwoFactorStep", () => {
  afterAll(() => {
    mock.restore()
  })

  afterEach(() => {
    cleanup()
  })

  test("calls onMethodChange when switching tabs", () => {
    const onMethodChange = mock(() => {})

    render(
      <TwoFactorStep
        method="totp"
        onMethodChange={onMethodChange}
        code=""
        onCodeChange={() => {}}
        trustDevice={false}
        onTrustDeviceChange={() => {}}
        isVerifying={false}
        onVerify={() => {}}
        onSendOtp={() => {}}
        onBack={() => {}}
        serverError=""
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /Email Code/i }))

    expect(onMethodChange).toHaveBeenCalledTimes(1)
    expect(onMethodChange).toHaveBeenCalledWith("otp")
  })

  test("shows send code button only for otp method", () => {
    const { rerender } = render(
      <TwoFactorStep
        method="totp"
        onMethodChange={() => {}}
        code=""
        onCodeChange={() => {}}
        trustDevice={false}
        onTrustDeviceChange={() => {}}
        isVerifying={false}
        onVerify={() => {}}
        onSendOtp={() => {}}
        onBack={() => {}}
        serverError=""
      />,
    )

    expect(screen.queryByRole("button", { name: /Send Code/i })).toBeNull()

    rerender(
      <TwoFactorStep
        method="otp"
        onMethodChange={() => {}}
        code=""
        onCodeChange={() => {}}
        trustDevice={false}
        onTrustDeviceChange={() => {}}
        isVerifying={false}
        onVerify={() => {}}
        onSendOtp={() => {}}
        onBack={() => {}}
        serverError=""
      />,
    )

    expect(screen.getByRole("button", { name: /Send Code/i })).toBeDefined()
  })

  test("calls onVerify when pressing Enter in the code input", () => {
    const onVerify = mock(() => {})

    render(
      <TwoFactorStep
        method="totp"
        onMethodChange={() => {}}
        code="123456"
        onCodeChange={() => {}}
        trustDevice={false}
        onTrustDeviceChange={() => {}}
        isVerifying={false}
        onVerify={onVerify}
        onSendOtp={() => {}}
        onBack={() => {}}
        serverError=""
      />,
    )

    fireEvent.keyDown(screen.getByLabelText("Verification code"), {
      key: "Enter",
    })

    expect(onVerify).toHaveBeenCalledTimes(1)
  })

  test("calls trust-device and back handlers", () => {
    const onTrustDeviceChange = mock(() => {})
    const onBack = mock(() => {})

    render(
      <TwoFactorStep
        method="totp"
        onMethodChange={() => {}}
        code="123456"
        onCodeChange={() => {}}
        trustDevice={false}
        onTrustDeviceChange={onTrustDeviceChange}
        isVerifying={false}
        onVerify={() => {}}
        onSendOtp={() => {}}
        onBack={onBack}
        serverError=""
      />,
    )

    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(screen.getByRole("button", { name: /Back to login/i }))

    expect(onTrustDeviceChange).toHaveBeenCalledWith(true)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  test("disables verify button when code is empty", () => {
    render(
      <TwoFactorStep
        method="totp"
        onMethodChange={() => {}}
        code="   "
        onCodeChange={() => {}}
        trustDevice={false}
        onTrustDeviceChange={() => {}}
        isVerifying={false}
        onVerify={() => {}}
        onSendOtp={() => {}}
        onBack={() => {}}
        serverError=""
      />,
    )

    const verifyButton = screen.getByRole("button", { name: /Verify/i })
    expect(verifyButton.getAttribute("disabled")).not.toBeNull()
  })
})
