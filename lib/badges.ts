import { createClient } from "./supabase"
import type { Badge, BadgeCriteria } from "./types"

/**
 * Check all badge criteria for a member and award any newly earned badges.
 * Returns the list of badges that were just earned (empty if none).
 */
export async function evaluateBadges(
  memberId: string
): Promise<Badge[]> {
  const supabase = createClient()

  // Fetch all badges and the member's already-earned badges
  const [{ data: allBadges }, { data: earnedBadges }] = await Promise.all([
    supabase.from("badges").select("*"),
    supabase.from("member_badges").select("badge_id").eq("member_id", memberId),
  ])

  if (!allBadges) return []

  const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) ?? [])
  const unearnedBadges = allBadges.filter((b) => !earnedIds.has(b.id))

  if (unearnedBadges.length === 0) return []

  // Gather member stats needed for evaluation
  const stats = await getMemberBadgeStats(memberId)

  const newlyEarned: Badge[] = []

  for (const badge of unearnedBadges) {
    const criteria = badge.criteria as unknown as BadgeCriteria
    const met = checkCriteria(criteria, stats)

    if (met) {
      const { error } = await supabase.from("member_badges").insert({
        member_id: memberId,
        badge_id: badge.id,
      })

      if (!error) {
        newlyEarned.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          criteria,
        })
      }
    }
  }

  return newlyEarned
}

interface BadgeStats {
  totalVisits: number
  earlyBirdCount: number
  currentStreak: number
}

async function getMemberBadgeStats(memberId: string): Promise<BadgeStats> {
  const supabase = createClient()

  const [{ count: totalVisits }, { count: earlyBirdCount }, { data: streak }] =
    await Promise.all([
      supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("member_id", memberId),
      supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("member_id", memberId)
        .lt("check_in", new Date().toISOString().split("T")[0] + "T07:00:00"),
      supabase
        .from("streaks")
        .select("current_streak")
        .eq("member_id", memberId)
        .single(),
    ])

  return {
    totalVisits: totalVisits ?? 0,
    earlyBirdCount: earlyBirdCount ?? 0,
    currentStreak: streak?.current_streak ?? 0,
  }
}

function checkCriteria(criteria: BadgeCriteria, stats: BadgeStats): boolean {
  switch (criteria.type) {
    case "visit_count":
      return stats.totalVisits >= criteria.threshold
    case "early_bird":
      return stats.earlyBirdCount >= criteria.threshold
    case "streak":
      return stats.currentStreak >= criteria.threshold
    default:
      return false
  }
}
