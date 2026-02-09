"use client"

import { useState } from "react"

import { RoleSelector } from "./RoleSelector"
import { StudentSignupForm } from "./SignupForm/StudentSignupForm"
import { CompanySignupForm } from "./SignupForm/CompanySignupForm"

type Step = "role-selection" | "student-form" | "company-form"

export function SignupForm() {
  const [step, setStep] = useState<Step>("role-selection")

  if (step === "student-form") {
    return <StudentSignupForm onBack={() => setStep("role-selection")} />
  }

  if (step === "company-form") {
    return <CompanySignupForm onBack={() => setStep("role-selection")} />
  }

  return (
    <RoleSelector
      onSelect={(role) =>
        setStep(role === "student" ? "student-form" : "company-form")
      }
    />
  )
}
