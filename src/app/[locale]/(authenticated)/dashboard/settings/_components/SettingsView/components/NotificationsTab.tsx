import { Bell } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface NotificationsTabProps {
  email: string
}

export function NotificationsTab({ email }: NotificationsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="p-8">
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" /> Notifications
          </CardTitle>
          <CardDescription className="font-medium">
            Notification preferences are coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-sm text-muted-foreground">
            For now, important updates are sent to your primary email: {email}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
