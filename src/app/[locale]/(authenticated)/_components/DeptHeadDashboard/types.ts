export interface DeptHeadDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export interface PendingApplicationItem {
  id: string
  student: {
    name: string | null
  }
  company: {
    name: string
  }
  companyActionAt: Date | string | null
}

export interface DeptHeadDashboardLabels {
  pendingLabel: string
  queueStatusLabel: string
  queueBusy: string
  queueClear: string
  recentTitle: string
  empty: string
  acceptedOn: string
}
