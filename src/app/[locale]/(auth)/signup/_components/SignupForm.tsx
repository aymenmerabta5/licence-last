"use client"

import { useState } from "react"

import { RoleSelector } from "@/app/[locale]/(auth)/signup/_components/RoleSelector"
import { CompanySignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/CompanySignupForm"
import { StudentSignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/StudentSignupForm"
import { UniversitySignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm/UniversitySignupForm"
import type { SignupRole } from "@/app/[locale]/(auth)/signup/_components/SignupForm/types"

export function SignupForm() {
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null)

  const handleBack = () => setSelectedRole(null)

  if (!selectedRole) {
    return (
      <RoleSelector onSelect={(role) => setSelectedRole(role as SignupRole)} />
    )
  }

  switch (selectedRole) {
    case "student":
      return <StudentSignupForm onBack={handleBack} />
    case "company_admin":
      return <CompanySignupForm onBack={handleBack} />
    case "university_admin":
      return <UniversitySignupForm onBack={handleBack} />
  }
}
