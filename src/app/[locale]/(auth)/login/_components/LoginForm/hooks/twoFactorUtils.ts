import { authClient } from "@/lib/auth-client"

export type TwoFactorMethod = "totp" | "otp" | "backup"

interface VerifyTwoFactorCodeParams {
  method: TwoFactorMethod
  code: string
  trustDevice: boolean
}

export function verifyTwoFactorCode({
  method,
  code,
  trustDevice,
}: VerifyTwoFactorCodeParams) {
  switch (method) {
    case "totp":
      return authClient.twoFactor.verifyTotp({ code, trustDevice })
    case "otp":
      return authClient.twoFactor.verifyOtp({ code, trustDevice })
    default:
      return authClient.twoFactor.verifyBackupCode({ code, trustDevice })
  }
}
