"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { orpc } from "@/server/orpc/client"

interface DepartmentSelectProps {
  universityId: string
  departmentId: string
  onChange: (id: string) => void
}

export function DepartmentSelect({
  universityId,
  departmentId,
  onChange,
}: DepartmentSelectProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const departmentsQuery = useQuery(
    orpc.departments.list.queryOptions({
      input: { universityId },
    }),
  )

  return (
    <div className="space-y-2">
      <Label>{t("fields.department")}</Label>
      <Select
        value={departmentId}
        onValueChange={(v) => onChange(v ?? "")}
        items={[
          { value: "", label: t("fields.noDepartment") },
          ...(departmentsQuery.data?.map((d) => ({
            value: d.id,
            label: d.name,
          })) ?? []),
        ]}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("fields.selectDepartment")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t("fields.noDepartment")}</SelectItem>
          {departmentsQuery.data?.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
