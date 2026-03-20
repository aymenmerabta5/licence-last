"use client"

import { Suspense, createContext, useContext, useState } from "react"
import { DashboardNavbar } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar"
import { DashboardSidebar } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar"
import { ImpersonationBanner } from "@/components/ImpersonationBanner"

const DashboardContext = createContext<{
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  companyMembershipRole: string | null
  universityMembershipRole: string | null
  universityDepartmentId: string | null
}>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  companyMembershipRole: null,
  universityMembershipRole: null,
  universityDepartmentId: null,
})

export const useDashboard = () => useContext(DashboardContext)

function DashboardSidebarFallback() {
  return (
    <aside className="h-screen w-20 lg:w-[260px] border-e border-border bg-background" />
  )
}

function DashboardNavbarFallback() {
  return (
    <header className="sticky top-0 z-20 h-24 border-b border-border bg-background" />
  )
}

export function DashboardClientProvider({
  children,
  user,
  impersonatedBy,
  companyMembershipRole = null,
  universityMembershipRole = null,
  universityDepartmentId = null,
}: {
  children: React.ReactNode
  user: {
    id: string
    name: string | null
    email: string
    role: string | null | undefined
    effectiveRole?: string | null
  }
  impersonatedBy?: string | null
  companyMembershipRole?: string | null
  universityMembershipRole?: string | null
  universityDepartmentId?: string | null
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const effectiveRole = user.effectiveRole ?? user.role ?? "student"

  return (
    <DashboardContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        companyMembershipRole,
        universityMembershipRole,
        universityDepartmentId,
      }}
    >
      {impersonatedBy && (
        <ImpersonationBanner userName={user.name ?? user.email} />
      )}

      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] selection:bg-primary/10 selection:text-primary">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Suspense fallback={<DashboardSidebarFallback />}>
            <DashboardSidebar
              role={effectiveRole}
              companyMembershipRole={companyMembershipRole}
            />
          </Suspense>
        </div>

        {/* Mobile Sidebar — Overlay backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden transition-all duration-500 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Shared Sidebar */}
        <div
          className={`fixed inset-y-0 start-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.4,1,0.2,1)] lg:static lg:z-auto lg:translate-x-0 lg:opacity-100 lg:shrink-0 ${isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none lg:pointer-events-auto"}`}
        >
          <div className="bg-background h-full shadow-2xl shadow-foreground/5 lg:shadow-none">
            <Suspense fallback={<DashboardSidebarFallback />}>
              <DashboardSidebar
                role={effectiveRole}
                companyMembershipRole={companyMembershipRole}
              />
            </Suspense>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden bg-background">
          <Suspense fallback={<DashboardNavbarFallback />}>
            <DashboardNavbar user={{ ...user, effectiveRole }} />
          </Suspense>

          <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10 overflow-y-auto w-full max-h-[calc(100vh-96px)] scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full pb-10">{children}</div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
