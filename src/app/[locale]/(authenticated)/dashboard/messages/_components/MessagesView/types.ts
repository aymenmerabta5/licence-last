export type MessagesRole = "student" | "company_admin"

export interface MessageThread {
  id: string
  offerId: string
  offerTitle: string
  lastMessageAt: Date | string
  createdAt: Date | string
  hasUnread: boolean
  unreadCount: number
  companyId?: string
  companyName?: string | null
  companyLogoUrl?: string | null
  studentUserId?: string
  studentName?: string | null
  studentImage?: string | null
}

export interface MessageConversationStarter {
  id: string
  offerId: string
  offerTitle: string
  companyId?: string
  companyName?: string | null
  companyLogoUrl?: string | null
  studentUserId?: string
  studentName?: string | null
  studentImage?: string | null
}

export interface MessageThreadDetails {
  id: string
  offerId: string
  companyId: string
  studentUserId: string
  lastMessageAt: Date | string
  createdAt: Date | string
}

export interface ThreadMessage {
  id: string
  senderUserId: string
  body: string
  createdAt: Date | string
  senderName: string | null
  senderImage: string | null
}

export interface ThreadReadState {
  lastReadMessageId: string
  lastReadAt: Date | string
}

export interface ThreadMessagesResponse {
  thread: MessageThreadDetails
  messages: ThreadMessage[]
  readState: ThreadReadState | null
}
