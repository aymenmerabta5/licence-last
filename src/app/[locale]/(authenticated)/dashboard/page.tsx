import { AdminDashboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard"
import { DeptHeadDashboard } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"
import { StudentDashboard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard"
import { DashboardContent } from "@/app/[locale]/(authenticated)/dashboard/_components/DashboardContent"

export default function DashboardPage() {
  return (
    <DashboardContent
      studentComponent={StudentDashboard}
      recruiterComponent={RecruiterDashboard}
      adminComponent={AdminDashboard}
      deptHeadComponent={DeptHeadDashboard}
    />
  )
}
