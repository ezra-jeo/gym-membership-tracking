export type MembershipPlanId = "monthly" | "weekly" | "walkin"

export interface MembershipPlan {
  id: MembershipPlanId
  name: string
  price: number
  durationDays: number
}

export type MemberStatus = "active" | "expired" | "frozen"
export type PaymentMethod = "cash" | "gcash"

export interface Member {
  id: string
  name: string
  contactNumber: string
  membershipPlanId: MembershipPlanId
  startDate: string // ISO date
  endDate: string // ISO date
  status: MemberStatus
  createdAt: string // ISO date
}

export interface Payment {
  id: string
  memberId: string
  amount: number
  method: PaymentMethod
  description: string
  date: string // ISO date
}

export interface CheckIn {
  id: string
  memberId: string
  checkInTime: string // ISO datetime
  checkOutTime: string | null // ISO datetime or null if still checked in
}
