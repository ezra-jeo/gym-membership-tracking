import { createClient } from "./supabase"
import { updateStreak } from "./streaks"
import { evaluateBadges } from "./badges"
import type { Badge } from "./types"

export interface CheckInResult {
  status: "checked_in" | "checked_out"
  attendanceId: string
  streak: {
    currentStreak: number
    bestStreak: number
    isNewBest: boolean
  } | null
  newBadges: Badge[]
  durationMin: number | null
}

/**
 * Handle a QR scan / check-in toggle.
 * If no open session → check in + run engagement hooks.
 * If open session → check out.
 */
export async function handleScan(memberId: string): Promise<CheckInResult> {
  const supabase = createClient()

  // Fetch member's gym_id — needed for RLS-compliant inserts
  const { data: memberProfile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", memberId)
    .maybeSingle()

  const gymId = memberProfile?.gym_id ?? null

  // Check for an open session (checked in but not out)
  const { data: openSession } = await supabase
    .from("attendance")
    .select("*")
    .eq("member_id", memberId)
    .is("check_out", null)
    .order("check_in", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!openSession) {
    // ── CHECK IN ──
    const { data: attendance, error } = await supabase
      .from("attendance")
      .insert({ member_id: memberId, gym_id: gymId })
      .select()
      .maybeSingle()

    if (error || !attendance) {
      throw new Error("Failed to check in: " + error?.message)
    }

    // Run engagement hooks in parallel
    const [streakResult, newBadges] = await Promise.all([
      updateStreak(memberId),
      evaluateBadges(memberId),
      postCheckInFeedItem(memberId, gymId),
    ])

    // Post badge feed items
    for (const badge of newBadges) {
      await postBadgeFeedItem(memberId, gymId, badge)
    }

    // Post streak milestone feed items
    if (streakResult.currentStreak > 0 && streakResult.currentStreak % 7 === 0) {
      await postStreakMilestoneFeedItem(memberId, gymId, streakResult.currentStreak)
    }

    // Update challenge progress
    await updateChallengeProgress(memberId)

    return {
      status: "checked_in",
      attendanceId: attendance.id,
      streak: streakResult,
      newBadges,
      durationMin: null,
    }
  } else {
    // ── CHECK OUT ──
    const now = new Date().toISOString()
    const { data: updated, error } = await supabase
      .from("attendance")
      .update({ check_out: now })
      .eq("id", openSession.id)
      .select()
      .maybeSingle()

    if (error || !updated) {
      throw new Error("Failed to check out: " + error?.message)
    }

    const checkInTime = new Date(openSession.check_in).getTime()
    const checkOutTime = new Date(now).getTime()
    const durationMin = Math.round((checkOutTime - checkInTime) / 60000)

    return {
      status: "checked_out",
      attendanceId: openSession.id,
      streak: null,
      newBadges: [],
      durationMin,
    }
  }
}

async function postCheckInFeedItem(memberId: string, gymId: string | null) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", memberId)
    .maybeSingle()

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("member_id", memberId)
    .maybeSingle()

  const streakText =
    streak && streak.current_streak > 1 ? ` 🔥 ${streak.current_streak}-day streak!` : ""

  const hour = new Date().getHours()
  const timeOfDay =
    hour < 7
      ? "🌅 Early morning"
      : hour < 12
      ? "☀️ Morning"
      : hour < 17
      ? "🌤️ Afternoon"
      : "🌙 Evening"

  await supabase.from("feed_items").insert({
    member_id: memberId,
    gym_id: gymId,
    type: "check_in",
    title: `${profile?.name ?? "Someone"} checked in`,
    description: `${timeOfDay} workout${streakText}`,
  })
}

async function postBadgeFeedItem(memberId: string, gymId: string | null, badge: Badge) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", memberId)
    .maybeSingle()

  await supabase.from("feed_items").insert({
    member_id: memberId,
    gym_id: gymId,
    type: "badge",
    title: `${profile?.name ?? "Someone"} earned ${badge.icon} ${badge.name}!`,
    description: badge.description,
    metadata: { badge_id: badge.id, badge_name: badge.name, badge_icon: badge.icon },
  })
}

async function postStreakMilestoneFeedItem(
  memberId: string,
  gymId: string | null,
  streak: number
) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", memberId)
    .maybeSingle()

  await supabase.from("feed_items").insert({
    member_id: memberId,
    gym_id: gymId,
    type: "streak_milestone",
    title: `${profile?.name ?? "Someone"} hit a ${streak}-day streak! 🔥`,
    description: `${streak} consecutive days at the gym`,
    metadata: { streak_count: streak },
  })
}

async function updateChallengeProgress(memberId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: participations } = await supabase
    .from("challenge_participants")
    .select("*, challenges(*)")
    .eq("member_id", memberId)
    .eq("completed", false)

  if (!participations) return

  for (const participation of participations) {
    const challenge = participation.challenges as unknown as {
      goal_type: string
      goal_target: number
      start_date: string
      end_date: string
    }

    if (!challenge || today > challenge.end_date || today < challenge.start_date) continue

    if (challenge.goal_type === "visit_count") {
      const newProgress = participation.progress + 1
      const completed = newProgress >= challenge.goal_target

      await supabase
        .from("challenge_participants")
        .update({ progress: newProgress, completed })
        .eq("challenge_id", participation.challenge_id)
        .eq("member_id", memberId)
    }
  }
}