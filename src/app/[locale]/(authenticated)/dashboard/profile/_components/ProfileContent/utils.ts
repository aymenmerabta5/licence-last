export const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  company_admin: "Recruiter",
  dept_head: "Dept. Head",
  university_admin: "University Admin",
  super_admin: "Super Admin",
}

export function getInitials(name: string | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatMemberSince(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}
