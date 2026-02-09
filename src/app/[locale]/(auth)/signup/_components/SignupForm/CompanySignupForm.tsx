"use client"

import { SignupForm } from "./index"

import type { SignupFormProps } from "./types"

export function CompanySignupForm({ onBack }: Omit<SignupFormProps, "role">) {
  return <SignupForm role="company_admin" onBack={onBack} />
}
