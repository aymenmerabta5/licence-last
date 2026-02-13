"use client"

import { SignupForm } from "./index"

import type { SignupFormProps } from "./types"

export function UniversitySignupForm({ onBack }: Omit<SignupFormProps, "role">) {
  return <SignupForm role="admin" onBack={onBack} />
}
