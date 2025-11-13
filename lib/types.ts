export type UserRole = "admin" | "member" | "prospect" | "hangaround" | "guest"

export interface Member {
  id: string
  roadName: string
  realName: string
  phone: string
  email: string
  role: UserRole
  emergencyContact?: string
  joinDate: string
}

export interface Payment {
  id: string
  memberId: string
  amount: number
  dueDate: string
  paidDate?: string
  status: "paid" | "pending" | "overdue"
  notes?: string
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  type: "public" | "member" | "private"
  rsvpList: string[]
}

export interface AuthState {
  isAuthenticated: boolean
  role: UserRole | null
  rememberMe: boolean
}
