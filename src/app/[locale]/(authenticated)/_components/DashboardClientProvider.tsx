"use client"

import { createContext, useContext, useState } from "react"
import { DashboardNavbar } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar"
import { DashboardSidebar } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar"
import { ImpersonationBanner } from "@/components/ImpersonationBanner"

const DashboardContext = createContext<{
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  companyMembershipRole: string | null
}>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  companyMembershipRole: null,
})

export const useDashboard = () => useContext(DashboardContext)

export function DashboardClientProvider({
  children,
  user,
  impersonatedBy,
  companyMembershipRole = null,
}: {
  children: React.ReactNode
  user: {
    id: string
    name: string | null
    email: string
    role: string | null | undefined
  }
  impersonatedBy?: string | null
  companyMembershipRole?: string | null
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <DashboardContext.Provider
      value={{ isSidebarOpen, setIsSidebarOpen, companyMembershipRole }}
    >
      {impersonatedBy && (
        <ImpersonationBanner userName={user.name ?? user.email} />
      )}

      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] selection:bg-primary/10 selection:text-primary">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <DashboardSidebar
            role={user.role as string}
            companyMembershipRole={companyMembershipRole}
          />
        </div>

        {/* Mobile Sidebar — Overlay backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden transition-all duration-500 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar — Drawer */}
        <div
          className={`fixed inset-y-0 start-0 z-50 lg:hidden transform transition-all duration-500 ease-[cubic-bezier(0.4,1,0.2,1)] ${isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
        >
          <div className="bg-background h-full shadow-2xl shadow-foreground/5">
            <DashboardSidebar
              role={user.role as string}
              companyMembershipRole={companyMembershipRole}
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden bg-background">
          <DashboardNavbar user={user} />

          <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10 overflow-y-auto w-full max-h-[calc(100vh-96px)] scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full pb-10">{children}</div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
