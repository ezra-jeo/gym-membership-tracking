// ============================================
// Original types (kept for backward compatibility)
// ============================================

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

// ============================================
// Engagement types (GymPulse pivot)
// ============================================

export type UserRole = "member" | "admin" | "staff" | "owner"
export type ProfileStatus = "pending" | "active" | "rejected"

export interface Gym {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  createdAt: string
}

export interface Profile {
  id: string
  email: string
  name: string
  contactNumber: string | null
  role: UserRole
  status: ProfileStatus
  gymId: string | null
  avatarUrl: string | null
  qrCode: string
  createdAt: string
}

export interface Membership {
  id: string
  memberId: string
  planId: string
  startDate: string
  endDate: string
  status: MemberStatus
  paymentMethod: PaymentMethod
  amountPaid: number
  createdAt: string
}

export interface Attendance {
  id: string
  memberId: string
  checkIn: string
  checkOut: string | null
  durationMin: number | null
}

export interface Streak {
  id: string
  memberId: string
  currentStreak: number
  bestStreak: number
  lastVisitDate: string | null
}

export type BadgeCriteriaType = "visit_count" | "early_bird" | "streak"

export interface BadgeCriteria {
  type: BadgeCriteriaType
  threshold: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  criteria: BadgeCriteria
}

export interface MemberBadge {
  memberId: string
  badgeId: string
  earnedAt: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  goalType: string
  goalTarget: number
  startDate: string
  endDate: string
  reward: string | null
  createdBy: string
  createdAt: string
}

export interface ChallengeParticipant {
  challengeId: string
  memberId: string
  progress: number
  completed: boolean
  joinedAt: string
}

export type FeedItemType = "check_in" | "check_out" | "badge" | "challenge" | "announcement" | "streak_milestone"

export interface FeedItem {
  id: string
  memberId: string
  type: FeedItemType
  title: string
  description: string | null
  metadata: Record<string, unknown> | null
  kudosCount: number
  createdAt: string
  // Joined data (optional, populated by queries)
  memberName?: string
  memberAvatar?: string | null
  hasKudosed?: boolean
}

export interface Kudos {
  id: string
  fromMember: string
  feedItemId: string
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  createdBy: string
  createdAt: string
}

// ============================================
// Engagement Stats (derived, for UI)
// ============================================

export interface MemberStats {
  totalVisits: number
  monthlyVisits: number
  currentStreak: number
  bestStreak: number
  avgSessionMinutes: number
  badgesEarned: number
  totalBadges: number
  leaderboardRank: number | null
}

export interface LeaderboardEntry {
  memberId: string
  memberName: string
  avatarUrl: string | null
  value: number // visits, minutes, or streak count
  rank: number
}
