import { localeRedirect } from "@/lib/navigation"

export default async function ExplorePage() {
  return localeRedirect("/dashboard/student/search")
}
