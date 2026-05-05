export interface DepartmentItem {
  id: string
  name: string
  headUserId: string | null
  headUserName: string | null
  headUserEmail: string | null
  skillCount: number
  createdAt: Date | string
  fieldName: string | null
  fieldId: string | null
}
