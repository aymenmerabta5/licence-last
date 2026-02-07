"use client"

import { motion } from "motion/react"
import { Briefcase, FileText, LayoutDashboard, Plus, Settings, Users } from "lucide-react"
import { Link } from "@/i18n/routing"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "Total Offers",
    value: "12",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Active Applications",
    value: "48",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Interviews Scheduled",
    value: "8",
    icon: Calendar,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
]

import { Calendar } from "lucide-react"

export default function CompanyDashboard() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 lg:p-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-heading">Company Dashboard</h1>
            <p className="text-muted-foreground">Manage your internship offers and candidates.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/company/create-offer">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5" />
                Create Offer
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Offers</CardTitle>
              <CardDescription>You made 3 offers this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Frontend Developer Intern",
                    type: "Internship",
                    applicants: 12,
                    status: "Active",
                  },
                  {
                    title: "Backend Engineer - Junior",
                    type: "Full-time",
                    applicants: 24,
                    status: "Active",
                  },
                  {
                    title: "UI/UX Designer",
                    type: "Internship",
                    applicants: 5,
                    status: "Draft",
                  },
                ].map((offer, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/5 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{offer.title}</p>
                      <p className="text-sm text-muted-foreground">{offer.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        {offer.applicants} applicants
                      </div>
                      <Badge variant={offer.status === "Active" ? "default" : "secondary"}>
                        {offer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for your team</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                { label: "View All Applicants", icon: Users },
                { label: "Company Profile Settings", icon: Settings },
                { label: "Manage Templates", icon: FileText },
                { label: "Analytics Dashboard", icon: LayoutDashboard },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start h-12 gap-3 hover:bg-secondary/10 hover:text-primary transition-colors"
                >
                  <action.icon className="w-5 h-5 text-muted-foreground" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
