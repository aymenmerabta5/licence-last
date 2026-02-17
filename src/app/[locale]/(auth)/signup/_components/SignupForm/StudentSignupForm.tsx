"use client"

import { SignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/index"

import type { SignupFormProps } from "@/app/[locale]/(auth)/signup/_components/SignupForm/types"

export function StudentSignupForm({ onBack }: Omit<SignupFormProps, "role">) {
  return <SignupForm role="student" onBack={onBack} />
}
