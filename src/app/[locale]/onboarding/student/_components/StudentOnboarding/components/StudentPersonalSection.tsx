import { FileText, GraduationCap, Hash, Phone, User } from "lucide-react"
import { useTranslations } from "next-intl"
import type {
  OnboardingFormApi,
  StudentDepartmentOption,
} from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/types"
import {
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/form-fields"

interface StudentPersonalSectionProps {
  form: OnboardingFormApi
  departments: StudentDepartmentOption[]
  onDepartmentChange: (departmentId: string) => void
}

export function StudentPersonalSection({
  form,
  departments,
  onDepartmentChange,
}: StudentPersonalSectionProps) {
  const t = useTranslations("onboarding.student")

  return (
    <FormSection title={`01 - ${t("personalSection")}`}>
      <form.Field name="bio">
        {(field) => (
          <TextAreaField
            id="student-bio"
            label={t("bio")}
            placeholder={t("bioPlaceholder")}
            icon={FileText}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="phone">
        {(field) => (
          <TextField
            id="student-phone"
            type="tel"
            label={t("phone")}
            placeholder={t("phonePlaceholder")}
            icon={Phone}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="studentNumber">
        {(field) => (
          <TextField
            id="student-number"
            label={t("studentNumber")}
            placeholder={t("studentNumberPlaceholder")}
            icon={Hash}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="departmentId">
        {(field) => (
          <SelectField
            id="student-department"
            label={t("department")}
            placeholder={t("departmentPlaceholder")}
            icon={GraduationCap}
            options={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
            value={field.state.value}
            onChange={(value) => {
              const departmentId = String(value)
              field.handleChange(departmentId)
              onDepartmentChange(departmentId)
            }}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="level">
        {(field) => (
          <TextField
            id="student-level"
            label={t("level")}
            placeholder={t("levelPlaceholder")}
            icon={User}
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
    </FormSection>
  )
}
