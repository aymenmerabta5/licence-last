export interface NavbarUser {
  id: string
  name: string | null
  email: string
  role: string | null | undefined
  effectiveRole?: string | null
}

export interface DeviceSession {
  session: {
    id: string
    token: string
    userId: string
    expiresAt: Date
  }
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    role?: string | null
  }
}
