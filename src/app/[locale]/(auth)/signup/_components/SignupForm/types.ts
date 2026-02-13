export type SignupRole = "student" | "company_admin" | "admin"

export interface SignupFormProps {
  role: SignupRole
  onBack: () => void
}

export interface SignupFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}
