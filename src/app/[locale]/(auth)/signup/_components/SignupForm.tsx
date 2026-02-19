"use client"

import { useState } from "react"

import { RoleSelector } from "@/app/[locale]/(auth)/signup/_components/RoleSelector"
import { CompanySignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/CompanySignupForm"
import { StudentSignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/StudentSignupForm"
import { UniversitySignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/UniversitySignupForm"

type Step =
  | "role-selection"
  | "student-form"
  | "company-form"
  | "university-form"

export function SignupForm() {
  const [step, setStep] = useState<Step>("role-selection")

  if (step === "student-form") {
    return <StudentSignupForm onBack={() => setStep("role-selection")} />
  }

  if (step === "company-form") {
    return <CompanySignupForm onBack={() => setStep("role-selection")} />
  }

  if (step === "university-form") {
    return <UniversitySignupForm onBack={() => setStep("role-selection")} />
  }

  return (
    <RoleSelector
      onSelect={(role) => {
        if (role === "student") setStep("student-form")
        else if (role === "company") setStep("company-form")
        else setStep("university-form")
      }}
    />
  )
}
