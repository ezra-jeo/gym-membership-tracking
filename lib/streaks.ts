import { createClient } from "./supabase"

export async function updateStreak(memberId: string): Promise<{
  currentStreak: number
  bestStreak: number
  isNewBest: boolean
}> {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  // maybeSingle — new members won't have a streak row yet
  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle()

  if (!streak) {
    await supabase.from("streaks").insert({
      member_id: memberId,
      current_streak: 1,
      best_streak: 1,
      last_visit_date: today,
    })
    return { currentStreak: 1, bestStreak: 1, isNewBest: true }
  }

  // Null-coerce — DB columns are number | null per generated types
  const currentStreak = streak.current_streak ?? 0
  const bestStreak = streak.best_streak ?? 0

  // Already visited today — no change
  if (streak.last_visit_date === today) {
    return {
      currentStreak,
      bestStreak,
      isNewBest: false,
    }
  }

  const lastVisit = streak.last_visit_date ? new Date(streak.last_visit_date) : null
  const todayDate = new Date(today)

  let newStreak: number
  if (lastVisit) {
    const diffDays = Math.floor(
      (todayDate.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
    )
    newStreak = diffDays === 1 ? currentStreak + 1 : 1
  } else {
    newStreak = 1
  }

  const newBest = Math.max(newStreak, bestStreak)
  const isNewBest = newBest > bestStreak

  await supabase
    .from("streaks")
    .update({ current_streak: newStreak, best_streak: newBest, last_visit_date: today })
    .eq("member_id", memberId)

  return { currentStreak: newStreak, bestStreak: newBest, isNewBest }
}

export async function getStreak(memberId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("streaks")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle()

  return data
    ? {
        currentStreak: data.current_streak ?? 0,
        bestStreak: data.best_streak ?? 0,
        lastVisitDate: data.last_visit_date,
      }
    : { currentStreak: 0, bestStreak: 0, lastVisitDate: null }
}