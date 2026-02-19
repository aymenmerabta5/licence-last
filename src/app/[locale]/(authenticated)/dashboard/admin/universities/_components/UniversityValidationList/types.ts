import type { UniversityStatus } from "@/lib/schemas/enums"

export interface UniversityListItem {
  id: string
  name: string
  abbreviation: string | null
  phone: string | null
  wilayaCode: number | null
  city: string | null
  address: string | null
  departmentName: string | null
  status: UniversityStatus
  createdAt: Date
}

export interface UpdateUniversityPayload {
  universityId: string
  name?: string
  abbreviation?: string | null
  phone?: string | null
  wilayaCode?: number | null
  city?: string | null
  address?: string | null
}
