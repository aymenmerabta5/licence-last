"use client"

import { SignupForm } from "./index"

import type { SignupFormProps } from "./types"

export function StudentSignupForm({ onBack }: Omit<SignupFormProps, "role">) {
  return <SignupForm role="student" onBack={onBack} />
}
